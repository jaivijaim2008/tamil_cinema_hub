/**
 * Audit blog body structure - show all blocks with types and image refs
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

s.fetch('*[_type == "blog"] | order(publishedAt desc) { _id, title, body }').then(blogs => {
  console.log(`Total blogs: ${blogs.length}\n`);
  
  for (const blog of blogs) {
    console.log(`=== ${blog.title} ===`);
    if (!blog.body || !Array.isArray(blog.body)) {
      console.log("  No body\n");
      continue;
    }
    
    blog.body.forEach((b, i) => {
      if (b._type === "image") {
        const ref = b.asset?._ref || b.image?._ref || "no-ref";
        console.log(`  [${i}] IMAGE ref=${ref}`);
      } else if (b._type === "block") {
        const txt = (b.children || []).map(c => c.text || "").join("");
        const short = txt.substring(0, 70);
        console.log(`  [${i}] ${b.style || "p"}: ${short}`);
      } else {
        console.log(`  [${i}] ${b._type}`);
      }
    });
    console.log("");
  }
}).catch(e => { console.error(e); process.exit(1); });
