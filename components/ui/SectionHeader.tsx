import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  overline?: string
  title: string
  viewAllHref?: string
  viewAllLabel?: string
}

export default function SectionHeader({ overline, title, viewAllHref, viewAllLabel = 'View All' }: Props) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        {overline && (
          <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-2">{overline}</p>
        )}
        <h2 className="font-playfair text-text-primary text-[clamp(22px,3.5vw,40px)] leading-tight">
          {title}
        </h2>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent-gold transition-colors shrink-0"
        >
          {viewAllLabel} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
