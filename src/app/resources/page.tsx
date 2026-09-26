import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides, tutorials, product updates, and announcements from JinZu Software.",
};

const categories = ["Guides", "Tutorials", "Product Updates", "Tips", "Announcements"];

export default function ResourcesPage() {
  return (
    <section className="py-20">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="Resources" title="Resources" />

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-ink-soft"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-base font-medium text-ink">
            Resources are coming soon.
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-soft">
            We&apos;re working on guides, tutorials, and updates for JinZu apps.
            Check back here for new content.
          </p>
        </div>
      </div>
    </section>
  );
}
