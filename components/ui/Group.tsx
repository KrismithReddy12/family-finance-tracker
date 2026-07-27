export function Group({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border-2 border-accent/30 bg-surface ${className}`}>
      {children}
    </div>
  );
}
