import Link from "next/link";
import { ButtonHTMLAttributes, MouseEventHandler } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "onBrand" | "onBrandOutline";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-dark focus-visible:outline-brand shadow-sm shadow-brand/20",
  secondary:
    "bg-white text-ink border border-border hover:border-brand hover:text-brand",
  ghost: "text-ink hover:text-brand",
  destructive:
    "bg-danger text-white hover:opacity-90 focus-visible:outline-danger",
  onBrand: "bg-white text-brand hover:bg-white/90",
  onBrandOutline:
    "border border-white/30 bg-transparent text-white hover:border-white hover:bg-white/10",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
  onClick,
}: {
  href: string;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
