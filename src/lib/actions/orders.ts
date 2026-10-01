"use server";

import { createServiceClient } from "@/lib/supabase/service";

export interface PurchaseFormState {
  status: "idle" | "error" | "success";
  error?: string;
  orderId?: string;
  orderStatus?: string;
}

export const initialPurchaseFormState: PurchaseFormState = { status: "idle" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 30;

// A generic, user-safe error. Never surface Supabase/SQL details to the
// browser — those are logged server-side only, below.
const GENERIC_ERROR =
  "We couldn't submit your order right now. Please try again in a moment.";

export async function createOrder(
  _prevState: PurchaseFormState,
  formData: FormData
): Promise<PurchaseFormState> {
  // --- Honeypot -----------------------------------------------------
  // Hidden field real users never fill in. Any value means a bot.
  // Return a generic "success-shaped" no-op rather than a specific
  // rejection reason, so scripted submitters don't learn what tripped.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    return { status: "error", error: GENERIC_ERROR };
  }

  const slug = String(formData.get("app_slug") ?? "").trim();
  const submittedPaymentMethod = String(formData.get("payment_method") ?? "").trim();

  if (!slug) {
    return { status: "error", error: GENERIC_ERROR };
  }

  if (submittedPaymentMethod !== "online" && submittedPaymentMethod !== "direct") {
    return {
      status: "error",
      error: "Please choose a valid payment method.",
    };
  }

  // --- Validate customer fields --------------------------------------
  const rawName = String(formData.get("customer_name") ?? "").trim();
  const rawEmail = String(formData.get("customer_email") ?? "")
    .trim()
    .toLowerCase();
  const rawPhone = String(formData.get("customer_phone") ?? "").trim();

  if (!rawName) {
    return { status: "error", error: "Please enter your full name." };
  }
  if (rawName.length > MAX_NAME_LENGTH) {
    return {
      status: "error",
      error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.`,
    };
  }

  if (!rawEmail) {
    return { status: "error", error: "Please enter your email address." };
  }
  if (rawEmail.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(rawEmail)) {
    return { status: "error", error: "Please enter a valid email address." };
  }

  if (rawPhone.length > MAX_PHONE_LENGTH) {
    return {
      status: "error",
      error: `Phone number must be ${MAX_PHONE_LENGTH} characters or fewer.`,
    };
  }
  const customerPhone = rawPhone || null;

  // --- Re-verify everything server-side against the database ---------
  // The browser is never trusted for price, currency, or which payment
  // methods are actually enabled — all of it is re-read here.
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (err) {
    console.error("createOrder: service client unavailable:", err);
    return { status: "error", error: GENERIC_ERROR };
  }

  const { data: app, error: appError } = await supabase
    .from("applications")
    .select(
      "id, active, deleted_at, purchasable, price, discounted_price, currency, online_payment_enabled, direct_payment_enabled"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (appError) {
    console.error("createOrder: failed to load application:", appError.message);
    return { status: "error", error: GENERIC_ERROR };
  }

  if (
    !app ||
    !app.active ||
    app.deleted_at !== null ||
    !app.purchasable ||
    app.price === null ||
    app.price === undefined
  ) {
    return {
      status: "error",
      error: "This application is not currently available for purchase.",
    };
  }

  const methodEnabled =
    submittedPaymentMethod === "online"
      ? app.online_payment_enabled
      : app.direct_payment_enabled;

  if (!methodEnabled) {
    return {
      status: "error",
      error: "The selected payment method is not available for this application.",
    };
  }

  const paymentStatus =
    submittedPaymentMethod === "direct" ? "awaiting_confirmation" : "pending";

  // The discounted price, when set, IS the current price — mirrors the
  // public price display (getPriceDisplay) so a customer is never
  // charged more than what the site showed them.
  const chargedPrice =
    app.discounted_price !== null && app.discounted_price !== undefined
      ? app.discounted_price
      : app.price;

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      application_id: app.id,
      customer_name: rawName,
      customer_email: rawEmail,
      customer_phone: customerPhone,
      price: chargedPrice,
      currency: app.currency,
      payment_method: submittedPaymentMethod,
      payment_provider: null,
      payment_status: paymentStatus,
      order_status: "pending",
      download_authorized: false,
      notes: null,
    })
    .select("id, order_status")
    .single();

  if (insertError || !order) {
    console.error(
      "createOrder: failed to insert order:",
      insertError?.message
    );
    return { status: "error", error: GENERIC_ERROR };
  }

  return {
    status: "success",
    orderId: order.id,
    orderStatus: order.order_status,
  };
}
