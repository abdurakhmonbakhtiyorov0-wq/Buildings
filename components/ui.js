export function Container({ className = "", children, ...props }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({ as: Tag = "h2", className = "", children }) {
  return (
    <Tag className={`font-display text-2xl font-semibold leading-tight sm:text-[28px] ${className}`}>{children}</Tag>
  );
}

export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-96 animate-pulse rounded-2xl border border-line bg-white" />
      ))}
    </div>
  );
}
