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
}

export interface AppScreenshot {
  id: string;
  application_id: string;
  url: string;
  sort_order: number;
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

/** What the Downloads page (and app pages) should show for the download button. */
export function getDownloadCta(app: Pick<AppRecord, "status" | "download_url">): {
  label: string;
  active: boolean;
} {
  if (app.status === "maintenance") {
    return { label: "Temporarily Unavailable", active: false };
  }
  if (app.status === "discontinued") {
    return { label: "Discontinued", active: false };
  }
  if (app.download_url) {
    return { label: "Download App", active: true };
  }
  if (app.status === "in-development") {
    return { label: "In Development", active: false };
  }
  return { label: "Download link coming soon", active: false };
}
