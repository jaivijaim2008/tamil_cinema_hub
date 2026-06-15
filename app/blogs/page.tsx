import { Suspense } from 'react'
import { client } from '../../sanity/client'
import { paginatedBlogsQuery, blogsCountQuery } from '../../lib/queries'
import BlogsPageClient from './BlogsPageClient'
import type { Blog } from '@/lib/types'

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const category = params.category || ''
  const q = params.q || ''
  const page = parseInt(params.page || '1')
  const pageSize = 12
  const start = (page - 1) * pageSize
  const end = start + pageSize

  let blogs: Blog[] = []
  let totalCount = 0

  try {
    ;[blogs, totalCount] = await Promise.all([
      client.fetch<Blog[]>(paginatedBlogsQuery(start, end), { category, q }).catch(() => []),
      client.fetch<number>(blogsCountQuery, { category, q }).catch(() => 0),
    ])
  } catch {}

  return (
    <Suspense fallback={null}>
      <BlogsPageClient
        initialBlogs={blogs}
        totalCount={totalCount}
        initialCategory={category}
        currentPage={page}
        totalPages={Math.ceil(totalCount / pageSize)}
      />
    </Suspense>
  )
}
