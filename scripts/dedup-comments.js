#!/usr/bin/env node
/**
 * Deduplicate comments across all blog posts in Sanity.
 * A "duplicate" is a comment with the same author + content on the same blog post.
 */

import { createClient } from '@sanity/client'

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'od67iigb'
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN

if (!SANITY_TOKEN) {
  console.error('Error: SANITY_WRITE_TOKEN environment variable is required')
  process.exit(1)
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  apiVersion: '2021-06-07',
  useCdn: false,
})

async function main() {
  console.log('Fetching all blog posts with comments...')

  const blogs = await client.fetch(
    `*[_type == "blog" && count(comments) > 0] {
      _id,
      title,
      slug,
      comments
    }`
  )

  console.log(`Found ${blogs.length} blog posts with comments.`)

  let totalDuplicatesRemoved = 0
  let blogsUpdated = 0

  for (const blog of blogs) {
    const comments = blog.comments || []
    if (comments.length < 2) continue

    // Deduplicate: keep first occurrence of each (author + content) pair
    const seen = new Map()
    const uniqueKeys = []
    const duplicateKeys = []

    for (const c of comments) {
      const key = `${(c.author || '').trim().toLowerCase()}|||${(c.content || '').trim()}`
      if (seen.has(key)) {
        duplicateKeys.push(c._key)
      } else {
        seen.set(key, c._key)
        uniqueKeys.push(c._key)
      }
    }

    if (duplicateKeys.length === 0) continue

    console.log(`\n"${blog.title}" (${blog.slug?.current}) — ${duplicateKeys.length} duplicates found`)

    // Remove duplicates from the comments array
    try {
      await client
        .patch(blog._id)
        .unset(duplicateKeys.map(k => `comments[_key == "${k}"]`))
        .commit()

      totalDuplicatesRemoved += duplicateKeys.length
      blogsUpdated++
      console.log(`  ✓ Removed ${duplicateKeys.length} duplicate(s)`)
    } catch (err) {
      console.error(`  ✗ Failed to remove duplicates:`, err.message)
    }
  }

  console.log(`\n═══════════════════════════════════════`)
  console.log(`Done!`)
  console.log(`  Blog posts updated: ${blogsUpdated}`)
  console.log(`  Total duplicates removed: ${totalDuplicatesRemoved}`)
}

main().catch(err => {
  console.error('Script failed:', err)
  process.exit(1)
})
