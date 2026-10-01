import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getApps, getAppBySlug, getAppScreenshots } from "@/data/apps";
import {
  getDownloadCta,
  isValidHttpUrl,
  getPriceDisplay,
  isPurchaseAvailable,
} from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import AppCard from "@/components/ui/AppCard";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return {};
  return {
    title: app.name,
    description: app.short_description,
  };
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) notFound();

  const allApps = await getApps();
  const related = allApps.filter((a) => a.slug !== app.slug).slice(0, 3);
  const cta = getDownloadCta(app);
  const price = getPriceDisplay(app.price, app.discounted_price, app.currency);
  const screenshots = await getAppScreenshots(app.id);

  const pricingAnswer = (() => {
    if (!app.purchasable || !price.current) {
      return `${app.name} does not currently have pricing set. Check the Downloads page or ask us directly for the latest.`;
    }
    if (price.hasDiscount) {
      return `${app.name} is available for ${price.current}, discounted from ${price.regular}.`;
    }
    return `${app.name} is available for ${price.current}.`;
  })();

  const faqs = [
    app.status === "available"
      ? {
          question: `How much does ${app.name} cost?`,
          answer: pricingAnswer,
        }
      : {
          question: "Is there more information available yet?",
          answer: `${app.name} is still being worked on. More details will be shared as development progresses.`,
        },
  ];

  return (
    <>
      <section className="border-b border-border bg-bg py-16">
        <div className="container-page">
          <Link
            href="/apps"
            className="text-sm font-medium text-ink-soft hover:text-brand"
          >
            &larr; All Apps
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {app.category}
            </span>
            <StatusBadge status={app.status} />
            {app.version && (
              <span className="font-mono text-xs text-ink-soft">
                v{app.version}
              </span>
            )}
          </div>

          {app.icon_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.icon_url}
              alt={`${app.name} icon`}
              className="mt-5 h-14 w-14 rounded-2xl border border-border object-cover"
            />
          )}

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {app.name}
          </h1>
          <p className="mt-2 text-lg font-medium text-brand">{app.tagline}</p>
          {app.purchasable && price.current && (
            <p className="mt-2 flex items-baseline gap-3">
              {price.hasDiscount && price.regular && (
                <span className="text-lg text-ink-soft line-through">{price.regular}</span>
              )}
              <span className="text-2xl font-semibold text-ink">{price.current}</span>
            </p>
          )}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
            {app.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isPurchaseAvailable(app) && (
              <ButtonLink href={`/apps/${app.slug}/purchase`} variant="primary">
                Buy Now
              </ButtonLink>
            )}
            {cta.active && cta.href ? (
              <a
                href={cta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                {cta.label}
              </a>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink-soft">
                {cta.label}
              </span>
            )}
            {isValidHttpUrl(app.website_url) && (
              <a
                href={app.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
              >
                Visit Website / App
              </a>
            )}
            <ButtonLink href="/contact" variant="secondary">
              Ask a Question
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          {screenshots.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-ink">Screenshots</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {screenshots.map((shot) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={shot.id}
                    src={shot.url}
                    alt={`${app.name} screenshot`}
                    className="w-full rounded-2xl border border-border object-cover"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border bg-surface sm:h-96">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                Screenshots coming soon
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-ink">Key Features</h2>
            <ul className="mt-5 space-y-3">
              {app.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">Who It&apos;s For</h2>
            <ul className="mt-5 space-y-3">
              {app.who_for.map((who) => (
                <li
                  key={who}
                  className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {who}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="container-page">
          <div className="rounded-2xl border border-border p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Current Status
                </h2>
                <p className="mt-1 text-sm text-ink-soft">{cta.label}</p>
              </div>
              <ButtonLink href="/downloads" variant="secondary">
                View Downloads Page
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-2xl">
          <h2 className="text-xl font-semibold text-ink">FAQ</h2>
          <div className="mt-5 divide-y divide-border rounded-2xl border border-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="cursor-pointer list-none text-sm font-medium text-ink">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-16">
          <div className="container-page">
            <h2 className="text-xl font-semibold text-ink">Related Apps</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <AppCard key={a.id} app={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
