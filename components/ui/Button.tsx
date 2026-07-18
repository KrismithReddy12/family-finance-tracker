import { ButtonHTMLAttributes } from "react";
import Link, { LinkProps } from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink border-b-[5px] border-accent-strong hover:brightness-105 active:translate-y-[3px] active:border-b-[2px]",
  secondary:
    "bg-surface text-ink border-2 border-b-[5px] border-hairline-strong hover:bg-surface-page hover:border-accent active:translate-y-[3px] active:border-b-2",
  ghost: "text-ink-secondary hover:text-ink hover:bg-surface-page",
};

const BASE_CLASSES =
  "font-display inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 disabled:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

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
