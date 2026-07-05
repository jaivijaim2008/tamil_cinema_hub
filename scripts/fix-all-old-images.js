/**
 * Final fix - replace ALL old thumbnails and inline images with FLUX
 * Uses set({}) with explicit field paths to ensure patches persist
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

const THUMB_PROMPTS = {
  "jailer 2": "Professional Tamil cinema movie poster, dramatic police uniform hanging on a hook in dark locker room, golden light streaming through venetian blinds, moody noir atmosphere, cinematic color grading, shot on 35mm film, photorealistic photography",
  "blast": "Crowded Indian cinema theater at night, bright movie screen glowing in darkness, excited audience silhouettes, popcorn and drinks, neon marquee lights outside, cinematic atmosphere, photorealistic photography",
  "mandaadi": "Cinematic boxing ring under bright spotlights, red corner post with Indian flag colors, dramatic fog and lens flare, professional sports photography, photorealistic, high detail",
  "dc release": "Professional film set with ARRI camera on dolly track, director's chair with Tamil script on back, dramatic golden hour lighting, cinematic depth of field, photorealistic photography",
  "suriya 46": "Movie clapperboard and film reel on editing desk, computer monitors showing film footage, professional editing suite, warm ambient lighting, cinematic atmosphere, photorealistic photography",
  "suriya reunites": "Two director's chairs side by side on a movie set, dramatic backlighting through film set curtains, professional cinema equipment, cinematic depth of field, photorealistic photography",
  "ladies and ladies": "Glamorous Indian film premiere red carpet at night, camera flashes, velvet ropes, grand theater entrance, dramatic lighting, photorealistic photography",
  "jana nayagan": "Indian film censor board office, official certificates and movie reels on desk, dramatic desk lamp lighting, professional cinematic atmosphere, photorealistic photography",
  "top tamil movies": "Collection of Tamil film posters arranged artistically, dramatic spotlight lighting, vintage cinema aesthetic, rich colors, photorealistic photography",
  "kollywood this week": "Movie ticket stubs and film magazine spread on cafe table, dramatic natural light from window, cinematic shallow depth of field, photorealistic photography",
};

const INLINE_PROMPTS = {
  "jailer 2": [
    "Film noir style prison corridor, dramatic shadows through bars, single hanging light bulb, atmospheric fog, photorealistic photography, cinematic lighting",
    "Police badge and handcuffs on wooden desk, case files scattered around, dramatic desk lamp, noir atmosphere, photorealistic photography",
  ],
  "blast": [
    "Indian cinema box office counter with digital price display, long queue of moviegoers, evening atmosphere, photorealistic photography",
    "Movie review scores displayed on large cinema screen, dramatic red curtain framing, empty theater seats in foreground, photorealistic photography",
  ],
  "mandaadi": [
    "Boxing gloves hanging on gym wall, dramatic side lighting, sweat and determination atmosphere, Indian sports training facility, photorealistic photography",
    "Fighter entering boxing ring through tunnel of spotlights, dramatic entrance, fog machines, sports photography, photorealistic",
  ],
  "dc release": [
    "Director reviewing footage on monitor in dark editing room, multiple screens showing film clips, dramatic screen glow on face, photorealistic photography",
    "Action movie car chase scene miniature model on workbench, detailed craftsmanship, studio lighting, photorealistic photography",
  ],
  "suriya 46": [
    "Film production schedule and call sheet on clipboard, coffee cup, pen, dramatic morning light through window, photorealistic photography",
    "Movie set with dramatic lighting setup, camera crane silhouetted against twilight sky, professional film production, photorealistic photography",
  ],
  "suriya reunites": [
    "Two coffee cups on cafe table with film script between them, warm afternoon light, dramatic shadows, cinematic depth of field, photorealistic photography",
    "Movie set collaboration scene, two chairs facing monitors, creative workspace, warm ambient lighting, photorealistic photography",
  ],
  "ladies and ladies": [
    "Vintage cinema projector casting light beam through dust particles, dramatic atmosphere, classic movie theater, photorealistic photography",
    "Indian film award trophy on velvet display stand, dramatic spotlight, golden reflection, photorealistic photography",
  ],
  "jana nayagan": [
    "Film reel canisters stacked in archive room, dramatic shaft light, vintage cinema atmosphere, photorealistic photography",
    "Movie review screening room with empty seats facing blank screen, dramatic blue lighting, anticipation atmosphere, photorealistic photography",
  ],
  "top tamil movies": [
    "Movie theater marquee at golden hour showing Tamil film titles, retro signage, warm dramatic lighting, photorealistic photography",
    "Director's viewfinder with movie scene visible through lens, dramatic bokeh background, cinematic photography",
  ],
  "kollywood this week": [
    "Film industry magazine spread on coffee table, morning light, dramatic shallow depth of field, photorealistic photography",
    "Cinema ticket booth with neon glow at dusk, urban setting, dramatic evening atmosphere, photorealistic photography",
  ],
};

function findPrompts(title) {
  const lower = title.toLowerCase();
  for (const key of Object.keys(THUMB_PROMPTS)) {
    if (lower.includes(key)) {
      return { thumb: THUMB_PROMPTS[key], inline: INLINE_PROMPTS[key] || [] };
    }
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 10000) throw new Error(`Too small: ${buf.length}b`);
      return buf;
    } catch (e) {
      console.log(`    Attempt ${attempt}/3: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 5000 * attempt));
    }
  }
  return null;
}

async function uploadImage(buffer, filename) {
  const asset = await sanity.assets.upload("image", buffer, { filename, contentType: "image/jpeg" });
  return asset._id;
}

async function main() {
  const blogs = await sanity.fetch('*[_type == "blog"] | order(publishedAt desc) { _id, title, slug, mainImage, body }');
  console.log(`Processing ${blogs.length} blogs...\n`);

  for (const blog of blogs) {
    const prompts = findPrompts(blog.title);
    if (!prompts) { console.log(`⚠️  No prompts: ${blog.title}`); continue; }

    const thumbRef = blog.mainImage?.asset?._ref || blog.mainImage?._ref || "";
    const bodyImages = (blog.body || []).filter(b => b._type === "image");
    const hasOldInline = bodyImages.some(img => (img.asset?._ref || "").includes("1024x1024"));
    const hasOldThumb = thumbRef.includes("1024x1024");
    const needsInlineFix = bodyImages.length === 0 || hasOldInline;

    if (!hasOldThumb && !needsInlineFix) {
      console.log(`✅ ${blog.title.substring(0, 50)} — all FLUX`);
      continue;
    }

    console.log(`\n🔧 ${blog.title.substring(0, 60)}...`);

    // Fix inline images if needed
    if (needsInlineFix) {
      console.log(`  Fixing inline images...`);
      const newBody = [...(blog.body || [])];

      // Remove old inline images first
      if (hasOldInline) {
        const filtered = newBody.filter(b => {
          if (b._type === "image") {
            const ref = b.asset?._ref || "";
            if (ref.includes("1024x1024")) return false;
          }
          return true;
        });
        newBody.length = 0;
        newBody.push(...filtered);
      }

      // Find h2 positions in current body
      const h2Indices = [];
      newBody.forEach((block, idx) => {
        if (block._type === "block" && block.style === "h2") h2Indices.push(idx);
      });

      const insertPositions = [];
      if (h2Indices.length >= 2) insertPositions.push(h2Indices[1]);
      if (h2Indices.length >= 4) insertPositions.push(h2Indices[3]);
      if (insertPositions.length === 0 && h2Indices.length >= 1) insertPositions.push(h2Indices[h2Indices.length - 1]);

      let inlineCount = 0;
      for (let i = insertPositions.length - 1; i >= 0 && inlineCount < prompts.inline.length; i--) {
        const buf = await generateImage(prompts.inline[inlineCount]);
        if (buf) {
          const assetId = await uploadImage(buf, `${blog.slug?.current || "blog"}-flux-${inlineCount + 1}.jpg`);
          newBody.splice(insertPositions[i] + 1, 0, {
            _type: "image",
            _key: `flux-${Date.now()}-${inlineCount}`,
            asset: { _type: "reference", _ref: assetId },
          });
          console.log(`  ✅ Inline ${inlineCount + 1} (${(buf.length / 1024).toFixed(0)}KB)`);
          inlineCount++;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // Patch body
      await sanity.patch(blog._id).set({ body: newBody }).commit();
      console.log(`  ✅ Body patched (${newBody.filter(b => b._type === "image").length} images)`);
    }

    // Fix thumbnail if needed
    if (hasOldThumb) {
      console.log(`  Generating new thumbnail...`);
      const buf = await generateImage(prompts.thumb);
      if (buf) {
        const assetId = await uploadImage(buf, `${blog.slug?.current || "blog"}-thumb-flux.jpg`);
        // Use set with explicit path to ensure persistence
        await sanity.patch(blog._id).set({
          "mainImage": { _type: "image", asset: { _type: "reference", _ref: assetId } }
        }).commit();
        console.log(`  ✅ Thumbnail replaced (${(buf.length / 1024).toFixed(0)}KB)`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  console.log("\n=== Done ===");
}

main().catch(e => { console.error(e); process.exit(1); });
