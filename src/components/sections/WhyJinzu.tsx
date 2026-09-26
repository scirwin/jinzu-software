import SectionHeading from "@/components/ui/SectionHeading";

const reasons = [
  {
    title: "Simple by Design",
    description:
      "We create tools that are easy to understand and practical to use.",
  },
  {
    title: "Built for Real Needs",
    description:
      "Our applications focus on solving everyday problems rather than adding unnecessary complexity.",
  },
  {
    title: "Designed for Accessibility",
    description:
      "We aim to make useful technology accessible to individuals and small businesses.",
  },
  {
    title: "Continuously Improving",
    description:
      "Our products evolve based on real-world needs and feedback.",
  },
];

export default function WhyJinzu() {
  return (
    <section className="py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why JinZu"
          title="Why JinZu Software?"
          align="center"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <div
              key={reason.title}
              className="rounded-2xl border border-border p-6 transition-colors hover:border-brand/30"
            >
              <span className="font-mono text-xs text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
