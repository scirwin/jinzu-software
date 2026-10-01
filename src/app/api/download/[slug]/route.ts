import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidHttpUrl } from "@/lib/types";

const BUCKET = "app-downloads";
const SIGNED_URL_TTL_SECONDS = 60;
const MAX_TOKEN_LENGTH = 200;

/** order_status values that count as a confirmed purchase. */
const CONFIRMED_ORDER_STATUSES = ["confirmed", "fulfilled"];

/**
 * Download endpoint: GET /api/download/[slug]  (gated: ?token=<grant token>)
 *
 * Re-checks everything server-side (never trusts the public page's
 * rendered button state).
 *
 * UNGATED apps (download_gated = false): unchanged behavior — a
 * short-lived signed Storage URL for the uploaded APK, open to anyone.
 * The `app-downloads` bucket is private with no client-facing policies,
 * so this route (service-role client) is the only way to reach an APK.
 *
 * GATED apps (download_gated = true): a valid grant token is required.
 * A grant is honored only when ALL of these hold:
 *   - the token exists in `download_grants`
 *   - its order belongs to THIS application
 *   - the order is authorized: payment_status = 'paid',
 *     order_status in ('confirmed', 'fulfilled'), download_authorized = true
 *   - the grant is not revoked and not expired
 *   - download_count has not reached max_downloads (null = unlimited)
 *   - the application is active, not deleted, and a download exists
 *     (uploaded APK with download_enabled, or an external download_url)
 * The APK is served as a signed URL; an app with no APK falls back to its
 * external download_url, which is only ever revealed via this route.
 *
 * Nothing here creates grants or confirms payments — see
 * lib/actions/downloads.ts (issueDownloadGrant) for grant issuance.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let service;
  try {
    service = createServiceClient();
  } catch (err) {
    console.error("download route: service client unavailable:", err);
    return NextResponse.json(
      { error: "Downloads are temporarily unavailable." },
      { status: 503 }
    );
  }

  const { data: app, error } = await service
    .from("applications")
    .select(
      "id, status, active, deleted_at, apk_storage_path, download_url, download_enabled, download_gated"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("download route: failed to load application:", error.message);
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (!app || !app.active || app.deleted_at !== null) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (app.status === "maintenance" || app.status === "discontinued") {
    return NextResponse.json(
      { error: "This application is not currently available for download." },
      { status: 404 }
    );
  }

  const hasApk = Boolean(app.apk_storage_path && app.download_enabled);

  // ---- UNGATED: existing public APK behavior, unchanged. ----
  if (!app.download_gated) {
    if (!hasApk) {
      return NextResponse.json(
        { error: "No download is available for this application yet." },
        { status: 404 }
      );
    }
    const { data: signed, error: signError } = await service.storage
      .from(BUCKET)
      .createSignedUrl(app.apk_storage_path as string, SIGNED_URL_TTL_SECONDS);

    if (signError || !signed) {
      console.error("download route: failed to sign URL:", signError?.message);
      return NextResponse.json(
        { error: "Could not prepare the download. Please try again." },
        { status: 500 }
      );
    }
    return NextResponse.redirect(signed.signedUrl);
  }

  // ---- GATED: requires a valid, unexpired grant for a confirmed order. ----
  const externalUrl = isValidHttpUrl(app.download_url) ? app.download_url : null;
  if (!hasApk && !externalUrl) {
    return NextResponse.json(
      { error: "No download is available for this application yet." },
      { status: 404 }
    );
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token || token.length > MAX_TOKEN_LENGTH) {
    return NextResponse.json(
      {
        error:
          "This download requires a completed purchase. Use the personal download link issued for your order.",
      },
      { status: 402 }
    );
  }

  const { data: grant, error: grantError } = await service
    .from("download_grants")
    .select("id, order_id, expires_at, max_downloads, download_count, revoked")
    .eq("token", token)
    .maybeSingle();

  if (grantError) {
    console.error("download route: failed to load grant:", grantError.message);
    return NextResponse.json(
      { error: "Downloads are temporarily unavailable." },
      { status: 503 }
    );
  }

  const invalid = () =>
    NextResponse.json(
      { error: "This download link is not valid." },
      { status: 403 }
    );

  if (!grant) return invalid();

  const { data: order, error: orderError } = await service
    .from("orders")
    .select("id, application_id, payment_status, order_status, download_authorized")
    .eq("id", grant.order_id)
    .maybeSingle();

  if (orderError) {
    console.error("download route: failed to load order:", orderError.message);
    return NextResponse.json(
      { error: "Downloads are temporarily unavailable." },
      { status: 503 }
    );
  }

  if (
    !order ||
    order.application_id !== app.id ||
    order.payment_status !== "paid" ||
    !CONFIRMED_ORDER_STATUSES.includes(order.order_status) ||
    order.download_authorized !== true ||
    grant.revoked
  ) {
    return invalid();
  }

  const expiresAt = new Date(grant.expires_at).getTime();
  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    return NextResponse.json(
      { error: "This download link has expired." },
      { status: 410 }
    );
  }

  if (grant.max_downloads !== null && grant.download_count >= grant.max_downloads) {
    return NextResponse.json(
      { error: "This download link has reached its download limit." },
      { status: 410 }
    );
  }

  // Resolve the target BEFORE consuming a download, so a signing failure
  // doesn't burn one.
  let target: string;
  if (hasApk) {
    const { data: signed, error: signError } = await service.storage
      .from(BUCKET)
      .createSignedUrl(app.apk_storage_path as string, SIGNED_URL_TTL_SECONDS);
    if (signError || !signed) {
      console.error("download route: failed to sign URL:", signError?.message);
      return NextResponse.json(
        { error: "Could not prepare the download. Please try again." },
        { status: 500 }
      );
    }
    target = signed.signedUrl;
  } else {
    target = externalUrl as string;
  }

  // Consume one download. The extra .eq on download_count makes this an
  // optimistic compare-and-set, so two simultaneous requests can't both
  // slip past the last remaining download.
  const { data: bumped, error: bumpError } = await service
    .from("download_grants")
    .update({ download_count: grant.download_count + 1 })
    .eq("id", grant.id)
    .eq("download_count", grant.download_count)
    .select("id")
    .maybeSingle();

  if (bumpError) {
    console.error("download route: failed to record download:", bumpError.message);
    return NextResponse.json(
      { error: "Could not prepare the download. Please try again." },
      { status: 500 }
    );
  }
  if (!bumped) {
    return NextResponse.json(
      { error: "Please try again." },
      { status: 409 }
    );
  }

  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
