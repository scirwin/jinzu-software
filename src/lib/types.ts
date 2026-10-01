export type AppStatus =
  | "available"
  | "in-development"
  | "coming-soon"
  | "maintenance"
  | "discontinued";

export const statusLabels: Record<AppStatus, string> = {
  available: "Available",
  "in-development": "In Development",
  "coming-soon": "Coming Soon",
  maintenance: "Maintenance",
  discontinued: "Discontinued",
};

export const statusOptions: AppStatus[] = [
  "available",
  "in-development",
  "coming-soon",
  "maintenance",
  "discontinued",
];

export interface AppRecord {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  description: string;
  category: string;
  status: AppStatus;
  version: string | null;
  download_url: string | null;
  website_url: string | null;
  release_date: string | null;
  featured: boolean;
  display_order: number;
  active: boolean;
  icon_url: string | null;
  features: string[];
  who_for: string[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  price: number | null;
  currency: string;
  purchasable: boolean;
  online_payment_enabled: boolean;
  direct_payment_enabled: boolean;
  download_gated: boolean;
  platform: string | null;
  discounted_price: number | null;
  download_enabled: boolean;
  apk_storage_path: string | null;
  apk_filename: string | null;
  apk_size_bytes: number | null;
  apk_uploaded_at: string | null;
}

export interface AppScreenshot {
  id: string;
  application_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

/** A customer purchase record for a purchasable application (public.orders). */
export interface OrderRecord {
  id: string;
  application_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  price: number;
  currency: string;
  payment_method: "online" | "direct";
  payment_provider: string | null;
  payment_status:
    | "pending"
    | "awaiting_confirmation"
    | "paid"
    | "failed"
    | "refunded";
  order_status: "pending" | "confirmed" | "fulfilled" | "cancelled";
  download_authorized: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
}

/** A time-limited, revocable download token issued for a fulfilled order (public.download_grants). */
export interface DownloadGrantRecord {
  id: string;
  order_id: string;
  token: string;
  expires_at: string;
  max_downloads: number | null;
  download_count: number;
  revoked: boolean;
  created_at: string;
}

/**
 * Guards against rendering a broken/malformed link for optional URL fields
 * (e.g. website_url) that admins enter as free text.
 */
export function isValidHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * True only when the purchase flow can actually proceed: the app is
 * purchasable, has a price, and at least one payment method is enabled.
 * Used to decide whether to show "Buy Now". This does not change how any
 * price is calculated or displayed, and the server (createOrder /
 * purchase page) still re-validates everything independently.
 */
export function isPurchaseAvailable(
  app: Pick<
    AppRecord,
    "purchasable" | "price" | "online_payment_enabled" | "direct_payment_enabled"
  >
): boolean {
  return (
    app.purchasable &&
    app.price !== null &&
    app.price !== undefined &&
    (app.online_payment_enabled || app.direct_payment_enabled)
  );
}

export interface DownloadCta {
  label: string;
  active: boolean;
  /**
   * Where the download action should point when `active` is true.
   * For an uploaded APK this is the server-side signed-download route
   * (never the Storage object directly); for the legacy fallback it is
   * the admin-entered `download_url`. Always null when `active` is false.
   */
  href: string | null;
}

/**
 * What the Downloads page (and app detail page) should show for the
 * download button. An uploaded, download-enabled APK takes precedence
 * over the legacy `download_url` external link, which remains as a
 * fallback for apps that only ever had an external link.
 *
 * `download_gated` apps with an APK present are reported as inactive
 * (not simply "hidden") because the current architecture has no
 * completed payment/download-grant authorization yet — see
 * `/api/download/[slug]`, which independently re-enforces this and must
 * never be bypassed by trusting this label alone.
 */
export function getDownloadCta(
  app: Pick<
    AppRecord,
    | "slug"
    | "status"
    | "download_url"
    | "apk_storage_path"
    | "download_enabled"
    | "download_gated"
  >
): DownloadCta {
  if (app.status === "maintenance") {
    return { label: "Temporarily Unavailable", active: false, href: null };
  }
  if (app.status === "discontinued") {
    return { label: "Discontinued", active: false, href: null };
  }

  if (app.apk_storage_path && app.download_enabled) {
    if (app.download_gated) {
      return { label: "Purchase Required to Download", active: false, href: null };
    }
    return {
      label: "Download App",
      active: true,
      href: `/api/download/${app.slug}`,
    };
  }

  if (app.download_url) {
    // A gated app's external URL must never be exposed as a usable link;
    // it is only reachable through /api/download/[slug] with a valid grant.
    if (app.download_gated) {
      return { label: "Purchase Required to Download", active: false, href: null };
    }
    return { label: "Download App", active: true, href: app.download_url };
  }
  if (app.status === "in-development") {
    return { label: "In Development", active: false, href: null };
  }
  return { label: "Download link coming soon", active: false, href: null };
}

/**
 * Single formatting source for a possibly-discounted price, used by the
 * public listing, app detail, and purchase pages so "regular struck
 * through, discounted current price" never drifts out of sync.
 */
export interface PriceDisplay {
  hasDiscount: boolean;
  /** The original price, formatted — shown struck through when hasDiscount. */
  regular: string | null;
  /** The price to treat as "current" — the discount when present, else the regular price. */
  current: string | null;
}

export function getPriceDisplay(
  price: number | null | undefined,
  discountedPrice: number | null | undefined,
  currency: string
): PriceDisplay {
  const regular = formatPrice(price, currency);
  if (
    price !== null &&
    price !== undefined &&
    discountedPrice !== null &&
    discountedPrice !== undefined
  ) {
    return { hasDiscount: true, regular, current: formatPrice(discountedPrice, currency) };
  }
  return { hasDiscount: false, regular, current: regular };
}

/** Human-readable file size for the admin APK panel, e.g. "24.3 MB". */
export function formatFileSize(bytes: number | null | undefined): string | null {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Single formatting source for a purchasable app's price, used by the
 * public listing, app detail, and purchase pages alike so they can never
 * drift out of sync with each other.
 */
export function formatPrice(
  price: number | null | undefined,
  currency: string
): string | null {
  if (price === null || price === undefined) return null;
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: currency || "PHP",
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}
