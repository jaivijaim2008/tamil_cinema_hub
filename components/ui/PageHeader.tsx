interface Props {
  label?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({ label, title, description, action }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        {label && (
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent-gold mb-2 block">
            {label}
          </span>
        )}
        <h1 className="text-2xl md:text-4xl font-bold text-text-primary">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary mt-2 max-w-lg">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
