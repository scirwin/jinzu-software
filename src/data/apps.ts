import { createClient } from "@/lib/supabase/server";
import type { AppRecord, AppStatus, AppScreenshot } from "@/lib/types";

export type { AppStatus, AppRecord, AppScreenshot } from "@/lib/types";
export { statusLabels } from "@/lib/types";

/** All active, non-deleted applications, in display order. Public-facing. */
export async function getApps(): Promise<AppRecord[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("active", true)
      .is("deleted_at", null)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to load applications:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    // Supabase isn't configured yet, or is unreachable. Fail soft so the
    // public site still renders instead of a 500 page. console.warn (not
    // .error) so Next's dev overlay doesn't pop up for this expected state.
    console.warn(
      "getApps() could not reach Supabase:",
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

export async function getAppBySlug(slug: string): Promise<AppRecord | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("Failed to load application:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(
      "getAppBySlug() could not reach Supabase:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export async function getAppsByStatus(status: AppStatus): Promise<AppRecord[]> {
  const apps = await getApps();
  return apps.filter((app) => app.status === status);
}

/** Screenshots for one app, in display order. Fails soft, like getApps(). */
export async function getAppScreenshots(applicationId: string): Promise<AppScreenshot[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("app_screenshots")
      .select("*")
      .eq("application_id", applicationId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to load screenshots:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn(
      "getAppScreenshots() could not reach Supabase:",
      err instanceof Error ? err.message : err
    );
    return [];
  }
}
