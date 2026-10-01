"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "./apps";
import { createServiceClient } from "@/lib/supabase/service";

const BUCKET = "app-downloads";

// Supabase Storage's own per-project/per-bucket file size limit (set in
// the dashboard, see the Supabase Dashboard Requirements in the report)
// still applies on top of this and may be lower — this is only this
// application's own ceiling.
const MAX_APK_BYTES = 150 * 1024 * 1024; // 150MB

const APK_CONTENT_TYPES = [
  "application/vnd.android.package-archive",
  "application/octet-stream", // many browsers/OSes send this for .apk
];

function revalidateForApp(slug: string | null | undefined, applicationId: string) {
  revalidatePath("/");
  revalidatePath("/apps");
  revalidatePath("/downloads");
  revalidatePath(`/admin/apps/${applicationId}/edit`);
  revalidatePath("/admin/apps");
  if (slug) revalidatePath(`/apps/${slug}`);
}

function sanitizeFilename(name: string): string {
  // Keep this predictable and safe as a storage path segment: strip any
  // directory separators and anything outside a conservative allowlist.
  const base = name.split(/[/\\]/).pop() ?? "app.apk";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 150) || "app.apk";
}

export interface ApkUploadUrlState {
  error?: string;
  path?: string;
  token?: string;
}

/**
 * Step 1 of the upload flow: after validating the request, asks Supabase
 * Storage (via the service-role client, since this bucket has no
 * authenticated/anon policies) for a short-lived signed upload URL/token
 * for a server-chosen path. The browser then uploads the file bytes
 * directly to Storage using that token — the file never passes through
 * this Server Action's body, and the service-role key never reaches the
 * browser.
 */
export async function createApkUploadTarget(
  applicationId: string,
  filename: string,
  fileSize: number,
  contentType: string
): Promise<ApkUploadUrlState> {
  await requireUser();

  if (!applicationId) {
    return { error: "Missing application id." };
  }
  if (!filename.toLowerCase().endsWith(".apk")) {
    return { error: "File must have a .apk extension." };
  }
  if (!APK_CONTENT_TYPES.includes(contentType)) {
    return { error: "File does not look like an Android APK." };
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return { error: "Could not determine the file size." };
  }
  if (fileSize > MAX_APK_BYTES) {
    return {
      error: `APK is too large (max ${(MAX_APK_BYTES / (1024 * 1024)).toFixed(0)}MB).`,
    };
  }

  const service = createServiceClient();

  const { data: app, error: appError } = await service
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .maybeSingle();
  if (appError || !app) {
    return { error: "Application not found." };
  }

  const path = `applications/${applicationId}/apk/${Date.now()}-${sanitizeFilename(filename)}`;

  const { data, error } = await service.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    return { error: error?.message ?? "Could not prepare the upload." };
  }

  return { path: data.path, token: data.token };
}

export interface ApkConfirmState {
  error?: string;
  filename?: string;
  sizeBytes?: number;
  uploadedAt?: string;
}

/**
 * Step 2: called by the browser after `uploadToSignedUrl` succeeds.
 * Re-verifies (server-side, via the service client) that the object
 * actually exists before trusting it, saves the APK metadata on the
 * application row, and only then removes the previous APK object —
 * so a failed or unconfirmed upload never destroys a working one.
 */
export async function confirmApkUpload(
  applicationId: string,
  path: string,
  filename: string
): Promise<ApkConfirmState> {
  await requireUser();
  const service = createServiceClient();

  const pathParts = path.split("/");
  const objectName = pathParts.pop() ?? "";
  const folder = pathParts.join("/");

  const { data: listing, error: listError } = await service.storage
    .from(BUCKET)
    .list(folder, { search: objectName });
  const uploadedObject = listing?.find((entry) => entry.name === objectName);

  if (listError || !uploadedObject) {
    return { error: "Upload could not be confirmed. Please try again." };
  }

  const { data: existing } = await service
    .from("applications")
    .select("apk_storage_path, slug")
    .eq("id", applicationId)
    .maybeSingle();

  const uploadedAt = new Date().toISOString();
  const sizeBytes = uploadedObject.metadata?.size ?? null;

  const { error: updateError } = await service
    .from("applications")
    .update({
      apk_storage_path: path,
      apk_filename: sanitizeFilename(filename),
      apk_size_bytes: sizeBytes,
      apk_uploaded_at: uploadedAt,
    })
    .eq("id", applicationId);

  if (updateError) {
    // Roll back the object we just confirmed, so we don't leave an
    // orphaned file with no matching metadata.
    await service.storage.from(BUCKET).remove([path]);
    return { error: updateError.message };
  }

  // Only remove the previous APK object now that the new one is
  // confirmed AND the database row points at it successfully.
  if (existing?.apk_storage_path && existing.apk_storage_path !== path) {
    await service.storage.from(BUCKET).remove([existing.apk_storage_path]);
  }

  revalidateForApp(existing?.slug, applicationId);
  return { filename: sanitizeFilename(filename), sizeBytes: sizeBytes ?? undefined, uploadedAt };
}

export interface ApkRemoveState {
  error?: string;
}

/** Removes the stored APK object and clears its metadata + download_enabled. */
export async function removeApk(applicationId: string): Promise<ApkRemoveState> {
  await requireUser();
  const service = createServiceClient();

  const { data: existing } = await service
    .from("applications")
    .select("apk_storage_path, slug")
    .eq("id", applicationId)
    .maybeSingle();

  const { error: updateError } = await service
    .from("applications")
    .update({
      apk_storage_path: null,
      apk_filename: null,
      apk_size_bytes: null,
      apk_uploaded_at: null,
      download_enabled: false,
    })
    .eq("id", applicationId);

  if (updateError) {
    return { error: updateError.message };
  }

  if (existing?.apk_storage_path) {
    await service.storage.from(BUCKET).remove([existing.apk_storage_path]);
  }

  revalidateForApp(existing?.slug, applicationId);
  return {};
}

export interface ToggleDownloadState {
  error?: string;
}

/** Toggles whether the stored APK is exposed via the public download route. */
export async function setDownloadEnabled(
  applicationId: string,
  enabled: boolean
): Promise<ToggleDownloadState> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("applications")
    .update({ download_enabled: enabled })
    .eq("id", applicationId)
    .select("slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateForApp(data?.slug, applicationId);
  return {};
}
