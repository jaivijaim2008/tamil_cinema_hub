'use client'

import { PortableText as SanityPortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import type { PortableTextBlock, SanityImageBlock } from '@/lib/types'

interface Props {
  value: PortableTextBlock[]
}

const components = {
  types: {
    image: ({ value }: { value: SanityImageBlock }) => {
      const src = value.asset ? urlFor(value).width(1200).url() : null
      if (!src) return null
      return (
        <figure className="my-8">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-card">
            <Image src={src} alt={value.alt || ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 80vw" />
          </div>
          {value.caption && (
            <figcaption className="text-xs text-text-muted mt-2 text-center">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold text-text-primary mt-10 mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold text-text-primary mt-8 mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">{children}</h3>,
    normal: ({ children }: any) => <p className="text-text-secondary leading-relaxed mb-4">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-3 border-accent-gold pl-4 my-6 italic text-text-secondary">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a href={value?.href} className="text-accent-gold hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }: any) => <strong className="font-bold text-text-primary">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
  },
}

export default function PortableText({ value }: Props) {
  return <SanityPortableText value={value} components={components} />
}
