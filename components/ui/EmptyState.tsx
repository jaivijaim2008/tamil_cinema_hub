interface Props {
  icon?: React.ReactNode
  title: string
  description?: string
}

export default function EmptyState({ icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      {icon && <div className="text-text-muted mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-sm">{description}</p>}
    </div>
  )
}
