import { ButtonLink } from "@/components/ui/Button";
import ProductPreviewCard from "@/components/sections/ProductPreviewCard";
import AppCard from "@/components/ui/AppCard";
import SectionHeading from "@/components/ui/SectionHeading";
import WhyJinzu from "@/components/sections/WhyJinzu";
import ProductCategories from "@/components/sections/ProductCategories";
import ComingSoon from "@/components/sections/ComingSoon";
import TrustStrip from "@/components/sections/TrustStrip";
import SupabaseConfigNotice from "@/components/ui/SupabaseConfigNotice";
import { getApps } from "@/data/apps";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  const apps = await getApps();
  const featuredApps = apps.filter((app) => app.featured);

  return (
    <>
      <SupabaseConfigNotice />

      {/* Hero */}
      <section className="border-b border-border bg-bg py-20 sm:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="fade-in-up">
            <p className="text-eyebrow text-brand">JinZu Software</p>
            <h1 className="text-display mt-4 text-ink">
              Simple Digital Solutions for Everyday Life
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              JinZu Software builds practical digital tools designed to make
              everyday tasks simpler, smarter, and more manageable &mdash; for
              individuals, families, students, and small businesses.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/apps">Explore Our Apps</ButtonLink>
              <ButtonLink href="/about" variant="secondary">
                Learn About JinZu
              </ButtonLink>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <ProductPreviewCard />
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Featured Apps */}
      <section className="py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Featured Apps"
            title="Software Built for Real Life"
            description="Practical applications designed around how people actually manage money, business, and learning day to day."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
            {featuredApps.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
                <p className="text-sm font-medium text-ink">
                  No featured applications yet.
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  New JinZu applications will appear here as they become
                  available.
                </p>
                <ButtonLink href="/apps" variant="secondary" className="mt-5">
                  Browse All Apps
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      </section>

      <WhyJinzu />

      <ProductCategories />

      <ComingSoon apps={apps} />

      {/* CTA */}
      <section className="py-20">
        <div className="container-page">
          <div className="rounded-3xl border border-border bg-brand px-8 py-16 text-center sm:px-16">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Have an everyday problem that software could solve?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Explore the tools we&apos;re building at JinZu Software, or get
              in touch if you have questions.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/apps" variant="onBrand">
                Explore Our Apps
              </ButtonLink>
              <ButtonLink href="/contact" variant="onBrandOutline">
                Contact Us
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
