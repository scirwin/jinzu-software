import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "JinZu Software's terms of service.",
};

export default function TermsPage() {
  return (
    <section className="py-20">
      <div className="container-page max-w-2xl">
        <SectionHeading eyebrow="Legal" title="Terms of Service" />
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            This page will describe the terms governing use of JinZu Software
            applications and this website. The full terms are being
            finalized and will be published here.
          </p>
          <p>
            If you have questions in the meantime, please reach out through
            the Contact page.
          </p>
        </div>
      </div>
    </section>
  );
}
