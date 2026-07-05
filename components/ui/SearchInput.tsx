'use client'

import { Search, X } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  defaultValue?: string
  placeholder?: string
  onSearch?: (q: string) => void
  basePath?: string
}

export default function SearchInput({ defaultValue = '', placeholder = 'Search…', onSearch, basePath }: Props) {
  const [value, setValue] = useState(defaultValue)
  const router = useRouter()

  const submit = useCallback(() => {
    const q = value.trim()
    if (onSearch) {
      onSearch(q)
    } else if (basePath) {
      const sp = new URLSearchParams()
      if (q) sp.set('q', q)
      router.push(`${basePath}?${sp.toString()}`)
    }
  }, [value, onSearch, basePath, router])

  return (
    <div className="relative flex items-center w-full max-w-md">
      <Search size={16} className="absolute left-3 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50 transition-colors"
      />
      {value && (
        <button
          onClick={() => {
            setValue('')
            if (onSearch) {
              onSearch('')
            } else if (basePath) {
              router.push(basePath)
            }
          }}
          className="absolute right-3 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
