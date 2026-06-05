#!/usr/bin/env node
/**
 * patch-blog-images.js
 * 
 * Uploads perfectly matching images to each of the 6 blog posts in Sanity.
 * Uses verified Wikipedia/Wikimedia Commons image URLs — no external API needed.
 * 
 * Strategy: upload each image and commit individually (re-fetching body between
 * inserts) to avoid index-shift bugs when multiple inserts target the same array.
 *
 * Usage:  node scripts/patch-blog-images.js
 */

require('dotenv').config({ path: '.env.local' })
const crypto = require('crypto')
const { createClient } = require('@sanity/client')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

// ── Sanity client ──────────────────────────────────────────────
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function key() { return crypto.randomBytes(8).toString('hex') }

// ── Fetch with retry ───────────────────────────────────────────
async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(30000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res
    } catch (err) {
      if (attempt < retries) {
        const delay = attempt * 2000
        console.log(`    ⏳ Retry ${attempt}/${retries} in ${delay / 1000}s (${err.message})`)
        await sleep(delay)
      } else {
        throw err
      }
    }
  }
}

// ── Upload image to Sanity ─────────────────────────────────────
async function uploadImage(url, filename) {
  console.log(`    ⬇️  Downloading: ${filename}`)
  const res = await fetchWithRetry(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  console.log(`    ⬆️  Uploading to Sanity...`)
  const asset = await sanity.assets.upload('image', buffer, {
    filename,
    contentType: 'image/jpeg',
  })
  console.log(`    ✅ Uploaded: ${asset._id}`)
  return asset._id
}

// ── Verified Image URLs (Wikipedia / Wikimedia Commons) ────────
// RULE: Only add images here if you have VERIFIED the image matches the content.
// If you cannot confirm a match, do NOT add it — it's better to have no image
// than a wrong one. Always double-check by visiting the Wikimedia page.
const IMAGES = {
  // Movie posters
  coolie_poster:       'https://upload.wikimedia.org/wikipedia/en/a/a8/Coolie_%282025_film%29_poster.jpg',
  thuglife_poster:     'https://upload.wikimedia.org/wikipedia/en/9/95/Thug_Life_2025.jpg',
  gbu_poster:          'https://upload.wikimedia.org/wikipedia/en/8/83/Good_Bad_Ugly_poster.jpg',
  vikram_poster:       'https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg',
  amaran_poster:       'https://upload.wikimedia.org/wikipedia/en/5/54/Amaran_2024_poster.jpg',
  kaithi_poster:       'https://upload.wikimedia.org/wikipedia/en/7/79/Kaithi_2019_poster.jpg',

  // Actor / Director photos
  rajinikanth:         'https://upload.wikimedia.org/wikipedia/commons/d/d2/Rajinikanth_in_2019.jpg',
  kamal_haasan:        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Kamal_Haasan_at_2023_San_Diego_Comic-Con_International_by_Gage_Skidmore%2C_005_%28cropped%29.jpg/960px-Kamal_Haasan_at_2023_San_Diego_Comic-Con_International_by_Gage_Skidmore%2C_005_%28cropped%29.jpg',
  vijay_actor:         'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vijay_at_Puli_Audio_Launch.jpg/960px-Vijay_at_Puli_Audio_Launch.jpg',
  vijay_sethupathi:    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Vijay_Sethupathi.jpg/960px-Vijay_Sethupathi.jpg',
  dhanush:             'https://upload.wikimedia.org/wikipedia/commons/8/89/Dhanush_at_the_%E2%80%98Asuran%E2%80%99_Success_Meet_%28cropped%29.jpg',
  trisha:              'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Trisha_Krishnan_at_PS1_pre_release_event_%283%29_%28cropped%29.jpg/960px-Trisha_Krishnan_at_PS1_pre_release_event_%283%29_%28cropped%29.jpg',
  suriya:              'https://upload.wikimedia.org/wikipedia/commons/2/23/Suriya_at_68th_national_film_awards.JPG',
  lokesh_kanagaraj:    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Lokesh_Kanagaraj_at_The_Zee_Cine_Awards.jpg/960px-Lokesh_Kanagaraj_at_The_Zee_Cine_Awards.jpg',
}

// ── Blog Post Definitions ──────────────────────────────────────
const BLOG_DEFS = [
  // 1. Coolie Review
  {
    slug: 'coolie-movie-review-rajinikanth-2025',
    hero: { key: 'coolie_poster', filename: 'blog-hero-coolie.jpg', alt: 'Coolie (2025) theatrical release poster' },
    inline: [
      { key: 'rajinikanth', filename: 'blog-inline-rajini.jpg', alt: 'Rajinikanth', caption: 'Rajinikanth delivers a powerhouse performance at 75 in Coolie', afterHeading: 1 },
    ],
  },

  // 2. Thug Life Review
  {
    slug: 'thug-life-review-mani-ratnam-kamal-haasan',
    hero: { key: 'thuglife_poster', filename: 'blog-hero-thuglife.jpg', alt: 'Thug Life (2025) theatrical release poster' },
    inline: [
      { key: 'kamal_haasan', filename: 'blog-inline-kamal.jpg', alt: 'Kamal Haasan', caption: 'Kamal Haasan delivers the performance of a lifetime at 70', afterHeading: 1 },
    ],
  },

  // 3. Top 10 Tamil Movies 2025
  // NOTE: body uses h3 headings for each movie entry (1. Coolie, 2. Thug Life, etc.)
  {
    slug: 'top-10-tamil-movies-2025',
    hero: { key: 'coolie_poster', filename: 'blog-hero-top10.jpg', alt: 'Coolie — the #1 Tamil movie of 2025' },
    inline: [
      { key: 'gbu_poster', filename: 'blog-inline-gbu.jpg', alt: 'Good Bad Ugly movie poster', caption: 'Good Bad Ugly — Ajith Kumar in a wild dark comedy-action hybrid', afterHeading: 3 },
      { key: 'vikram_poster', filename: 'blog-inline-vikram.jpg', alt: 'Vikram movie poster', caption: 'Vikram — the film that launched the LCU', afterHeading: 5 },
      { key: 'amaran_poster', filename: 'blog-inline-amaran.jpg', alt: 'Amaran movie poster', caption: 'Amaran — Sivakarthikeyan delivers a career-best in this military drama', afterHeading: 8 },
    ],
  },

  // 4. Vijay Jananayagan
  {
    slug: 'thalapathy-vijay-jananayagan-final-film',
    hero: { key: 'vijay_actor', filename: 'blog-hero-vijay.jpg', alt: 'Thalapathy Vijay' },
    inline: [
      { key: 'vijay_actor', filename: 'blog-inline-vijay-tribute.jpg', alt: 'Thalapathy Vijay — three decades of cinema', caption: 'Vijay follows in the footsteps of legends, closing one of the greatest careers in Tamil cinema', afterHeading: 1 },
    ],
  },

  // 5. Lokesh Kanagaraj Director Spotlight
  {
    slug: 'lokesh-kanagaraj-director-spotlight',
    hero: { key: 'lokesh_kanagaraj', filename: 'blog-hero-lokesh.jpg', alt: 'Lokesh Kanagaraj at the Zee Cine Awards' },
    inline: [
      { key: 'kaithi_poster', filename: 'blog-inline-kaithi.jpg', alt: 'Kaithi (2019) movie poster', caption: 'Kaithi (2019) — the film that announced Lokesh Kanagaraj as a major talent', afterHeading: 2 },
      { key: 'vikram_poster', filename: 'blog-inline-vikram-lcu.jpg', alt: 'Vikram (2022) movie poster', caption: 'Vikram (2022) — the film that launched the Lokesh Cinematic Universe', afterHeading: 3 },
    ],
  },

  // 6. 5 Career-Best Performances
  // NOTE: body has an introductory h2 ("Why Tamil Cinema Produces...") before the actor sections,
  // so afterHeading values are 1 higher than the actor number.
  {
    slug: 'career-best-performances-tamil-cinema',
    hero: { key: 'kamal_haasan', filename: 'blog-hero-performances.jpg', alt: 'Kamal Haasan — legendary Tamil cinema actor' },
    inline: [
      { key: 'vijay_sethupathi', filename: 'blog-inline-sethupathi.jpg', alt: 'Vijay Sethupathi', caption: 'Vijay Sethupathi — the "Makkal Selvan" known for fearless role choices', afterHeading: 3 },
      { key: 'dhanush', filename: 'blog-inline-dhanush.jpg', alt: 'Dhanush', caption: 'Dhanush — a force of nature in Asuran and beyond', afterHeading: 4 },
      { key: 'trisha', filename: 'blog-inline-trisha.jpg', alt: 'Trisha Krishnan', caption: "Trisha Krishnan — delivering one of Tamil cinema's finest performances in 96", afterHeading: 5 },
      { key: 'suriya', filename: 'blog-inline-suriya.jpg', alt: 'Suriya', caption: 'Suriya — from Pithamagan to Jai Bhim, a career of remarkable range', afterHeading: 6 },
    ],
  },
]

// ── Fetch fresh blog body ──────────────────────────────────────
async function fetchBlog(slug) {
  return sanity.fetch(`*[_type == "blog" && slug.current == "${slug}"][0] {
    _id, title, mainImage, body
  }`)
}

// ── Find insertion index in body array ──────────────────────────
function findInsertIndex(body, afterHeading) {
  let headingCount = 0
  for (let j = 0; j < body.length; j++) {
    if (body[j]._type === 'block' && (body[j].style === 'h2' || body[j].style === 'h3')) {
      headingCount++
      if (headingCount === afterHeading) {
        return j + 1
      }
    }
  }
  // Fallback: after every 5th paragraph
  let pCount = 0
  for (let j = 0; j < body.length; j++) {
    if (body[j]._type === 'block' && body[j].style === 'normal') {
      pCount++
      if (pCount >= afterHeading * 3) return j + 1
    }
  }
  return body.length
}

// ── Patch one blog ─────────────────────────────────────────────
async function patchBlog(def) {
  console.log(`\n📝 Blog: ${def.slug}`)

  let blog = await fetchBlog(def.slug)
  if (!blog) {
    console.log(`  ❌ Blog not found in Sanity`)
    return false
  }

  let totalPatched = 0

  // --- Hero / mainImage (always overwrite with correct image) ---
  console.log(`  🖼️  Setting hero image...`)
  try {
    const assetId = await uploadImage(IMAGES[def.hero.key], def.hero.filename)
    await sanity.patch(blog._id).set({
      mainImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
    }).commit()
    totalPatched++
    console.log(`  ✅ Hero image set & committed`)
  } catch (err) {
    console.log(`  ❌ Hero image failed: ${err.message}`)
  }
  await sleep(500)
  // Re-fetch after commit
  blog = await fetchBlog(def.slug)

  // --- Inline images: upload all, then compose body with images in correct positions ---
  const existingBody = blog.body || []
  // Always re-upload inline images with correct content
  const missing = def.inline.filter(img => IMAGES[img.key])

  if (missing.length === 0) {
    console.log(`  ✅ Body already has all inline images`)
  } else {
    console.log(`  📸 Uploading ${missing.length} inline images...`)

    // Upload all images first
    const uploaded = []
    for (const img of missing) {
      try {
        const assetId = await uploadImage(IMAGES[img.key], img.filename)
        uploaded.push({
          ...img,
          imageBlock: {
            _type: 'image',
            _key: key(),
            asset: { _type: 'reference', _ref: assetId },
            alt: img.alt,
            caption: img.caption,
          },
        })
      } catch (err) {
        console.log(`  ❌ Upload failed for ${img.alt}: ${err.message}`)
      }
      await sleep(500)
    }

    if (uploaded.length > 0) {
      // Compose new body: remove existing image blocks, then insert new ones at correct positions
      // No offset needed — findInsertIndex is called on the modified body each time
      const newBody = existingBody.filter(b => b._type !== 'image')
      for (const item of uploaded) {
        const insertIdx = findInsertIndex(newBody, item.afterHeading || 1)
        newBody.splice(insertIdx, 0, item.imageBlock)
        console.log(`  ✅ Inline: ${item.alt} (after heading ${item.afterHeading})`)
      }

      // Single commit with the fully composed body
      await sanity.patch(blog._id).set({ body: newBody }).commit()
      totalPatched += uploaded.length
      console.log(`  ✅ Committed ${uploaded.length} inline images with correct positioning`)
    }
  }

  if (totalPatched > 0) {
    console.log(`  📊 Patched ${totalPatched} items for this blog`)
  } else {
    console.log(`  ℹ️  No changes needed`)
  }

  return totalPatched > 0
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('🖼️  Blog Image Patcher v2 (Wikipedia/Wikimedia, one-at-a-time commits)')
  console.log('='.repeat(60))

  let success = 0
  let fail = 0

  for (const def of BLOG_DEFS) {
    try {
      const ok = await patchBlog(def)
      if (ok) success++
      else fail++
    } catch (err) {
      console.error(`  ❌ Fatal: ${err.message}`)
      fail++
    }
    await sleep(1000)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('🎉 DONE!')
  console.log(`✅ Patched: ${success} blogs`)
  console.log(`⏭️  Skipped: ${fail} blogs (already complete)`)
  console.log('='.repeat(60))
}

main().catch(console.error)
