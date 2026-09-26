"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "./apps";

const BUCKET = "app-assets";
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export interface AssetActionState {
  url?: string | null;
  error?: string;
}

function extFromType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only PNG, JPG, or WebP images are allowed.";
  }
  if (file.size > MAX_BYTES) {
    return "Images must be smaller than 5MB.";
  }
  return null;
}

/** Recovers the storage object path from a public Supabase Storage URL. */
function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

function revalidateForApp(slug: string | null | undefined, applicationId: string) {
  revalidatePath("/");
  revalidatePath("/apps");
  revalidatePath("/downloads");
  revalidatePath(`/admin/apps/${applicationId}/edit`);
  if (slug) revalidatePath(`/apps/${slug}`);
}

/** Uploads (or replaces) an app's icon and stores its public URL on `applications.icon_url`. */
export async function uploadAppIcon(
  applicationId: string,
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const { supabase } = await requireUser();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  const validationError = validateImage(file);
  if (validationError) return { error: validationError };

  const { data: existing } = await supabase
    .from("applications")
    .select("icon_url, slug")
    .eq("id", applicationId)
    .maybeSingle();

  const path = `${applicationId}/icon-${Date.now()}.${extFromType(file.type)}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("applications")
    .update({ icon_url: url })
    .eq("id", applicationId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Best-effort cleanup of the previous icon file.
  if (existing?.icon_url) {
    const oldPath = pathFromPublicUrl(existing.icon_url);
    if (oldPath && oldPath !== path) {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }
  }

  revalidateForApp(existing?.slug, applicationId);
  return { url };
}

/** Removes an app's icon: deletes the storage file and clears `icon_url`. */
export async function removeAppIcon(
  applicationId: string,
  _prevState: AssetActionState,
  _formData: FormData
): Promise<AssetActionState> {
  const { supabase } = await requireUser();

  const { data: existing } = await supabase
    .from("applications")
    .select("icon_url, slug")
    .eq("id", applicationId)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("applications")
    .update({ icon_url: null })
    .eq("id", applicationId);

  if (updateError) {
    return { error: updateError.message };
  }

  if (existing?.icon_url) {
    const oldPath = pathFromPublicUrl(existing.icon_url);
    if (oldPath) {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }
  }

  revalidateForApp(existing?.slug, applicationId);
  return { url: null };
}

export interface ScreenshotUploadState {
  error?: string;
}

/** Uploads one or more screenshots and appends them to `app_screenshots`. */
export async function uploadAppScreenshots(
  applicationId: string,
  _prevState: ScreenshotUploadState,
  formData: FormData
): Promise<ScreenshotUploadState> {
  const { supabase } = await requireUser();
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { error: "Choose at least one image to upload." };
  }
  for (const file of files) {
    const validationError = validateImage(file);
    if (validationError) return { error: validationError };
  }

  const { data: app } = await supabase
    .from("applications")
    .select("slug")
    .eq("id", applicationId)
    .maybeSingle();

  const { data: maxOrderRow } = await supabase
    .from("app_screenshots")
    .select("sort_order")
    .eq("application_id", applicationId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrder = (maxOrderRow?.sort_order ?? -1) + 1;

  for (const file of files) {
    const path = `${applicationId}/screenshot-${Date.now()}-${nextOrder}.${extFromType(file.type)}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: insertError } = await supabase.from("app_screenshots").insert({
      application_id: applicationId,
      url: publicUrlData.publicUrl,
      sort_order: nextOrder,
    });

    if (insertError) {
      return { error: insertError.message };
    }

    nextOrder += 1;
  }

  revalidateForApp(app?.slug, applicationId);
  return {};
}

/** Deletes one screenshot: removes the storage file and its row. */
export async function removeAppScreenshot(applicationId: string, screenshotId: string) {
  const { supabase } = await requireUser();

  const { data: shot } = await supabase
    .from("app_screenshots")
    .select("url")
    .eq("id", screenshotId)
    .maybeSingle();

  const { error } = await supabase.from("app_screenshots").delete().eq("id", screenshotId);
  if (error) throw new Error(error.message);

  if (shot?.url) {
    const path = pathFromPublicUrl(shot.url);
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }

  const { data: app } = await supabase
    .from("applications")
    .select("slug")
    .eq("id", applicationId)
    .maybeSingle();

  revalidateForApp(app?.slug, applicationId);
}

/** Swaps a screenshot's sort_order with its neighbor to move it up or down. */
export async function moveAppScreenshot(
  applicationId: string,
  screenshotId: string,
  direction: "up" | "down"
) {
  const { supabase } = await requireUser();

  const { data: shots, error } = await supabase
    .from("app_screenshots")
    .select("id, sort_order")
    .eq("application_id", applicationId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  if (!shots) return;

  const index = shots.findIndex((s) => s.id === screenshotId);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= shots.length) return;

  const a = shots[index];
  const b = shots[swapIndex];

  await supabase.from("app_screenshots").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("app_screenshots").update({ sort_order: a.sort_order }).eq("id", b.id);

  const { data: app } = await supabase
    .from("applications")
    .select("slug")
    .eq("id", applicationId)
    .maybeSingle();

  revalidateForApp(app?.slug, applicationId);
}
