import Link from "next/link";

const footerLinks = [
  {
    heading: "Products",
    links: [{ href: "/apps", label: "All Apps" }],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/resources", label: "Resources" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight text-ink"
            >
              JinZu<span className="text-brand">.</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
              Building simple digital solutions for everyday life.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h3 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {group.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} JinZu Software. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
