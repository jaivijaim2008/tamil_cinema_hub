#!/usr/bin/env node
/**
 * AI Blog Generator v2 - TamilCinemaHub
 *
 * Generates high-quality Tamil cinema blog posts with:
 * - AI-generated thumbnails via Pollinations.ai (no API key needed)
 * - AI-generated inline images within blog content
 * - Long-form, valuable content via Groq AI (llama-3.3-70b)
 * - Published to Sanity CMS
 */

const { createClient } = require("@sanity/client");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) {
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;
if (!GROQ_API_KEY) { console.error("Missing GROQ_API_KEY"); process.exit(1); }
if (!SANITY_TOKEN) { console.error("Missing SANITY_WRITE_TOKEN"); process.exit(1); }

const sanity = createClient({
  projectId: "od67iigb", dataset: "production", apiVersion: "2024-01-01",
  token: SANITY_TOKEN, useCdn: false,
});

// ═══════════════════════════════════════════════════════════════
// BLOG TOPICS (10 posts)
// ═══════════════════════════════════════════════════════════════

const BLOG_TOPICS = [
  {
    title: "Jailer 2 Release Date Announced: Rajinikanth's Sequel Set for Ayudha Pooja",
    category: "News",
    imagePrompt: "Rajinikanth style Tamil cinema action hero in dark sunglasses and black suit, dramatic lighting, movie poster style, cinematic, vibrant colors, Indian cinema",
    inlineImagePrompts: [
      "Tamil cinema director Nelson Dilipkumar on film set with camera equipment, behind the scenes, cinematic lighting",
      "Ayudha Pooja festival celebration in Tamil Nadu with decorated vehicles and cinema banners, vibrant cultural scene"
    ],
    tags: ["jailer-2", "rajinikanth", "nelson", "2026"],
  },
  {
    title: "Is Jana Nayagan Censor Done? Here's What We Know About the A Certificate Buzz",
    category: "News",
    imagePrompt: "Vijay Tamil cinema hero in political drama scene, intense expression, Indian flag colors background, cinematic portrait, dramatic lighting",
    inlineImagePrompts: [
      "Indian film censorship board office with movie reels and certificates on wall, formal setting",
      "Tamil Nadu cinema fans celebrating outside theater with fireworks and cutouts, night scene, vibrant"
    ],
    tags: ["jana-nayagan", "vijay", "censor", "2026"],
  },
  {
    title: "Ladies and Ladies New Promo Out: Stylish Action Meets Wild Romance",
    category: "News",
    imagePrompt: "Stylish Tamil action movie scene with female leads in combat pose, neon lights, rain-soaked street, cinematic action photography, vibrant colors",
    inlineImagePrompts: [
      "Tamil cinema action sequence filming with stunts and wire work, behind the scenes, professional crew",
      "Romantic song sequence in Tamil movie with colorful costumes and dance, festive atmosphere"
    ],
    tags: ["ladies-and-ladies", "promo", "2026"],
  },
  {
    title: "Suriya Reunites with TJ Gnanavel for Hombale Films Next Big Project",
    category: "News",
    imagePrompt: "Suriya Tamil actor in intense dramatic pose, artistic lighting, Indian cinema style, cinematic portrait, warm tones",
    inlineImagePrompts: [
      "Film production studio with director reviewing footage on monitor, creative process, professional setting",
      "Hombale Films production logo and film reel montage, cinema industry aesthetic"
    ],
    tags: ["suriya", "tj-gnanavel", "hombale", "2026"],
  },
  {
    title: "Suriya 46 Wraps Filming: Fans Can't Keep Calm",
    category: "News",
    imagePrompt: "Tamil cinema hero celebration scene with confetti and film crew, wrap party atmosphere, joyful, vibrant cinematic style",
    inlineImagePrompts: [
      "Movie filming location in Chennai with camera crane and crew working, behind the scenes, golden hour lighting",
      "Suriya fan art collage with different movie roles, artistic illustration style, colorful"
    ],
    tags: ["suriya-46", "suriya", "wrap", "2026"],
  },
  {
    title: "DC Release Date Confirmed: Lokesh Kanagaraj and Wamiqa Gabbi's Next Big Thing",
    category: "News",
    imagePrompt: "Tamil cinema director looking through camera viewfinder on set, intense focus, professional film equipment, cinematic lighting",
    inlineImagePrompts: [
      "Tamil cinema action movie still with dramatic car chase scene, night city, neon lights, cinematic",
      "Film premiere red carpet event in Chennai with photographers and celebrities, glamorous atmosphere"
    ],
    tags: ["dc", "lokesh-kanagaraj", "wamiqa-gabbi", "2026"],
  },
  {
    title: "Mandaadi Release Date Locked: Soori's Sports Action Drama Arrives This September",
    category: "News",
    imagePrompt: "Tamil sports drama movie scene with athlete in training, determination, sweat and effort, cinematic sports photography, dramatic lighting",
    inlineImagePrompts: [
      "Tamil cinema boxing ring scene with intense match, crowd cheering, dramatic spotlight, cinematic",
      "Film crew shooting action sequence in stadium, behind the scenes, professional equipment"
    ],
    tags: ["mandaadi", "soori", "sports", "2026"],
  },
  {
    title: "Blast Box Office Update: Arjun Sarja's Film Crosses 70 Crore Worldwide",
    category: "Box Office",
    imagePrompt: "Box office collection board showing blockbuster numbers, cinema theater exterior with packed crowd, celebration atmosphere, vibrant",
    inlineImagePrompts: [
      "Indian cinema box office collection chart with rising graph, financial success concept, professional design",
      "Tamil cinema theater packed audience watching movie, emotional reactions, dramatic lighting"
    ],
    tags: ["blast", "arjun-sarja", "box-office", "2026"],
  },
  {
    title: "Top Tamil Movies Releasing in July 2026: Full Schedule and What to Expect",
    category: "Top List",
    imagePrompt: "Cinema calendar concept with movie posters overlapping, July 2026 highlighted, film industry aesthetic, vibrant collage style",
    inlineImagePrompts: [
      "Tamil cinema audience queuing outside theater for movie premiere, excitement, vibrant atmosphere",
      "Movie director chair with script and clapperboard, filmmaking concept, artistic still life"
    ],
    tags: ["july-2026", "releases", "kollywood"],
  },
  {
    title: "Kollywood This Week: Biggest Announcements, Wraps, and Box Office Numbers",
    category: "Feature",
    imagePrompt: "Tamil cinema industry montage with film reels, director chair, camera equipment, professional filmmaking concept art, cinematic",
    inlineImagePrompts: [
      "Film awards trophy and celebration, Indian cinema achievement concept, golden trophy on red velvet",
      "Tamil cinema social media buzz concept with trending hashtags and movie references, digital art style"
    ],
    tags: ["kollywood", "weekly", "announcements", "2026"],
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const uid = () => crypto.randomBytes(8).toString("hex");

const pBlock = (text) => ({ _type: "block", _key: uid(), style: "normal", children: [{ _type: "span", _key: uid(), text }] });
const h2Block = (text) => ({ _type: "block", _key: uid(), style: "h2", children: [{ _type: "span", _key: uid(), text }] });
const imgBlock = (ref, alt) => ({ _type: "image", _key: uid(), asset: { _type: "reference", _ref: ref }, alt: alt || "Tamil cinema" });

function download(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects <= 0) return reject(new Error("Too many redirects"));
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "TamilCinemaHub/2.0" }, timeout: 120000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, redirects - 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function uploadImage(buffer, filename) {
  const asset = await sanity.assets.upload("image", buffer, { filename, contentType: "image/jpeg" });
  return asset._id;
}

// ═══════════════════════════════════════════════════════════════
// AI IMAGE GENERATION (Cloudflare Worker AI - Stable Diffusion XL)
// ═══════════════════════════════════════════════════════════════

const CF_WORKER_URL = "https://tamilcinema-imagegen.jaitnea.workers.dev/";
const CF_API_KEY = "tamilcinema2026secrets";

async function genImg(prompt, filename, w = 1200, h = 675, retries = 2) {
  console.log(`    [CF-AI] ${filename}...`);
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(CF_WORKER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`CF Worker ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const id = await uploadImage(buf, filename);
      console.log(`    [CF-AI] OK ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
      return id;
    } catch (e) {
      console.error(`    [CF-AI] ${i}/${retries} fail: ${e.message}`);
      if (i < retries) await new Promise(r => setTimeout(r, 3000));
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// ROBUST JSON PARSER
// ═══════════════════════════════════════════════════════════════

function robustJsonParse(raw) {
  let s = raw.trim();
  // Strip markdown code fences
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "");
  }
  // Extract JSON object
  const m = s.match(/\{[\s\S]*\}/);
  if (m) s = m[0];

  // Attempt 1: direct parse
  try { return JSON.parse(s); } catch (_) { /* continue */ }

  // Attempt 2: remove all control chars except normal newlines inside strings
  // Replace literal \n inside JSON string values with \\n
  let cleaned = s
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")       // remove control chars
    .replace(/(?<=": ")((?:[^"\\]|\\.)*)(?=")/g, (match) => {   // inside string values
      return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, " ");
    });

  try { return JSON.parse(cleaned); } catch (_) { /* continue */ }

  // Attempt 3: aggressive - flatten everything into safe strings
  const fixed = s
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ")
    .replace(/\s{3,}/g, " ");

  return JSON.parse(fixed);
}

// ═══════════════════════════════════════════════════════════════
// GROQ AI CONTENT GENERATOR
// ═══════════════════════════════════════════════════════════════

const SYS = `You are an expert Tamil cinema blog writer for TamilCinemaHub.com.

Write HIGH-QUALITY, LONG-FORM blog posts:
- Engaging conversational English with personality
- 8-10 sections, each 3-5 paragraphs
- Total 1500-2000+ words
- Include specific facts, dates, numbers, analysis, predictions
- Use bullet points for key info lists
- End with compelling conclusion

OUTPUT (valid JSON only, no markdown):
{"excerpt":"2-3 sentence summary","seoTitle":"max 60 chars","seoDescription":"max 155 chars","sections":[{"heading":"H2 heading","content":"3-5 paragraphs"}],"readTime":8}

CRITICAL: Return ONLY the JSON object. No extra text. No code fences.`;

async function genContent(title, category, tags) {
  const userPrompt = `Write a blog post: "${title}"\nCategory: ${category}\nTags: ${tags.join(", ")}\n\n8-10 sections, 1500-2000 words. Include facts, analysis, predictions. Make it valuable for Tamil cinema fans.`;
  console.log(`  [Groq] ${title.slice(0, 55)}...`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", max_tokens: 3000, temperature: 0.7,
          messages: [{ role: "system", content: SYS }, { role: "user", content: userPrompt }],
        }),
      });

      if (res.status === 429) {
        const w = attempt * 25;
        console.log(`    Rate limited. Waiting ${w}s (attempt ${attempt}/3)...`);
        await new Promise(r => setTimeout(r, w * 1000));
        continue;
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(`Groq ${res.status}: ${e.error?.message || "?"}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response");

      return robustJsonParse(text);
    } catch (err) {
      if (attempt === 3) throw err;
      if (err.message.includes("429") || err.message.includes("rate")) {
        await new Promise(r => setTimeout(r, attempt * 25000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("All retries exhausted");
}

// ═══════════════════════════════════════════════════════════════
// AI OUTPUT -> PORTABLE TEXT
// ═══════════════════════════════════════════════════════════════

function toPortableText(ai, inlineIds = []) {
  const blocks = [];
  let imgIdx = 0;

  for (let i = 0; i < (ai.sections || []).length; i++) {
    const sec = ai.sections[i];
    if (sec.heading) blocks.push(h2Block(sec.heading));
    if (sec.content) {
      for (const para of sec.content.split(/\n\n+/).filter(Boolean)) {
        const t = para.trim();
        if (t) blocks.push(pBlock(t));
      }
    }
    // Insert inline image after sections 2, 4, 6
    if (i > 0 && i % 2 === 0 && imgIdx < inlineIds.length) {
      blocks.push(imgBlock(inlineIds[imgIdx], sec.heading || "Tamil cinema"));
      imgIdx++;
    }
  }
  return blocks;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log("TamilCinemaHub AI Blog Generator v2");
  console.log("=".repeat(60));
  console.log("AI thumbnails + inline images + long-form content\n");

  // Step 1: AI thumbnails
  console.log("Step 1: AI thumbnails via Pollinations.ai...\n");
  const thumbs = [];
  for (let i = 0; i < BLOG_TOPICS.length; i++) {
    thumbs.push(await genImg(BLOG_TOPICS[i].imagePrompt, `thumb-${i + 1}-${Date.now()}.jpg`, 1200, 675));
  }
  console.log(`\nThumbnails: ${thumbs.filter(Boolean).length}/${BLOG_TOPICS.length}\n`);

  // Step 2: Content + inline images + publish
  console.log("Step 2: Content + inline images + publish...\n");
  let ok = 0, fail = 0;

  for (let i = 0; i < BLOG_TOPICS.length; i++) {
    const t = BLOG_TOPICS[i];
    try {
      const ai = await genContent(t.title, t.category, t.tags);

      console.log(`  [${i + 1}] Inline images...`);
      const inlines = [];
      for (const prompt of (t.inlineImagePrompts || [])) {
        const id = await genImg(prompt, `inline-${i + 1}-${Date.now()}.jpg`, 1000, 562);
        if (id) inlines.push(id);
      }

      const body = toPortableText(ai, inlines);
      const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);
      const words = body.filter(b => b._type === "block").reduce((a, b) => a + (b.children?.map(c => c.text).join(" ") || "").split(/\s+/).filter(Boolean).length, 0);

      const doc = {
        _type: "blog",
        title: t.title,
        slug: { current: slug },
        author: "TamilCinemaHub Editorial",
        authorBio: "TamilCinemaHub Editorial team covers the latest in Kollywood — news, reviews, box office updates, and in-depth features.",
        publishedAt: new Date().toISOString(),
        category: t.category,
        excerpt: ai.excerpt || t.title,
        body,
        seoTitle: (ai.seoTitle || t.title).slice(0, 60),
        seoDescription: (ai.seoDescription || ai.excerpt || "").slice(0, 155),
        tags: t.tags,
        readTime: ai.readTime || Math.max(5, Math.ceil(words / 250)),
        featured: i < 3,
      };
      if (thumbs[i]) doc.mainImage = { _type: "image", asset: { _type: "reference", _ref: thumbs[i] } };

      const r = await sanity.create(doc);
      ok++;
      console.log(`  OK [${t.category}] ${t.title}`);
      console.log(`    ${words} words | ${ai.sections?.length || 0} sections | ${1 + inlines.length} images\n`);

      // 15s delay for Groq 12K TPM limit
      await new Promise(r => setTimeout(r, 15000));
    } catch (err) {
      fail++;
      console.error(`  FAIL: ${t.title} — ${err.message}\n`);
    }
  }

  console.log("=".repeat(60));
  console.log(`Done! ${ok} created, ${fail} failed`);
  console.log("Verify: https://tamilcinemahub.xyz/blogs");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
