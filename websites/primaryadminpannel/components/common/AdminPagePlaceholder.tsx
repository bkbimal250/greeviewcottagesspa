interface AdminPagePlaceholderProps {
  title: string;
  description: string;
}

export default function AdminPagePlaceholder({
  title,
  description,
}: AdminPagePlaceholderProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[var(--primary)]">
          Green View Cottages
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
        This admin section is ready to connect to the
        backend-supported Green View Cottages workflow.
      </div>
    </section>
  );
}
