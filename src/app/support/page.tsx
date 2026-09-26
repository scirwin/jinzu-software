import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Find answers to common questions or get in touch with JinZu Software support.",
};

const generalFaqs = [
  {
    question: "How do I get a JinZu app?",
    answer:
      "Visit the Downloads page for each app's availability. Apps that aren't released yet will show \u201cDownload link coming soon.\u201d",
  },
  {
    question: "Are JinZu apps free?",
    answer:
      "Pricing details for each app will be shared as they become available. Check the individual app page for the latest information.",
  },
  {
    question: "I found a bug. How do I report it?",
    answer:
      "Use the Contact page to send details about the issue you encountered, including the app and what you were doing when it happened.",
  },
  {
    question: "Which platforms do JinZu apps run on?",
    answer:
      "This varies by app. Platform availability is listed on each individual app page.",
  },
];

export default function SupportPage() {
  return (
    <section className="py-20">
      <div className="container-page max-w-3xl">
        <SectionHeading
          eyebrow="Support"
          title="Support"
          description="Answers to common questions, plus a way to reach us directly if you need more help."
        />

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            Frequently Asked Questions
          </h2>
          <div className="mt-5">
            <FaqAccordion items={generalFaqs} />
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-ink">
            Still need help?
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Reach out and we&apos;ll get back to you.
          </p>
          <div className="mt-5">
            <ButtonLink href="/contact">Contact Support</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
