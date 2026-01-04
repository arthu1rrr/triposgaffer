type PageTitleProps = {
  title: string;
  subtitle?: string;
};

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-4">
      <h1 className="text-4xl font-bold tracking-tight text-[var(--lightshadow)]">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-lg font-normal text-[var(--medshadow)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}