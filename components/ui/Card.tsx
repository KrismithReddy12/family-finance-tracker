export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`rounded-2xl bg-surface ${className}`}>{children}</div>;
}
