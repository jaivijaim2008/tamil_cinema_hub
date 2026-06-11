export default function TickerBar({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="w-full overflow-hidden bg-accent-gold/5 border-y border-border-accent py-2.5">
      <div
        className="flex gap-12 animate-tickerScroll whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-xs font-mono text-accent-gold tracking-[0.2em] uppercase shrink-0"
          >
            {i % 2 === 0 ? '◆' : '·'} {item}
          </span>
        ))}
      </div>
    </div>
  )
}
