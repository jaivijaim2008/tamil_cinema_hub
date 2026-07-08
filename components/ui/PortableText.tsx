'use client'

import React from 'react'
import { PortableText as SanityPortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import type { PortableTextBlock, SanityImageBlock } from '@/lib/types'

interface Props {
  value: (PortableTextBlock | SanityImageBlock)[]
}

const components: Partial<import('@portabletext/react').PortableTextReactComponents> = {
  types: {
    image: ({ value }: { value: SanityImageBlock }) => {
      const src = value.asset ? urlFor(value).width(1200).url() : null
      if (!src) return null
      return (
        <figure className="my-6 sm:my-8">
          <div className="relative w-full rounded-xl overflow-hidden bg-bg-card">
            <Image
              src={src}
              alt={value.alt || ''}
              width={1200}
              height={800}
              className="w-full h-auto object-contain rounded-xl"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 720px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-xs text-text-muted mt-2 text-center px-2">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mt-8 sm:mt-10 mb-3 sm:mb-4">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary mt-6 sm:mt-8 mb-2 sm:mb-3">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary mt-5 sm:mt-6 mb-2">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-text-primary mt-4 sm:mt-5 mb-2">{children}</h4>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-[15px] sm:text-base text-text-secondary leading-[1.75] sm:leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-3 border-accent-gold pl-4 my-5 sm:my-6 italic text-text-secondary">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => (
      <a href={value?.href} className="text-accent-gold hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-text-primary">{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside space-y-2 mb-4 text-text-secondary">{children}</ul>,
    number: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-text-secondary">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => <li className="text-[15px] sm:text-base leading-[1.75] sm:leading-relaxed">{children}</li>,
    number: ({ children }: { children?: React.ReactNode }) => <li className="text-[15px] sm:text-base leading-[1.75] sm:leading-relaxed">{children}</li>,
  },
}

export default function PortableText({ value }: Props) {
  return <SanityPortableText value={value} components={components} />
}
