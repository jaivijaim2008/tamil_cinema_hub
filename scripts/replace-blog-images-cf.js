#!/usr/bin/env node
/**
 * Replace existing blog thumbnails + add inline images
 * using Cloudflare Worker AI (Stable Diffusion XL)
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

// Image prompts matched to blog title keywords (case-insensitive contains)
const IMAGE_PROMPTS = [
  { match: "jailer 2", thumb: "Tamil cinema action hero Rajinikanth style with dark sunglasses and black suit, dramatic cinematic lighting, movie poster style, vibrant colors, Indian cinema, 4k realistic", inline: ["Tamil cinema director on film set with camera equipment, behind the scenes, cinematic golden hour lighting", "Ayudha Pooja festival celebration in Tamil Nadu with decorated vehicles and cinema banners, vibrant cultural scene"] },
  { match: "jana nayagan", thumb: "Vijay Tamil cinema hero in political drama scene, intense expression, Indian flag colors background, cinematic portrait, dramatic lighting, 4k realistic", inline: ["Indian film censorship board office with movie reels and certificates on wall, formal professional setting", "Tamil Nadu cinema fans celebrating outside theater with fireworks and cutouts, night scene, vibrant"] },
  { match: "ladies", thumb: "Stylish Tamil action movie scene with female leads in combat pose, neon lights, rain-soaked street, cinematic action photography, vibrant colors, 4k realistic", inline: ["Tamil cinema action sequence filming with stunts and wire work, behind the scenes, professional crew", "Romantic song sequence in Tamil movie with colorful costumes and dance, festive atmosphere, cinematic"] },
  { match: "tj gnanavel", thumb: "Suriya Tamil actor in intense dramatic pose, artistic warm lighting, Indian cinema style, cinematic portrait, warm tones, 4k realistic", inline: ["Film production studio with director reviewing footage on monitor, creative process, professional setting", "Hombale Films production logo and film reel montage, cinema industry aesthetic, dramatic"] },
  { match: "suriya 46", thumb: "Tamil cinema hero celebration scene with confetti and film crew, wrap party atmosphere, joyful vibrant cinematic style, 4k realistic", inline: ["Movie filming location in Chennai with camera crane and crew working, behind the scenes, golden hour", "Suriya fan art collage with different movie roles, artistic illustration style, colorful vibrant"] },
  { match: "dc release", thumb: "Tamil cinema director looking through camera viewfinder on set, intense focus, professional film equipment, cinematic lighting, 4k realistic", inline: ["Tamil cinema action movie still with dramatic car chase scene, night city, neon lights, cinematic", "Film premiere red carpet event in Chennai with photographers and celebrities, glamorous atmosphere"] },
  { match: "mandaadi", thumb: "Tamil sports drama movie scene with athlete in training, determination, sweat and effort, cinematic sports photography, dramatic lighting, 4k realistic", inline: ["Tamil cinema boxing ring scene with intense match, crowd cheering, dramatic spotlight, cinematic", "Film crew shooting action sequence in stadium, behind the scenes, professional equipment, dramatic"] },
  { match: "blast", thumb: "Box office collection board showing blockbuster numbers, cinema theater exterior with packed crowd, celebration atmosphere, vibrant, 4k realistic", inline: ["Indian cinema box office collection chart with rising graph, financial success concept, professional", "Tamil cinema theater packed audience watching movie, emotional reactions, dramatic lighting, cinematic"] },
  { match: "july 2026", thumb: "Cinema calendar concept with movie posters overlapping, July 2026 highlighted, film industry aesthetic, vibrant collage style, 4k realistic", inline: ["Tamil cinema audience queuing outside theater for movie premiere, excitement, vibrant atmosphere", "Movie director chair with script and clapperboard, filmmaking concept, artistic still life, cinematic"] },
  { match: "kollywood this week", thumb: "Tamil cinema industry montage with film reels, director chair, camera equipment, professional filmmaking concept art, cinematic, 4k realistic", inline: ["Film awards trophy and celebration, Indian cinema achievement concept, golden trophy on red velvet", "Tamil cinema social media buzz concept with trending hashtags, digital art style, vibrant"] },
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
