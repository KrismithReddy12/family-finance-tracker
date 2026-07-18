import { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
      {...props}
    />
  );
}

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-secondary">
      {children}
    </label>
  );
}
