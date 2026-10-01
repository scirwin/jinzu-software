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
  if (slug) {
    revalidatePath(`/apps/${slug}`);
    revalidatePath(`/apps/${slug}/purchase`);
  }
}

function parseListField(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  return String(raw)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Parses the admin-entered price as a validated decimal string, never as a
 * JS float — the string is passed straight through to Supabase, which lets
 * Postgres cast it directly into the `numeric(10,2)` column. This avoids
 * any IEEE-754 floating-point rounding of money entirely.
 */
function parsePriceInput(raw: FormDataEntryValue | null): {
  price: string | null;
  error?: string;
} {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { price: null };
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(trimmed)) {
    return {
      price: null,
      error:
        "Price must be a valid amount (e.g. 49.99), with at most 2 decimal places.",
    };
  }
  return { price: trimmed };
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
    currency: String(formData.get("currency") ?? "").trim() || "PHP",
    purchasable: formData.get("purchasable") === "on",
    online_payment_enabled: formData.get("online_payment_enabled") === "on",
    direct_payment_enabled: formData.get("direct_payment_enabled") === "on",
    platform: String(formData.get("platform") ?? "").trim() || null,
    download_gated: formData.get("download_gated") === "on",
  };
}

/**
 * Same validated-decimal-string approach as `parsePriceInput`, plus the
 * business rule that a discount must actually be a discount — it can
 * only be set when a regular price exists, and it must be lower than it.
 * This mirrors (and fails the same way as) the DB check constraint added
 * in 0004_apk_and_discount.sql, so the admin gets a friendly message
 * instead of a raw Postgres constraint-violation error.
 */
function parseDiscountedPriceInput(
  raw: FormDataEntryValue | null,
  price: string | null
): { discountedPrice: string | null; error?: string } {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { discountedPrice: null };
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(trimmed)) {
    return {
      discountedPrice: null,
      error:
        "Discounted price must be a valid amount (e.g. 39.99), with at most 2 decimal places.",
    };
  }
  if (price === null) {
    return {
      discountedPrice: null,
      error: "Set a regular price before adding a discounted price.",
    };
  }
  if (Number(trimmed) >= Number(price)) {
    return {
      discountedPrice: null,
      error: "Discounted price must be lower than the regular price.",
    };
  }
  return { discountedPrice: trimmed };
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

  const { price, error: priceError } = parsePriceInput(formData.get("price"));
  if (priceError) {
    return { error: priceError };
  }
  const { discountedPrice, error: discountedPriceError } = parseDiscountedPriceInput(
    formData.get("discounted_price"),
    price
  );
  if (discountedPriceError) {
    return { error: discountedPriceError };
  }

  const { error } = await supabase
    .from("applications")
    .insert({ ...record, price, discounted_price: discountedPrice });
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

  const { price, error: priceError } = parsePriceInput(formData.get("price"));
  if (priceError) {
    return { error: priceError };
  }
  const { discountedPrice, error: discountedPriceError } = parseDiscountedPriceInput(
    formData.get("discounted_price"),
    price
  );
  if (discountedPriceError) {
    return { error: discountedPriceError };
  }

  const { error } = await supabase
    .from("applications")
    .update({ ...record, price, discounted_price: discountedPrice })
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
