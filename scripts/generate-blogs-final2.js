#!/usr/bin/env node
const { createClient } = require("@sanity/client");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) { const k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim(); if (!process.env[k]) process.env[k] = v; }
  }
}

const K = process.env.GROQ_API_KEY;
const T = process.env.SANITY_WRITE_TOKEN;
if (!K) { console.error("Missing GROQ_API_KEY"); process.exit(1); }
if (!T) { console.error("Missing SANITY_WRITE_TOKEN"); process.exit(1); }

const s = createClient({ projectId: "od67iigb", dataset: "production", apiVersion: "2024-01-01", token: T, useCdn: false });
const uid = () => crypto.randomBytes(8).toString("hex");
const pB = (t) => ({ _type: "block", _key: uid(), style: "normal", children: [{ _type: "span", _key: uid(), text: t }] });
const h2B = (t) => ({ _type: "block", _key: uid(), style: "h2", children: [{ _type: "span", _key: uid(), text: t }] });
const imgB = (r, a) => ({ _type: "image", _key: uid(), asset: { _type: "reference", _ref: r }, alt: a || "Tamil cinema" });

function dl(url, redir = 5) {
  return new Promise((ok, no) => {
    if (redir <= 0) return no(new Error("redirects"));
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "TamilCinemaHub/2.0" }, timeout: 120000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return dl(res.headers.location, redir - 1).then(ok, no);
      if (res.statusCode !== 200) return no(new Error("HTTP " + res.statusCode));
      const c = []; res.on("data", d => c.push(d)); res.on("end", () => ok(Buffer.concat(c))); res.on("error", no);
    }).on("error", no);
  });
}

async function upImg(buf, fn) {
  const a = await s.assets.upload("image", buf, { filename: fn, contentType: "image/jpeg" });
  return a._id;
}

async function genImg(prompt, fn, w = 1200, h = 675) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${Math.floor(Math.random() * 99999)}&nologo=true&model=flux`;
  console.log(`  [IMG] ${fn}...`);
  try {
    const buf = await dl(url);
    const id = await upImg(buf, fn);
    console.log(`  [IMG] OK ${fn} (${(buf.length / 1024).toFixed(0)}KB)`);
    return id;
  } catch (e) {
    console.error(`  [IMG] FAIL: ${e.message}`);
    return null;
  }
}

function robustParse(raw) {
  let s = raw.trim();
  if (s.startsWith("```")) s = s.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "");
  const m = s.match(/\{[\s\S]*\}/);
  if (m) s = m[0];
  try { return JSON.parse(s); } catch (_) {}
  let c = s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  try { return JSON.parse(c); } catch (_) {}
  c = s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ").replace(/\s{3,}/g, " ");
  return JSON.parse(c);
}

const SYS = `You are an expert Tamil cinema blog writer for TamilCinemaHub.com.

Write HIGH-QUALITY, LONG-FORM blog posts:
- Engaging conversational English with personality
- 8-10 sections, each 3-5 paragraphs
- Total 1500-2000+ words
- Include specific facts, dates, numbers, analysis, predictions
- Use bullet points for key info lists
- End with compelling conclusion

OUTPUT FORMAT (valid JSON only, no markdown fences):
{"excerpt":"2-3 sentence summary","seoTitle":"max 60 chars","seoDescription":"max 155 chars","sections":[{"heading":"section heading","content":"section content with paragraphs separated by double newlines"}],"readTime":8}

IMPORTANT: Return ONLY the raw JSON object. No extra text before or after.`;

async function genContent(title, category, tags) {
  console.log(`  [Groq] ${title.slice(0, 55)}...`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", max_tokens: 3000, temperature: 0.7,
          messages: [{ role: "system", content: SYS }, { role: "user", content: `Write a blog post: "${title}"\nCategory: ${category}\nTags: ${tags.join(", ")}\n\n8-10 sections, 1500-2000 words. Include facts, analysis, predictions.` }],
        }),
      });
      if (res.status === 429) {
        const w = attempt * 25;
        console.log(`    Rate limited. Waiting ${w}s...`);
        await new Promise(r => setTimeout(r, w * 1000));
        continue;
      }
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(`Groq ${res.status}: ${e.error?.message || "?"}`); }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response");
      return robustParse(text);
    } catch (err) {
      if (attempt === 3) throw err;
      if (err.message.includes("429") || err.message.includes("rate")) { await new Promise(r => setTimeout(r, attempt * 25000)); continue; }
      throw err;
    }
  }
  throw new Error("All retries exhausted");
}

function toPT(ai, inlineIds = []) {
  const blocks = [];
  let imgIdx = 0;
  for (let i = 0; i < (ai.sections || []).length; i++) {
    const sec = ai.sections[i];
    if (sec.heading) blocks.push(h2B(sec.heading));
    if (sec.content) {
      for (const para of sec.content.split(/\n\n+/).filter(Boolean)) {
        const t = para.trim();
        if (t) blocks.push(pB(t));
      }
    }
    if (i > 0 && i % 2 === 0 && imgIdx < inlineIds.length) {
      blocks.push(imgB(inlineIds[imgIdx], sec.heading || "Tamil cinema"));
      imgIdx++;
    }
  }
  return blocks;
}

const TOPICS = [
  {
    title: "Top Tamil Movies Releasing in July 2026: Full Schedule and What to Expect",
    category: "Top List",
    imagePrompt: "Cinema calendar concept with movie posters overlapping July 2026 highlighted film industry aesthetic vibrant collage style",
    inlineImagePrompts: [
      "Tamil cinema audience queuing outside theater for movie premiere excitement vibrant atmosphere",
      "Movie director chair with script and clapperboard filmmaking concept artistic still life"
    ],
    tags: ["july-2026", "releases", "kollywood"],
  },
  {
    title: "Kollywood This Week: Biggest Announcements Wraps and Box Office Numbers",
    category: "Feature",
    imagePrompt: "Tamil cinema industry montage with film reels director chair camera equipment professional filmmaking concept art cinematic",
    inlineImagePrompts: [
      "Film awards trophy and celebration Indian cinema achievement concept golden trophy on red velvet",
      "Tamil cinema social media buzz concept with trending hashtags and movie references digital art style"
    ],
    tags: ["kollywood", "weekly", "2026"],
  },
];

async function main() {
  console.log("Generating final 2 blog posts...\n");
  let ok = 0;

  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i];
    try {
      console.log(`[${i + 1}/2] ${t.title}`);
      const thumb = await genImg(t.imagePrompt, `thumb-final-${i}-${Date.now()}.jpg`);

      const inlines = [];
      for (const pr of t.inlineImagePrompts) {
        const id = await genImg(pr, `inl-final-${i}-${inlines.length}-${Date.now()}.jpg`, 1000, 562);
        if (id) inlines.push(id);
      }

      const ai = await genContent(t.title, t.category, t.tags);
      const body = toPT(ai, inlines);
      const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);
      const words = body.filter(b => b._type === "block").reduce((a, b) => a + (b.children?.map(c => c.text).join(" ") || "").split(/\s+/).filter(Boolean).length, 0);

      const doc = {
        _type: "blog", title: t.title, slug: { current: slug },
        author: "TamilCinemaHub Editorial",
        publishedAt: new Date().toISOString(), category: t.category,
        excerpt: ai.excerpt || t.title, body,
        seoTitle: (ai.seoTitle || t.title).slice(0, 60),
        seoDescription: (ai.seoDescription || "").slice(0, 155),
        tags: t.tags, readTime: ai.readTime || Math.max(5, Math.ceil(words / 250)),
        featured: false,
      };
      if (thumb) doc.mainImage = { _type: "image", asset: { _type: "reference", _ref: thumb } };

      await s.create(doc);
      ok++;
      console.log(`  OK — ${words} words, ${ai.sections?.length || 0} sections, ${1 + inlines.length} images\n`);
      await new Promise(r => setTimeout(r, 15000));
    } catch (err) {
      console.error(`  FAIL: ${t.title} — ${err.message}\n`);
    }
  }
  console.log(`Done! ${ok}/2 created`);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
