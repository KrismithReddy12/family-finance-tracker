import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:opacity-90 active:scale-[0.98]",
  secondary:
    "bg-surface border border-hairline-strong text-ink hover:bg-surface-page active:scale-[0.98]",
  ghost: "text-ink-secondary hover:text-ink hover:bg-surface-page active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
