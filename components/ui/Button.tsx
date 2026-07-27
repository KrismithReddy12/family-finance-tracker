import { ButtonHTMLAttributes } from "react";
import Link, { LinkProps } from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-105 active:brightness-90",
  secondary: "bg-surface text-ink hover:brightness-110 active:brightness-90",
  ghost: "text-ink-secondary hover:bg-surface hover:text-ink",
};

const BASE_CLASSES =
  "font-display inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`} {...props} />
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: LinkProps & { variant?: Variant; className?: string; children: React.ReactNode }) {
  return (
    <Link className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
