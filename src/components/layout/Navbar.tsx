"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-surface/85 backdrop-blur-md transition-shadow ${
        scrolled
          ? "border-border shadow-[0_1px_0_rgba(11,18,32,0.04),0_8px_24px_-16px_rgba(11,18,32,0.25)]"
          : "border-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink"
        >
          JinZu<span className="text-brand">.</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-brand"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-brand" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <ButtonLink href="/apps" className="text-sm">
            Explore Apps
          </ButtonLink>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-surface px-6 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 text-sm font-medium ${
                    isActive(link.href)
                      ? "bg-brand-light text-brand"
                      : "text-ink-soft hover:bg-brand-light hover:text-brand"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href="/apps" onClick={() => setOpen(false)} className="mt-4 w-full">
            Explore Apps
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
