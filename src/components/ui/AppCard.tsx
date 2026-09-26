import Link from "next/link";
import { AppRecord } from "@/lib/types";
import StatusBadge from "./StatusBadge";

const initials = (name: string) =>
  name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function AppCard({ app }: { app: AppRecord }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_12px_32px_rgba(11,18,32,0.08)]">
      <div className="flex items-start justify-between gap-3">
        {app.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.icon_url}
            alt=""
            className="h-11 w-11 rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light font-display text-sm font-semibold text-brand">
            {initials(app.name)}
          </div>
        )}
        <StatusBadge status={app.status} />
      </div>

      <span className="mt-4 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
        {app.category}
      </span>
      <h3 className="mt-1 text-xl font-semibold text-ink">{app.name}</h3>
      <p className="mt-1 text-sm font-medium text-brand">{app.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {app.short_description}
      </p>

      <ul className="mt-4 space-y-1.5">
        {app.features.slice(0, 3).map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-ink-soft"
          >
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-4 border-t border-border">
        <Link
          href={`/apps/${app.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition-transform group-hover:gap-2"
        >
          Learn More
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
