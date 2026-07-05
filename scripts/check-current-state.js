/**
 * Quick check - what are the actual image refs right now?
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
const s = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

s.fetch('*[_type == "blog"] | order(publishedAt desc) { _id, title, slug, mainImage, body }').then(blogs => {
  blogs.forEach((blog, i) => {
    console.log(`\n=== ${(i+1)}. ${blog.title} ===`);
    
    // Check thumbnail
    const thumbRef = blog.mainImage?.asset?._ref || blog.mainImage?._ref || "NONE";
    const isOld = thumbRef.includes("1024x1024");
    console.log(`  THUMBNAIL: ${isOld ? "OLD" : "NEW"} ref=${thumbRef.substring(0, 60)}`);
    
    // Check body
    const bodyImages = (blog.body || []).filter(b => b._type === "image");
    console.log(`  BODY IMAGES: ${bodyImages.length}`);
    bodyImages.forEach((img, idx) => {
      const ref = img.asset?._ref || "no-ref";
      const isOldImg = ref.includes("1024x1024");
      console.log(`    [${idx}] ${isOldImg ? "OLD" : "NEW"} ref=${ref.substring(0, 60)}`);
    });
  });
}).catch(e => { console.error(e); process.exit(1); });
