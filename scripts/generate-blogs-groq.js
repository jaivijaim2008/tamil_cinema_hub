#!/usr/bin/env node
/**
 * AI Blog Generator - TamilCinemaHub
 *
 * Uses Groq AI (llama-3.3-70b) to generate high-quality Tamil cinema blog posts,
 * downloads Unsplash images, and publishes to Sanity.
 *
 * Usage:
 *   node scripts/generate-blogs-groq.js
 *
 * Requires:
 *   - GROQ_API_KEY in .env.local
 *   - SANITY_WRITE_TOKEN in .env.local
 */

const { createClient } = require("@sanity/client");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
// dotenv removed — manual .env.local loading below avoids Next.js @next/env override
// Load .env.local manually to avoid Next.js @next/env override
const fs = require("fs");
const path = require("path");
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY in .env.local");
  console.error("Get one at: https://console.groq.com");
  process.exit(1);
}

if (!SANITY_TOKEN) {
  console.error("Missing SANITY_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const sanity = createClient({
  projectId: "od67iigb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: SANITY_TOKEN,
  useCdn: false,
});

// ═══════════════════════════════════════════════════════════════
// BLOG TITLES TO GENERATE
// ═══════════════════════════════════════════════════════════════

const BLOG_TOPICS = [
  {
    title: "Jailer 2 Release Date Announced: Rajinikanth's Sequel Set for Ayudha Pooja",
    category: "News",
    imageQuery: "cinema action movie",
    tags: ["jailer-2", "rajinikanth", "nelson", "ayudha-pooja", "2026", "sequel"],
  },
  {
    title: "Is Jana Nayagan Censor Done? Here's What We Know About the 'A' Certificate Buzz",
    category: "News",
    imageQuery: "movie film set",
    tags: ["jana-nayagan", "vijay", "censor", "2026", "final-film"],
  },
  {
    title: "Ladies and Ladies New Promo Out: Stylish Action Meets Wild Romance",
    category: "News",
    imageQuery: "action movie scene",
    tags: ["ladies-and-ladies", "promo", "2026", "action", "romance"],
  },
  {
    title: "Suriya Reunites with TJ Gnanavel for Hombale Films Next Big Project",
    category: "News",
    imageQuery: "film production studio",
    tags: ["suriya", "tj-gnanavel", "hombale", "2026", "upcoming"],
  },
  {
    title: "Suriya 46 Wraps Filming: Fans Can't Keep Calm",
    category: "News",
    imageQuery: "movie filming behind scenes",
    tags: ["suriya-46", "suriya", "wrap", "2026", "venky-atluri"],
  },
  {
    title: "DC Release Date Confirmed: Lokesh Kanagaraj and Wamiqa Gabbi's Next Big Thing",
    category: "News",
    imageQuery: "director film camera",
    tags: ["dc", "lokesh-kanagaraj", "wamiqa-gabbi", "2026", "release-date"],
  },
  {
    title: "Mandaadi Release Date Locked: Soori's Sports Action Drama Arrives This September",
    category: "News",
    imageQuery: "sports action drama",
    tags: ["mandaadi", "soori", "sports", "action", "september-2026"],
  },
  {
    title: "Blast Box Office Update: Arjun Sarja's Film Crosses 70 Crore Worldwide",
    category: "Box Office",
    imageQuery: "box office cinema",
    tags: ["blast", "arjun-sarja", "box-office", "70-crore", "2026"],
  },
  {
    title: "Top Tamil Movies Releasing in July 2026: Full Schedule and What to Expect",
    category: "Top List",
    imageQuery: "movie release calendar",
    tags: ["july-2026", "releases", "upcoming", "schedule", "kollywood"],
  },
  {
    title: "Kollywood This Week: Biggest Announcements, Wraps, and Box Office Numbers",
    category: "Feature",
    imageQuery: "tamil cinema industry",
    tags: ["kollywood", "weekly", "announcements", "box-office", "2026"],
  },
];

// ═══════════════════════════════════════════════════════════════
// UNSPLASH IMAGES (free to use)
// ═══════════════════════════════════════════════════════════════

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1585644198527-05f156a4b194?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&h=675&fit=crop&q=85",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=675&fit=crop&q=85",
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function key() {
  return crypto.randomBytes(8).toString("hex");
}

function p(text) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    children: [{ _type: "span", _key: key(), text }],
  };
}

function pBold(text) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    children: [{ _type: "span", _key: key(), text, marks: ["strong"] }],
  };
}

function h2(text) {
  return {
    _type: "block",
    _key: key(),
    style: "h2",
    children: [{ _type: "span", _key: key(), text }],
  };
}

function h3(text) {
  return {
    _type: "block",
    _key: key(),
    style: "h3",
    children: [{ _type: "span", _key: key(), text }],
  };
}

function quote(text) {
  return {
    _type: "block",
    _key: key(),
    style: "blockquote",
    children: [{ _type: "span", _key: key(), text }],
  };
}

function bulletItem(text) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", _key: key(), text }],
  };
}

// Image download & upload
function download(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    proto
      .get(url, { headers: { "User-Agent": "TamilCinemaHub/1.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function uploadImage(url, filename) {
  const buf = await download(url);
  const asset = await sanity.assets.upload("image", buf, {
    filename,
    contentType: "image/jpeg",
  });
  return asset._id;
}

// ═══════════════════════════════════════════════════════════════
// GROQ AI CONTENT GENERATOR
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are an expert Tamil cinema (Kollywood) blog writer for TamilCinemaHub.com.

Write engaging, informative blog posts about Tamil cinema news, reviews, and features.

STYLE GUIDELINES:
- Write in engaging, conversational English
- Use vivid descriptions and storytelling
- Include specific details (dates, numbers, names)
- End with a compelling conclusion or call-to-action
- Keep paragraphs short (2-3 sentences max)
- Use subheadings to break up content

OUTPUT FORMAT (JSON):
{
  "excerpt": "2-3 sentence summary for the blog card",
  "seoTitle": "SEO-optimized title (60 chars max)",
  "seoDescription": "Meta description (155 chars max)",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content (2-4 paragraphs)"
    }
  ],
  "readTime": 5
}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks.`;

async function generateBlogContent(title, category, tags) {
  const prompt = `Write a blog post titled: "${title}"

Category: ${category}
Tags: ${tags.join(", ")}

Write 4-5 sections with engaging content about this Tamil cinema topic. Include specific details, dates, and names where relevant. Make it informative and entertaining.`;

  console.log(`  [Groq] Generating content for: ${title.slice(0, 60)}...`);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq API error ${res.status}: ${err.error?.message || "unknown"}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from Groq");
  }

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(jsonStr);
}

// ═══════════════════════════════════════════════════════════════
// CONVERT AI OUTPUT TO PORTABLE TEXT
// ═══════════════════════════════════════════════════════════════

function aiToPortableText(aiOutput) {
  const blocks = [];

  for (const section of aiOutput.sections || []) {
    // Add section heading
    if (section.heading) {
      blocks.push(h2(section.heading));
    }

    // Add section content (split by paragraphs)
    if (section.content) {
      const paragraphs = section.content.split(/\n\n+/).filter(Boolean);
      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (trimmed) {
          blocks.push(p(trimmed));
        }
      }
    }
  }

  return blocks;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log("TamilCinemaHub AI Blog Generator");
  console.log("=".repeat(50));
  console.log();

  // Step 1: Upload images
  console.log("Step 1: Uploading images...\n");
  const imageIds = [];

  for (let i = 0; i < BLOG_TOPICS.length; i++) {
    const url = UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length];
    try {
      const assetId = await uploadImage(url, `blog-${i + 1}.jpg`);
      imageIds.push(assetId);
      process.stdout.write(`  Uploaded ${i + 1}/${BLOG_TOPICS.length}\r`);
    } catch (err) {
      console.error(`\n  Failed to upload image ${i + 1}: ${err.message}`);
      imageIds.push(null);
    }
  }
  console.log(`\n  Done! ${imageIds.filter(Boolean).length} images uploaded\n`);

  // Step 2: Generate and publish blogs
  console.log("Step 2: Generating blog content with Groq AI...\n");
  let created = 0;
  let failed = 0;

  for (let i = 0; i < BLOG_TOPICS.length; i++) {
    const topic = BLOG_TOPICS[i];

    try {
      // Generate content with AI
      const aiOutput = await generateBlogContent(topic.title, topic.category, topic.tags);
      const body = aiToPortableText(aiOutput);

      // Create slug from title
      const slug = topic.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 96);

      // Build Sanity document
      const doc = {
        _type: "blog",
        title: topic.title,
        slug: { current: slug },
        author: "TamilCinemaHub Editorial",
        publishedAt: new Date().toISOString(),
        category: topic.category,
        excerpt: aiOutput.excerpt || topic.title,
        body: body,
        seoTitle: aiOutput.seoTitle || topic.title,
        seoDescription: aiOutput.seoDescription || aiOutput.excerpt || "",
        tags: topic.tags,
        readTime: aiOutput.readTime || 5,
        featured: i < 3, // First 3 are featured
      };

      // Attach image if available
      if (imageIds[i]) {
        doc.mainImage = {
          _type: "image",
          asset: { _type: "reference", _ref: imageIds[i] },
        };
      }

      // Publish to Sanity
      const result = await sanity.create(doc);
      created++;
      console.log(`  [${topic.category}] ${topic.title}`);
      console.log(`     ID: ${result._id} | Image: ${imageIds[i] ? "YES" : "NO"}\n`);

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      failed++;
      console.error(`  FAILED: ${topic.title}`);
      console.error(`     Error: ${err.message}\n`);
    }
  }

  console.log("=".repeat(50));
  console.log(`Done! Created ${created} blog posts (${failed} failed)`);
  console.log();
  console.log("Verify at:");
  console.log("  https://tamilcinemahub.xyz/blogs");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
