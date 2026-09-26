import SectionHeading from "@/components/ui/SectionHeading";

const categories = [
  {
    label: "Financial Tools",
    description: "Practical apps for tracking money, lending, and everyday expenses.",
  },
  {
    label: "Business Software",
    description: "Inventory and operations tools built for small business realities.",
  },
  {
    label: "Productivity",
    description: "Simple tools that cut down on manual tracking and busywork.",
  },
  {
    label: "Education",
    description: "Interactive tools that make learning concepts easier to grasp.",
  },
];

export default function ProductCategories() {
  return (
    <section className="py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="What We Build"
          title="Focused on a Few Things, Done Well"
          description="JinZu products fall into a handful of practical categories rather than trying to do everything at once."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div key={category.label} className="bg-surface p-6">
              <p className="font-mono text-xs uppercase tracking-wide text-brand">
                {category.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
