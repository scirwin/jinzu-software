import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAppBySlug } from "@/data/apps";
import { getPriceDisplay } from "@/lib/types";
import PurchaseForm from "@/components/sections/PurchaseForm";

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
    title: `Buy ${app.name}`,
    description: app.short_description,
  };
}

export default async function PurchasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  // Not found, or exists but isn't set up for purchase: no purchase form
  // should ever render. Hiding the CTA elsewhere is a UX nicety, not
  // enforcement — this route is the actual gate.
  if (!app || !app.purchasable) notFound();

  const paymentMethods: Array<"online" | "direct"> = [
    ...(app.online_payment_enabled ? (["online"] as const) : []),
    ...(app.direct_payment_enabled ? (["direct"] as const) : []),
  ];

  const price = getPriceDisplay(app.price, app.discounted_price, app.currency);

  return (
    <section className="border-b border-border bg-bg py-16">
      <div className="container-page max-w-3xl">
        <Link
          href={`/apps/${app.slug}`}
          className="text-sm font-medium text-ink-soft hover:text-brand"
        >
          &larr; Back to {app.name}
        </Link>

        <div className="mt-6 flex items-center gap-4">
          {app.icon_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.icon_url}
              alt={`${app.name} icon`}
              className="h-14 w-14 shrink-0 rounded-2xl border border-border object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {app.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-brand">
              {app.tagline}
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
          {app.short_description}
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_1.2fr]">
          <div className="h-fit rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Order Summary
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-soft">Price</dt>
                <dd className="font-semibold text-ink">
                  {price.hasDiscount && price.regular && (
                    <span className="mr-2 text-xs font-normal text-ink-soft line-through">
                      {price.regular}
                    </span>
                  )}
                  {price.current ?? "Price coming soon"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-soft">Currency</dt>
                <dd className="font-medium text-ink">{app.currency}</dd>
              </div>
              {app.platform && (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-soft">Platform</dt>
                  <dd className="font-medium text-ink">{app.platform}</dd>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-soft">Payment Methods</dt>
                <dd className="text-right font-medium text-ink">
                  {paymentMethods.length > 0 ? (
                    <ul className="space-y-1">
                      {app.online_payment_enabled && <li>Online Payment</li>}
                      {app.direct_payment_enabled && <li>Direct Payment</li>}
                    </ul>
                  ) : (
                    <span className="text-ink-soft">
                      No payment method available yet
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Your Details
            </h2>
            <div className="mt-4">
              <PurchaseForm
                appSlug={app.slug}
                appName={app.name}
                onlinePaymentEnabled={app.online_payment_enabled}
                directPaymentEnabled={app.direct_payment_enabled}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
