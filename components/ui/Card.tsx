export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`rounded-2xl border-2 border-accent/30 bg-surface ${className}`}>{children}</div>;
}
