export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border-[3px] border-hairline-strong bg-surface shadow-[5px_5px_0_var(--shadow-ink)] ${className}`}
    >
      {children}
    </div>
  );
}
