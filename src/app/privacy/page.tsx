import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "JinZu Software's privacy policy.",
};

export default function PrivacyPage() {
  return (
    <section className="py-20">
      <div className="container-page max-w-2xl">
        <SectionHeading eyebrow="Legal" title="Privacy Policy" />
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            This page will describe how JinZu Software collects, uses, and
            protects information within our applications and website. The
            full policy is being finalized and will be published here.
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
