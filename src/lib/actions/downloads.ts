"use server";

import { randomBytes } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidHttpUrl } from "@/lib/types";
import { requireUser } from "./apps";

// Grant defaults. `download_grants.expires_at` is NOT NULL with no DB
// default, so a value is required; callers may override per grant.
const DEFAULT_EXPIRES_IN_DAYS = 7;
const DEFAULT_MAX_DOWNLOADS = 3;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type IssueGrantResult =
  | { ok: true; token: string; path: string; expiresAt: string }
  | { ok: false; error: string };

/**
 * Issue a download grant for an order that is ALREADY authorized.
 *
 * This never confirms payment or authorizes anything itself. It only
 * refuses unless the order is already in the existing confirmed state:
 *   payment_status = 'paid'
 *   order_status   in ('confirmed', 'fulfilled')
 *   download_authorized = true
 * Creating an order (createOrder) does not reach that state.
 *
 * Admin-guarded via requireUser(). NOTE: requireUser() only checks that a
 * signed-in user exists — the project has no admin role yet (see report).
 */
export async function issueDownloadGrant(
  orderId: string,
  options?: { expiresInDays?: number; maxDownloads?: number | null }
): Promise<IssueGrantResult> {
  await requireUser();

  if (!UUID_RE.test(orderId)) {
    return { ok: false, error: "Invalid order id." };
  }

  const expiresInDays = options?.expiresInDays ?? DEFAULT_EXPIRES_IN_DAYS;
  const maxDownloads =
    options?.maxDownloads === undefined
      ? DEFAULT_MAX_DOWNLOADS
      : options.maxDownloads;
  if (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 365) {
    return { ok: false, error: "expiresInDays must be a whole number from 1 to 365." };
  }
  if (maxDownloads !== null && (!Number.isInteger(maxDownloads) || maxDownloads < 1)) {
    return { ok: false, error: "maxDownloads must be a positive whole number or null." };
  }

  let service;
  try {
    service = createServiceClient();
  } catch (err) {
    console.error("issueDownloadGrant: service client unavailable:", err);
    return { ok: false, error: "Service is temporarily unavailable." };
  }

  const { data: order, error: orderError } = await service
    .from("orders")
    .select("id, application_id, payment_status, order_status, download_authorized")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) {
    console.error("issueDownloadGrant: order lookup failed:", orderError.message);
    return { ok: false, error: "Could not load the order." };
  }
  if (!order) return { ok: false, error: "Order not found." };

  if (
    order.payment_status !== "paid" ||
    !["confirmed", "fulfilled"].includes(order.order_status) ||
    order.download_authorized !== true
  ) {
    return {
      ok: false,
      error:
        "This order is not confirmed and authorized for download (requires paid, confirmed/fulfilled, and download_authorized).",
    };
  }

  const { data: app, error: appError } = await service
    .from("applications")
    .select(
      "slug, active, deleted_at, download_gated, apk_storage_path, download_enabled, download_url"
    )
    .eq("id", order.application_id)
    .maybeSingle();
  if (appError) {
    console.error("issueDownloadGrant: app lookup failed:", appError.message);
    return { ok: false, error: "Could not load the application." };
  }
  if (!app || !app.active || app.deleted_at !== null) {
    return { ok: false, error: "The application is not active." };
  }
  if (!app.download_gated) {
    return {
      ok: false,
      error: "This application is not download-gated; no grant is needed.",
    };
  }
  const hasApk = Boolean(app.apk_storage_path && app.download_enabled);
  if (!hasApk && !isValidHttpUrl(app.download_url)) {
    return { ok: false, error: "The application has no download available." };
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error: insertError } = await service.from("download_grants").insert({
    order_id: order.id,
    token,
    expires_at: expiresAt,
    max_downloads: maxDownloads,
  });
  if (insertError) {
    console.error("issueDownloadGrant: insert failed:", insertError.message);
    return { ok: false, error: "Could not create the download grant." };
  }

  return {
    ok: true,
    token,
    path: `/api/download/${app.slug}?token=${token}`,
    expiresAt,
  };
}
