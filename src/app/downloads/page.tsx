import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import StatusBadge from "@/components/ui/StatusBadge";
import { getApps } from "@/data/apps";
import { getDownloadCta } from "@/lib/types";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Find download links for JinZu Software applications.",
};

export const revalidate = 0;

export default async function DownloadsPage() {
  const apps = await getApps();

  return (
    <section className="py-20">
      <div className="container-page max-w-3xl">
        <SectionHeading
          eyebrow="Downloads"
          title="Get JinZu Apps"
          description="Download links will appear here as each application becomes available."
        />

        <div className="mt-12 divide-y divide-border rounded-2xl border border-border">
          {apps.map((app) => {
            const cta = getDownloadCta(app);
            return (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-4 p-6"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-ink">
                      {app.name}
                    </h3>
                    <StatusBadge status={app.status} />
                    {app.version && (
                      <span className="font-mono text-xs text-ink-soft">
                        v{app.version}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{app.tagline}</p>
                </div>

                {cta.active && cta.href ? (
                  <a
                    href={cta.href}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    {cta.label}
                  </a>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink-soft opacity-80">
                    {cta.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
