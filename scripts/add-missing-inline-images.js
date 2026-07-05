/**
 * Add FLUX inline images to blogs that have 0 inline images after cleanup
 */
const fs = require("fs");
const path = require("path");
const ep = path.resolve(".env.local");
for (const l of fs.readFileSync(ep, "utf8").split("\n")) {
  const t = l.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > 0) {
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const { createClient } = require("@sanity/client");
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const CF_WORKER_URL = "https://tamilcinema-imagegen.jaitnea.workers.dev/";
const CF_API_KEY = "tamilcinema2026secrets";

const INLINE_PROMPTS = {
  "jailer 2": [
    "Film noir style prison corridor, dramatic shadows through bars, single hanging light bulb, atmospheric fog, photorealistic photography, cinematic lighting",
    "Police badge and handcuffs on wooden desk, case files scattered around, dramatic desk lamp, noir atmosphere, photorealistic photography",
  ],
  "mandaadi": [
    "Boxing gloves hanging on gym wall, dramatic side lighting, sweat and determination atmosphere, Indian sports training facility, photorealistic photography",
    "Fighter entering boxing ring through tunnel of spotlights, dramatic entrance, fog machines, sports photography, photorealistic",
  ],
};

function findPrompts(title) {
  const lower = title.toLowerCase();
  for (const key of Object.keys(INLINE_PROMPTS)) {
    if (lower.includes(key)) return INLINE_PROMPTS[key];
  }
  return null;
}

async function generateImage(prompt) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(CF_WORKER_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${CF_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 10000) throw new Error(`Image too small: ${buf.length} bytes`);
      return buf;
    } catch (e) {
      console.log(`  Attempt ${attempt}/3 failed: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 5000 * attempt));
    }
  }
  return null;
}

async function main() {
  const blogs = await sanity.fetch('*[_type == "blog"] | order(publishedAt desc) { _id, title, slug, body }');

  for (const blog of blogs) {
    const bodyImages = (blog.body || []).filter(b => b._type === "image");
    if (bodyImages.length >= 2) {
      console.log(`✅ ${blog.title}: already has ${bodyImages.length} images`);
      continue;
    }

    const prompts = findPrompts(blog.title);
    if (!prompts) {
      console.log(`⚠️  No prompts for: ${blog.title}`);
      continue;
    }

    console.log(`🔧 ${blog.title}: generating ${prompts.length} inline images...`);

    // Find h2 positions to insert after h2 #2 and h2 #4
    const h2Indices = [];
    (blog.body || []).forEach((block, idx) => {
      if (block._type === "block" && block.style === "h2") h2Indices.push(idx);
    });

    const insertAfter = [];
    if (h2Indices.length >= 2) insertAfter.push(h2Indices[1]);
    if (h2Indices.length >= 4) insertAfter.push(h2Indices[3]);
    if (insertAfter.length === 0 && h2Indices.length >= 1) insertAfter.push(h2Indices[h2Indices.length - 1]);

    const newBody = [...(blog.body || [])];
    let inserted = 0;

    for (let i = insertAfter.length - 1; i >= 0 && inserted < prompts.length; i--) {
      const buf = await generateImage(prompts[inserted]);
      if (!buf) continue;

      const filename = `${blog.slug?.current || "blog"}-inline-flux-${inserted + 1}.jpg`;
      const asset = await sanity.assets.upload("image", buf, { filename, contentType: "image/jpeg" });
      
      const imageBlock = {
        _type: "image",
        _key: `flux-inline-${inserted + 1}-${Date.now()}`,
        asset: { _type: "reference", _ref: asset._id },
      };

      newBody.splice(insertAfter[i] + 1, 0, imageBlock);
      inserted++;
      console.log(`  ✅ Image ${inserted}/${prompts.length} (${(buf.length / 1024).toFixed(0)}KB)`);
      await new Promise(r => setTimeout(r, 1000));
    }

    if (inserted > 0) {
      await sanity.patch(blog._id).set({ body: newBody }).commit();
      console.log(`  ✅ Patched with ${inserted} new inline images\n`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
