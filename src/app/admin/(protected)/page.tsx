import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { statusLabels, type AppStatus } from "@/lib/types";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("applications")
    .select("status, active, deleted_at");

  const rows = apps ?? [];
  const live = rows.filter((r) => !r.deleted_at);

  const counts: Record<AppStatus, number> = {
    available: 0,
    "in-development": 0,
    "coming-soon": 0,
    maintenance: 0,
    discontinued: 0,
  };
  live.forEach((r) => {
    counts[r.status as AppStatus] = (counts[r.status as AppStatus] ?? 0) + 1;
  });

  const stats = [
    { label: "Total Applications", value: live.length },
    { label: statusLabels.available, value: counts.available },
    { label: statusLabels["in-development"], value: counts["in-development"] },
    { label: statusLabels["coming-soon"], value: counts["coming-soon"] },
    { label: statusLabels.maintenance, value: counts.maintenance },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Overview of JinZu applications.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/admin/apps"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Manage Applications
        </Link>
      </div>
    </div>
  );
}
