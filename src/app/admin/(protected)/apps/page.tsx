import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import AppRowActions from "@/components/admin/AppRowActions";
import RestoreButton from "@/components/admin/RestoreButton";
import type { AppRecord } from "@/lib/types";

export const revalidate = 0;

export default async function ManageApplicationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("*")
    .order("display_order", { ascending: true });

  const apps = (data ?? []) as AppRecord[];
  const liveApps = apps.filter((a) => !a.deleted_at);
  const deletedApps = apps.filter((a) => a.deleted_at);

  // Single lightweight query (ids only, no image bytes) to build a
  // per-application screenshot count without an N+1 query per row.
  const { data: screenshotRows } = await supabase
    .from("app_screenshots")
    .select("application_id");

  const screenshotCounts = (screenshotRows ?? []).reduce<Record<string, number>>(
    (counts, row) => {
      counts[row.application_id] = (counts[row.application_id] ?? 0) + 1;
      return counts;
    },
    {}
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Manage Applications
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Add, edit, deactivate, or delete JinZu applications.
          </p>
        </div>
        <Link
          href="/admin/apps/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Add Application
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Application</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Featured</th>
              <th className="px-5 py-3 font-medium">Icon</th>
              <th className="px-5 py-3 font-medium">Screenshots</th>
              <th className="px-5 py-3 font-medium">Version</th>
              <th className="px-5 py-3 font-medium">Download</th>
              <th className="px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {liveApps.map((app) => (
              <tr key={app.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{app.name}</p>
                  <p className="text-xs text-ink-soft">/{app.slug}</p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-5 py-4">
                  {app.featured ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-light px-3 py-1 text-xs font-medium text-amber">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      Featured
                    </span>
                  ) : (
                    <span className="text-ink-soft">&mdash;</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {app.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.icon_url}
                      alt={`${app.name} icon`}
                      className="h-8 w-8 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-border text-[10px] text-ink-soft">
                      None
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-ink-soft">
                  {screenshotCounts[app.id] ?? 0}
                </td>
                <td className="px-5 py-4 text-ink-soft">
                  {app.version || "\u2014"}
                </td>
                <td className="px-5 py-4 text-ink-soft">
                  {app.download_url ? "Yes" : "No"}
                </td>
                <td className="px-5 py-4 text-ink-soft">
                  {app.active ? "Yes" : "No"}
                </td>
                <td className="px-5 py-4">
                  <AppRowActions id={app.id} name={app.name} active={app.active} />
                </td>
              </tr>
            ))}
            {liveApps.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-ink-soft">
                  No applications yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deletedApps.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            Deleted Applications
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            These no longer appear on the public website. Restore to bring
            them back with their saved information.
          </p>
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
            {deletedApps.map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-ink">{app.name}</p>
                  <p className="text-xs text-ink-soft">/{app.slug}</p>
                </div>
                <RestoreButton id={app.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
