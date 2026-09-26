import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "JinZu Software is a software development initiative focused on creating practical digital solutions for everyday life.",
};

const focusAreas = [
  "Mobile applications",
  "Business software",
  "Productivity tools",
  "Financial management tools",
  "Educational applications",
];

const principles = [
  {
    title: "Practical over impressive",
    description:
      "We'd rather ship something genuinely useful than something flashy.",
  },
  {
    title: "Clarity over cleverness",
    description:
      "If a feature needs a manual to understand, it needs to be simpler.",
  },
  {
    title: "Built to last",
    description:
      "We design for the long term, not for a quick launch and abandonment.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border bg-bg py-20">
        <div className="container-page max-w-3xl">
          <SectionHeading eyebrow="About JinZu" title="About JinZu Software" />
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            JinZu Software is a software development initiative focused on
            creating practical digital solutions for everyday life. We build
            tools that are meant to be used, not just admired &mdash;
            designed around real, everyday problems for individuals,
            families, students, freelancers, and small businesses.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-xl font-semibold text-ink">What We Focus On</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {focusAreas.map((area) => (
              <li
                key={area}
                className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm text-ink"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-xl font-semibold text-ink">Who We Build For</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            JinZu products are built primarily for people in the Philippines
            first &mdash; individuals managing personal finances, students
            learning new concepts, and small businesses running day-to-day
            operations &mdash; with an eye toward supporting more users
            internationally as the product suite grows.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-xl font-semibold text-ink">Our Principles</h2>
          <div className="mt-6 space-y-5">
            {principles.map((principle) => (
              <div key={principle.title} className="flex gap-4">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    {principle.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-xl font-semibold text-ink">Where We&apos;re Headed</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            JinZu is actively growing its product suite &mdash; from personal
            finance tools to business and education software. Each new
            application follows the same approach: solve one problem well
            before adding the next one.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-3xl text-center">
          <h2 className="text-xl font-semibold text-ink">
            Want to know more?
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Take a look at what we&apos;re building or reach out directly.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/apps">Explore Our Apps</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contact Us
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
