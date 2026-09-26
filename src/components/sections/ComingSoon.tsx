import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import StatusBadge from "@/components/ui/StatusBadge";
import type { AppRecord } from "@/lib/types";

export default function ComingSoon({ apps }: { apps: AppRecord[] }) {
  const upcoming = apps.filter(
    (app) => app.status === "coming-soon" || app.status === "in-development"
  );

  if (upcoming.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="On the Way"
          title="More Tools Are Coming"
          description="JinZu is actively building out the rest of the product suite. Here's what's in progress next."
        />
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-bg">
          {upcoming.map((app) => (
            <Link
              key={app.id}
              href={`/apps/${app.slug}`}
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 transition-colors hover:bg-surface"
            >
              <div>
                <p className="font-medium text-ink">{app.name}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{app.tagline}</p>
              </div>
              <StatusBadge status={app.status} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
