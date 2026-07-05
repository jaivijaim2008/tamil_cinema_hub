/**
 * Cleanup Old Images Script
 * 
 * Old Pollinations.ai images: 1024x1024 (square format)
 * New FLUX images: 1000x562 (widescreen format)
 * 
 * Removes all old 1024x1024 images from body, keeps new 1000x562 ones
 * Also replaces thumbnails (mainImage) with new FLUX images
 */

const fs = require("fs");
const path = require("path");

// Manual .env.local parsing
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

// Cloudflare Worker AI config
const CF_WORKER_URL = "https://tamilcinema-imagegen.jaitnea.workers.dev/";
const CF_API_KEY = "tamilcinema2026secrets";

// Thumbnail prompts for each blog topic
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

// Inline prompts for each blog topic (2 per blog)
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
      return {
        thumb: THUMB_PROMPTS[key],
        inline: INLINE_PROMPTS[key] || [],
      };
    }
  }
  return null;
}

async function generateImage(prompt) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(CF_WORKER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(120000),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 10000) throw new Error(`Image too small: ${buf.length} bytes`);
      return buf;
    } catch (e) {
      console.log(`    Attempt ${attempt}/3 failed: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 5000 * attempt));
    }
  }
  return null;
}

async function uploadImage(buffer, filename) {
  const asset = await sanity.assets.upload("image", buffer, {
    filename,
    contentType: "image/jpeg",
  });
  return asset._id;
}

// Phase 1: Audit
async function audit() {
  const blogs = await sanity.fetch(
    '*[_type == "blog"] | order(publishedAt desc) { _id, title, slug, mainImage, body }'
  );

  console.log(`=== Auditing ${blogs.length} blogs ===\n`);

  for (const blog of blogs) {
    const thumbRef = blog.mainImage?.asset?._ref || blog.mainImage?._ref || "NONE";
    const isThumbOld = thumbRef.includes("1024x1024");

    const bodyImages = (blog.body || []).filter(b => b._type === "image");
    const oldCount = bodyImages.filter(img => {
      const ref = img.asset?._ref || "";
      return ref.includes("1024x1024");
    }).length;
    const newCount = bodyImages.filter(img => {
      const ref = img.asset?._ref || "";
      return ref.includes("1000x562");
    }).length;

    console.log(`--- ${blog.title} ---`);
    console.log(`  thumbnail: ${isThumbOld ? "🔴 OLD" : "🟢 NEW"} (${thumbRef.substring(0, 40)}...)`);
    console.log(`  body images: ${bodyImages.length} total (${oldCount} old, ${newCount} new)\n`);
  }
}

// Phase 2: Cleanup - remove old images, replace thumbnails with FLUX
async function cleanup() {
  const blogs = await sanity.fetch(
    '*[_type == "blog"] | order(publishedAt desc) { _id, title, slug, mainImage, body }'
  );

  console.log(`=== Cleaning up ${blogs.length} blogs ===\n`);

  let totalRemoved = 0;
  let blogsUpdated = 0;
  let thumbsReplaced = 0;

  for (const blog of blogs) {
    const prompts = findPrompts(blog.title);
    if (!prompts) {
      console.log(`⚠️  No prompts for: ${blog.title}`);
      continue;
    }

    // Step 1: Remove old inline images from body
    if (blog.body && Array.isArray(blog.body)) {
      const bodyImages = blog.body.filter(b => b._type === "image");
      const oldImages = bodyImages.filter(img => {
        const ref = img.asset?._ref || "";
        return ref.includes("1024x1024");
      });

      if (oldImages.length > 0) {
        console.log(`🔧 ${blog.title}: removing ${oldImages.length} old inline images`);

        // Remove blocks with old images (by _key matching)
        const oldKeys = new Set(oldImages.map(img => img._key).filter(Boolean));
        let newBody;

        if (oldKeys.size > 0) {
          newBody = blog.body.filter(b => {
            if (b._type === "image" && oldKeys.has(b._key)) return false;
            return true;
          });
        } else {
          // Fallback: remove by 1024x1024 ref pattern
          newBody = blog.body.filter(b => {
            if (b._type === "image") {
              const ref = b.asset?._ref || "";
              if (ref.includes("1024x1024")) return false;
            }
            return true;
          });
        }

        await sanity.patch(blog._id).set({ body: newBody }).commit();
        totalRemoved += oldImages.length;
        console.log(`   ✅ Removed ${oldImages.length} old images\n`);
      } else {
        console.log(`✅ ${blog.title}: no old inline images to remove`);
      }
    }

    // Step 2: Replace thumbnail if it's old
    const thumbRef = blog.mainImage?.asset?._ref || blog.mainImage?._ref || "";
    if (thumbRef.includes("1024x1024")) {
      console.log(`🖼️  ${blog.title}: replacing old thumbnail with FLUX`);
      
      const thumbBuf = await generateImage(prompts.thumb);
      if (thumbBuf) {
        const thumbAsset = await uploadImage(thumbBuf, `${blog.slug?.current || "blog"}-thumb-flux.jpg`);
        await sanity.patch(blog._id).set({
          mainImage: { _type: "image", asset: { _type: "reference", _ref: thumbAsset } }
        }).commit();
        thumbsReplaced++;
        console.log(`   ✅ Thumbnail replaced (${(thumbBuf.length / 1024).toFixed(0)}KB)\n`);
      } else {
        console.log(`   ❌ Failed to generate replacement thumbnail\n`);
      }

      // Small delay between image generations
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Old inline images removed: ${totalRemoved}`);
  console.log(`Old thumbnails replaced: ${thumbsReplaced}`);
}

const mode = process.argv[2] || "audit";

if (mode === "audit") {
  audit().catch(e => { console.error(e); process.exit(1); });
} else if (mode === "cleanup") {
  cleanup().catch(e => { console.error(e); process.exit(1); });
} else {
  console.log("Usage: node cleanup-old-images.js [audit|cleanup]");
}
