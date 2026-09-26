import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactForm from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with JinZu Software.",
};

export default function ContactPage() {
  return (
    <section className="py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Contact"
          title="Get in Touch"
          description="Have a question about a JinZu app, or something else on your mind? Send us a message."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-ink">
              Why reach out?
            </h2>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Questions about a JinZu application
              </li>
              <li className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Report a bug or issue you&apos;ve run into
              </li>
              <li className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Feedback or suggestions for future apps
              </li>
              <li className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                General inquiries about JinZu Software
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
