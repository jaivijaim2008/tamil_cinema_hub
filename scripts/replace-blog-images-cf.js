#!/usr/bin/env node
/**
 * Replace existing blog thumbnails + add inline images
 * using Cloudflare Worker AI (FLUX.1-schnell)
 */

const { createClient } = require("@sanity/client");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Load .env.local
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

const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;
if (!SANITY_TOKEN) { console.error("Missing SANITY_WRITE_TOKEN"); process.exit(1); }

const sanity = createClient({
  projectId: "od67iigb", dataset: "production", apiVersion: "2024-01-01",
  token: SANITY_TOKEN, useCdn: false,
});

const CF_WORKER_URL = "https://tamilcinema-imagegen.jaitnea.workers.dev/";
const CF_API_KEY = "tamilcinema2026secrets";
const uid = () => crypto.randomBytes(8).toString("hex");

// Thematic/Cinematic prompts - focus on movie themes, not faces (AI can't replicate real people)
const IMAGE_PROMPTS = [
  { match: "jailer 2", thumb: "Dramatic police badge and handcuffs on wooden table, moody noir lighting, prison bars in background, cinematic crime thriller atmosphere, 4k photorealistic photography", inline: ["Movie clapperboard with ACTION written, film set in background, dramatic golden hour lighting, cinematic", "Tamil cinema theater exterior at night with neon lights, packed audience silhouette, vibrant atmosphere"] },
  { match: "jana nayagan", thumb: "Political campaign rally with Indian flags waving, dramatic crowd scene, golden hour lighting, cinematic political drama atmosphere, 4k photorealistic photography", inline: ["Film censorship certificate office with movie reels stacked, vintage cinema aesthetic, warm lighting", "Tamil Nadu cinema fans celebrating outside theater with fireworks and cutouts, night scene, vibrant"] },
  { match: "ladies", thumb: "Stylish action movie scene with neon-lit rainy street, dramatic silhouette, cyberpunk atmosphere, cinematic color grading, 4k photorealistic photography", inline: ["Film crew shooting action sequence with wire work and stunts, behind the scenes, professional equipment", "Colorful dance sequence in Tamil movie with vibrant costumes, festive atmosphere, cinematic"] },
  { match: "tj gnanavel", thumb: "Film production studio with director reviewing footage on large monitor, creative process, professional setting, cinematic lighting, 4k photorealistic photography", inline: ["Movie script and storyboards spread on desk, creative writing process, artistic workspace, dramatic lighting", "Film reel montage and production logo, cinema industry aesthetic, professional filmmaking"] },
  { match: "suriya 46", thumb: "Movie filming location with camera crane and crew working, Chennai cityscape background, golden hour, behind the scenes, cinematic, 4k photorealistic photography", inline: ["Film wrap party celebration with confetti and crew, joyful atmosphere, cinematic party scene", "Action movie set with dramatic lighting and equipment, professional filmmaking, dramatic"] },
  { match: "dc release", thumb: "Professional film camera on tripod on movie set, director chair in foreground, dramatic golden hour lighting, cinematic atmosphere, 4k photorealistic photography", inline: ["Film premiere red carpet event with photographers and spotlights, glamorous atmosphere, cinematic", "Movie theater interior with packed audience watching screen, dramatic lighting, cinematic"] },
  { match: "mandaadi", thumb: "Boxing ring with dramatic spotlight, intense training scene, sweat and determination, cinematic sports photography, 4k photorealistic photography", inline: ["Athlete training montage with ropes and boxing gloves, determination, cinematic sports atmosphere", "Film crew shooting sports sequence in stadium, behind the scenes, professional equipment"] },
  { match: "blast", thumb: "Movie theater box office with blockbuster numbers displayed, packed crowd, celebration atmosphere, vibrant colors, 4k photorealistic photography", inline: ["Cinema box office collection chart with rising graph, financial success concept, professional", "Tamil cinema theater packed audience watching movie, emotional reactions, dramatic lighting"] },
  { match: "july 2026", thumb: "Movie posters collage with film industry aesthetic, premiere atmosphere, vibrant colors, cinematic concept, 4k photorealistic photography", inline: ["Tamil cinema audience queuing outside theater for movie premiere, excitement, vibrant atmosphere", "Director chair with script and clapperboard, filmmaking concept, artistic still life, cinematic"] },
  { match: "kollywood this week", thumb: "Film reels, director chair, camera equipment montage, professional filmmaking concept, cinematic aesthetic, 4k photorealistic photography", inline: ["Film awards trophy and celebration, Indian cinema achievement concept, golden trophy on red velvet", "Cinema social media buzz concept with trending hashtags, digital art style, vibrant"] },
];

function findPrompts(title) {
  const lower = title.toLowerCase();
  return IMAGE_PROMPTS.find(p => lower.includes(p.match));
}

async function generateImage(prompt, retries = 3) {
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
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`CF Worker ${res.status}: ${text.slice(0, 100)}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`      Generated ${(buf.length / 1024).toFixed(0)}KB image`);
      return buf;
    } catch (e) {
      console.error(`      Attempt ${i}/${retries} failed: ${e.message}`);
      if (i < retries) await new Promise(r => setTimeout(r, 3000));
    }
  }
  return null;
}

async function uploadImage(buffer, filename) {
  const asset = await sanity.assets.upload("image", buffer, { filename, contentType: "image/jpeg" });
  return asset._id;
}

async function main() {
  console.log("=== Cloudflare AI Image Replacer ===\n");

  // Fetch all blogs
  const blogs = await sanity.fetch(
    '*[_type == "blog"] | order(publishedAt desc) { _id, title, slug, body }'
  );
  console.log(`Found ${blogs.length} blogs to update\n`);

  let updated = 0;
  let failed = 0;

  for (const blog of blogs) {
    const prompts = findPrompts(blog.title);

    if (!prompts) {
      console.log(`No image prompts for: ${blog.title}`);
      failed++;
      continue;
    }

    console.log(`\n[${blog.title}]`);

    try {
      // 1. Generate and upload new thumbnail
      console.log(`   Generating thumbnail...`);
      const thumbBuf = await generateImage(prompts.thumb);
      let thumbRef = null;
      if (thumbBuf) {
        thumbRef = await uploadImage(thumbBuf, `thumb-${blog._id}-${Date.now()}.jpg`);
        console.log(`   Thumbnail uploaded`);
      }

      // 2. Generate inline images
      const inlineRefs = [];
      for (let j = 0; j < (prompts.inline || []).length; j++) {
        console.log(`   Generating inline image ${j + 1}...`);
        const buf = await generateImage(prompts.inline[j]);
        if (buf) {
          const ref = await uploadImage(buf, `inline-${blog._id}-${j + 1}-${Date.now()}.jpg`);
          inlineRefs.push(ref);
          console.log(`   Inline ${j + 1} uploaded`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }

      // 3. Build update patch
      const patch = {};
      if (thumbRef) {
        patch.mainImage = {
          _type: "image",
          asset: { _type: "reference", _ref: thumbRef },
          alt: blog.title,
        };
      }

      // 4. Insert inline images into body (after 2nd and 4th h2 sections)
      if (inlineRefs.length > 0 && blog.body) {
        const newBody = [...blog.body];
        let sectionCount = 0;
        let insertIdx = [];

        for (let i = 0; i < newBody.length; i++) {
          if (newBody[i]._type === "block" && newBody[i].style === "h2") {
            sectionCount++;
            if (sectionCount === 2 && inlineRefs[0]) {
              insertIdx.push({ after: i, ref: inlineRefs[0], alt: prompts.inline[0] });
            }
            if (sectionCount === 4 && inlineRefs[1]) {
              insertIdx.push({ after: i, ref: inlineRefs[1], alt: prompts.inline[1] });
            }
          }
        }

        // Insert in reverse order to maintain indices
        for (const ins of insertIdx.reverse()) {
          newBody.splice(ins.after + 1, 0, {
            _type: "image",
            _key: uid(),
            asset: { _type: "reference", _ref: ins.ref },
            alt: ins.alt || "Tamil cinema",
          });
        }

        if (insertIdx.length > 0) {
          patch.body = newBody;
          console.log(`   Added ${insertIdx.length} inline images to body`);
        }
      }

      // 5. Update the blog document
      if (Object.keys(patch).length > 0) {
        await sanity.patch(blog._id).set(patch).commit();
        console.log(`   Blog updated!`);
        updated++;
      } else {
        console.log(`   No changes to make`);
        failed++;
      }

      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`   Failed: ${e.message}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Done! ${updated} updated, ${failed} failed`);
  console.log("Verify: https://tamilcinemahub.xyz/blogs");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
