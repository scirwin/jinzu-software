import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import AppCard from "@/components/ui/AppCard";
import { getApps } from "@/data/apps";
import type { AppStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Apps",
  description:
    "Browse JinZu Software's full product directory, including available, in-development, and coming-soon applications.",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const groups: { title: string; statuses: AppStatus[] }[] = [
  { title: "Available", statuses: ["available"] },
  { title: "In Development", statuses: ["in-development"] },
  { title: "Coming Soon", statuses: ["coming-soon"] },
  { title: "Maintenance", statuses: ["maintenance"] },
  { title: "Discontinued", statuses: ["discontinued"] },
];

export default async function AppsPage() {
  const apps = await getApps();

  return (
    <section className="py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow={`${apps.length} Apps`}
          title="JinZu Apps"
          description="A complete directory of everything JinZu Software is building \u2014 organized by where each product stands today."
        />

        <div className="mt-14 space-y-16">
          {groups.map((group) => {
            const groupApps = apps.filter((app) =>
              group.statuses.includes(app.status)
            );
            if (groupApps.length === 0) return null;
            return (
              <div key={group.title}>
                <h2 className="text-lg font-semibold text-ink">
                  {group.title}
                </h2>
                <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {groupApps.map((app) => (
                    <AppCard key={app.id} app={app} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
