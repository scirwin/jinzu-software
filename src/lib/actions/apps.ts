"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppStatus } from "@/lib/types";

export async function requireUser() {
  const supabase = await createClient();
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error(
      "requireUser() could not reach Supabase:",
      err instanceof Error ? err.message : err
    );
    throw new Error(
      "Couldn't reach the authentication service. Please try again shortly."
    );
  }
  if (!user) {
    redirect("/admin/login");
  }
  return { supabase, user };
}

function revalidatePublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/apps");
  revalidatePath("/downloads");
  revalidatePath("/admin/apps");
  if (slug) revalidatePath(`/apps/${slug}`);
}

function parseListField(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  return String(raw)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export interface AppFormState {
  error?: string;
}

function buildRecordFromForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    short_description: String(formData.get("short_description") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    status: String(formData.get("status") ?? "coming-soon") as AppStatus,
    version: String(formData.get("version") ?? "").trim() || null,
    download_url: String(formData.get("download_url") ?? "").trim() || null,
    website_url: String(formData.get("website_url") ?? "").trim() || null,
    release_date: String(formData.get("release_date") ?? "").trim() || null,
    featured: formData.get("featured") === "on",
    display_order: Number(formData.get("display_order") ?? 0) || 0,
    active: formData.get("active") === "on",
    features: parseListField(formData.get("features")),
    who_for: parseListField(formData.get("who_for")),
  };
}

export async function createApp(
  _prevState: AppFormState,
  formData: FormData
): Promise<AppFormState> {
  const { supabase } = await requireUser();
  const record = buildRecordFromForm(formData);

  if (!record.name || !record.slug) {
    return { error: "Name and slug are required." };
  }

  const { error } = await supabase.from("applications").insert(record);
  if (error) {
    return { error: error.message };
  }

  revalidatePublicPages(record.slug);
  redirect("/admin/apps");
}

export async function updateApp(
  id: string,
  _prevState: AppFormState,
  formData: FormData
): Promise<AppFormState> {
  const { supabase } = await requireUser();
  const record = buildRecordFromForm(formData);

  if (!record.name || !record.slug) {
    return { error: "Name and slug are required." };
  }

  const { error } = await supabase
    .from("applications")
    .update(record)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePublicPages(record.slug);
  redirect("/admin/apps");
}

export async function toggleActive(id: string, active: boolean) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("applications")
    .update({ active })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) throw new Error(error.message);
  revalidatePublicPages(data?.slug);
}

export async function softDeleteApp(id: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("applications")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) throw new Error(error.message);
  revalidatePublicPages(data?.slug);
}

export async function restoreApp(id: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("applications")
    .update({ deleted_at: null, active: true })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) throw new Error(error.message);
  revalidatePublicPages(data?.slug);
}
