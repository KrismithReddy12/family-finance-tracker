export function Group({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`overflow-hidden rounded-2xl bg-surface ${className}`}>{children}</div>;
}
