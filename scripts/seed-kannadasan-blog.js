#!/usr/bin/env node
/**
 * Kannadasan Blog Seeder - TamilCinemaHub
 *
 * Uploads local images and creates a "Feature" category blog post about Kannadasan.
 *
 * Usage:
 *   SANITY_AUTH_TOKEN=your_token node scripts/seed-kannadasan-blog.js
 */

const { createClient } = require("@sanity/client");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Sanity Client
const TOKEN = process.argv[2] || process.env.SANITY_AUTH_TOKEN;
if (!TOKEN) {
  console.error("Missing token!");
  console.error("Run: node scripts/seed-kannadasan-blog.js YOUR_TOKEN_HERE");
  process.exit(1);
}

const client = createClient({
  projectId: "od67iigb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: TOKEN,
  useCdn: false,
});

// Image folder path (user's desktop folder)
const IMAGE_FOLDER = "C:\\Users\\JAI VIJAI M\\Desktop\\documents\\New folder";

// Image mapping: filename → { alt, caption }
const IMAGE_MAP = {
  "MAIN_Image.jpg": { alt: "Kannadasan Tamil poet black and white portrait", caption: null },
  "image1.jpg": { alt: "Sirkazhi Tamil Nadu old vintage town", caption: "Sirkazhi — the small town that gave Tamil cinema its greatest poet" },
  "image2.png": { alt: "Kannadasan writing Tamil poet", caption: "Kannadasan — a man who turned personal pain into universal poetry" },
  "image3.png": { alt: "Kannadasan Tamil lyrics quote", caption: "Simple words. Infinite meaning. That was always the Kannadasan way." },
  "image4.avif": { alt: "MSV and Kannadasan Tamil music duo", caption: "MSV and Kannadasan — the most magical creative partnership in Tamil cinema history" },
  "image5.png": { alt: "Young Tamil person listening to music emotionally", caption: "Decades later, a new generation discovers that Kannadasan wrote about their feelings too" },
  "image6.png": { alt: "Kannadasan memorial statue Tamil Nadu", caption: "A statue can be built. But Kannadasan's real monument is the 5,000 songs he left behind." },
};

// Helpers
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

function imgBlock(assetRef, alt, caption) {
  const block = {
    _type: "image",
    _key: key(),
    asset: { _type: "reference", _ref: assetRef },
    alt: alt || "",
  };
  if (caption) block.caption = caption;
  return block;
}

// Image Upload
async function uploadLocalImage(filename) {
  const filePath = path.join(IMAGE_FOLDER, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`  File not found: ${filePath}`);
    return null;
  }
  console.log(`  Uploading: ${filename}`);
  const buf = fs.readFileSync(filePath);
  // Determine content type from extension
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".avif": "image/avif",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  const contentType = contentTypes[ext] || "image/jpeg";
  const asset = await client.assets.upload("image", buf, {
    filename: filename,
    contentType: contentType,
  });
  console.log(`  Uploaded: ${asset._id}`);
  return asset._id;
}

// Build the blog body with images inserted at correct positions
function buildBody(imageIds) {
  const blocks = [];

  // Title
  blocks.push(
    h2("Kannadasan: Yean Avar Lyrics Indha Varai Namba Manasula Vazhkiran?")
  );

  // Intro paragraph
  blocks.push(
    p(
      `After writing more than 5,000 songs across five decades, Kannadasan left this world in 1981. But walk into any home in Tamil Nadu today — play one of his songs at a funeral, a wedding, or a quiet lonely night — and you will see the same thing every time. Eyes filling with tears. Lips mouthing the words. Hearts cracking open.`
    )
  );
  blocks.push(
    p(
      `No director. No hero costume. No box office record. Just words. And yet, no name in Tamil cinema history carries the kind of emotional weight that Kannadasan does.`
    )
  );
  blocks.push(p(`This is the story of why.`));

  // Section 1: A Poet Was Born in Pain
  blocks.push(h2("ஒரு கவிஞன் பிறந்தான் — A Poet Was Born in Pain"));

  // IMAGE 1: Sirkazhi town
  if (imageIds.image1) {
    blocks.push(imgBlock(imageIds.image1, IMAGE_MAP["image1.jpg"].alt, IMAGE_MAP["image1.jpg"].caption));
  }

  blocks.push(
    p(
      `Kannadasan was born Muthaiah on June 24, 1927, in Sirkazhi, a small town in the Nagapattinam district of Tamil Nadu. His childhood was not comfortable. Poverty, family hardship, and a restless searching spirit defined his early years.`
    )
  );
  blocks.push(
    p(
      `He ran away from home as a teenager. He drifted between towns. He wrote poetry on scraps of paper, on walls, on anything he could find. He joined the Dravidian movement, fell in and out of political favour, converted to different faiths, and then returned to Hinduism with a philosopher's hunger for truth.`
    )
  );
  blocks.push(p(`He didn't just experience life. He crash-tested it.`));
  blocks.push(
    p(
      `And every single crack, every heartbreak, every humiliation — he poured all of it into his writing.`
    )
  );
  blocks.push(
    p(
      `This is the first secret of why Kannadasan hits different. He didn't imagine his emotions. He lived them, survived them, and then put them into words so precise that millions of strangers felt he had written about their own lives.`
    )
  );

  // Section 2: 5000 Songs
  blocks.push(h2("5000 பாடல்கள் — But Every One Felt Personal"));

  // IMAGE 2: Kannadasan writing
  if (imageIds.image2) {
    blocks.push(imgBlock(imageIds.image2, IMAGE_MAP["image2.png"].alt, IMAGE_MAP["image2.png"].caption));
  }

  blocks.push(
    p(
      `Most people, when they hear "5,000 songs," think quantity. But what is staggering about Kannadasan is not the number — it is the consistency of emotional truth across that number.`
    )
  );
  blocks.push(
    p(
      `He wrote for MGR. He wrote for Sivaji Ganesan. He wrote for Rajinikanth in his early career. He wrote across genres — devotional, romantic, philosophical, comedic, patriotic. He wrote for A-list films and B-grade productions. He wrote when he was celebrated and when he was broke.`
    )
  );
  blocks.push(
    p(
      `And across all of it, a single thread remained: every lyric felt like a confession.`
    )
  );
  blocks.push(
    p(
      `Consider what he packed into just a few lines of Nenjil Oru Aalayam:`
    )
  );
  blocks.push(
    quote(
      `"The heart has built a temple. You are its deity. But the deity has left — and the temple now stands empty."`
    )
  );
  blocks.push(
    p(
      `That is not a film lyric. That is a complete human tragedy compressed into two sentences. That is what Kannadasan did — again and again — across 5,000 songs.`
    )
  );

  // Section 3: Never Just About Love
  blocks.push(h2("காதல் மட்டும் இல்லை — It Was Never Just About Love"));
  blocks.push(
    p(`Kannadasan wrote across the full spectrum of human experience:`)
  );
  blocks.push(
    bulletItem(
      `On love: Tender, aching, beautiful — Ninaithale Inikkum captures the sweetness of longing that no other lyricist has matched`
    )
  );
  blocks.push(
    bulletItem(
      `On heartbreak: Raw and devastating — Andhi Mazhai Pozhigiradhu is one of the most emotionally precise breakup songs ever written in any language`
    )
  );
  blocks.push(
    bulletItem(
      `On death: Deeply philosophical — his awareness of mortality runs through hundreds of songs like a quiet current`
    )
  );
  blocks.push(
    bulletItem(
      `On God and faith: Having converted, reconverted, and wrestled with faith his entire life, his devotional writing comes from a genuinely searching place`
    )
  );
  blocks.push(
    bulletItem(
      `On poverty: The struggles of ordinary people surface again and again in his work`
    )
  );
  blocks.push(
    bulletItem(
      `On life itself: Songs like Engirundho AzhaikkiRadhu carry the weight of genuine philosophical inquiry`
    )
  );
  blocks.push(
    p(
      `This range is what separates him from every other Tamil lyricist. He wasn't a specialist. He was a complete human being writing about the complete human experience.`
    )
  );

  // Section 4: Simple Words, Infinite Depth
  blocks.push(
    h2(
      "எளிய வார்த்தைகள், ஆழமான அர்த்தம் — Simple Words, Infinite Depth"
    )
  );

  // IMAGE 3: Lyrics quote graphic
  if (imageIds.image3) {
    blocks.push(imgBlock(imageIds.image3, IMAGE_MAP["image3.png"].alt, IMAGE_MAP["image3.png"].caption));
  }

  blocks.push(
    p(
      `Here is something remarkable: Kannadasan almost never used difficult Tamil. He didn't reach for obscure classical words to show off his learning. He wrote in the Tamil that a bus conductor speaks, that a vegetable seller uses, that a teenager whispers to a friend.`
    )
  );
  blocks.push(
    p(
      `And yet, within those simple words, he managed to carry the philosophical weight of the Upanishads.`
    )
  );
  blocks.push(
    p(
      `This is extraordinarily difficult to do. Any poet can write complex thoughts in complex language. The real skill — the skill that marks a true master — is expressing profound ideas in words so simple that a ten-year-old and a seventy-year-old can both understand the surface, while only the seventy-year-old understands everything underneath it.`
    )
  );
  blocks.push(
    p(`Kannadasan did this consistently across five decades.`)
  );
  blocks.push(
    p(
      `The line "Vazhkai oru yathirai" — Life is a journey — seems almost too simple. But the context, the melody, the way it lands in the song transforms those four words into something that makes you sit still and think about your entire existence.`
    )
  );
  blocks.push(p(`That is the Kannadasan method.`));

  // Section 5: The Philosopher in the Poet
  blocks.push(h2("தர்சனம் — The Philosopher in the Poet"));
  blocks.push(
    p(
      `Unlike most lyricists who approach a song as a craft assignment — write something that fits this tune, this scene, this hero — Kannadasan approached every song as an opportunity to say something true about being human.`
    )
  );
  blocks.push(
    p(
      `He had read deeply. The Thirukkural, the Upanishads, the works of Subramania Bharati, Western philosophy — all of it fed into his writing. But he wore this learning lightly. He never lectured. He never preached.`
    )
  );
  blocks.push(
    p(
      `Instead, he found ways to smuggle philosophical depth into what looked, on the surface, like entertainment.`
    )
  );
  blocks.push(
    p(
      `A song written for a 1960s MGR film might contain, buried inside its romantic imagery, a meditation on the impermanence of happiness that a Buddhist monk would recognize immediately.`
    )
  );
  blocks.push(
    p(
      `This is why Kannadasan's songs have such unusual longevity. Trends in Tamil film music change constantly. But his songs sound fresh in every decade because they are about things that do not change.`
    )
  );

  // Section 6: MSV Partnership
  blocks.push(h2("MSV உடன் ஒரு இணை — The Partnership That Defined an Era"));

  // IMAGE 4: MSV and Kannadasan
  if (imageIds.image4) {
    blocks.push(imgBlock(imageIds.image4, IMAGE_MAP["image4.avif"].alt, IMAGE_MAP["image4.avif"].caption));
  }

  blocks.push(
    p(
      `No account of Kannadasan is complete without acknowledging his extraordinary creative partnership with composer M.S. Viswanathan (MSV).`
    )
  );
  blocks.push(
    p(
      `Together, they created some of the most beloved songs in Tamil cinema history. MSV's melodic gift and Kannadasan's lyrical depth complemented each other perfectly. MSV could construct a tune that perfectly expressed longing or joy or sorrow — and Kannadasan could find words that didn't just fit the tune, but seemed to have always existed inside it.`
    )
  );
  blocks.push(
    p(
      `Songs like Malarndhum Malaratha, Adi Athaadi, and dozens of others are inseparable from both their names. Neither would have created the same magic without the other.`
    )
  );

  // Section 7: Why Do We Still Cry?
  blocks.push(h2("இன்றும் ஏன் அழுகிறோம்? — Why Do We Still Cry?"));

  // IMAGE 5: Young Tamil person listening to music
  if (imageIds.image5) {
    blocks.push(imgBlock(imageIds.image5, IMAGE_MAP["image5.png"].alt, IMAGE_MAP["image5.png"].caption));
  }

  blocks.push(
    p(
      `Here is the real question: Kannadasan died in 1981. Tamil Nadu has changed beyond recognition since then. The films he wrote for look dated. The technology, the fashion, the politics — all completely different.`
    )
  );
  blocks.push(
    p(
      `And yet. Play Naan Paadum Mouna Raagam right now. Anywhere. To anyone who grew up with Tamil music.`
    )
  );
  blocks.push(p(`Watch their face.`));
  blocks.push(
    p(
      `Why does a lyric written 50 years ago for a black-and-white film still do that?`
    )
  );
  blocks.push(p(`The answer is this: Human emotions have not changed.`));
  blocks.push(
    p(
      `Longing is still longing. Loss is still loss. The particular ache of loving someone who is gone — whether through death or distance or simply the passage of time — that is the same in 1965 and 2026. The shape of heartbreak does not change with technology.`
    )
  );
  blocks.push(
    p(
      `Kannadasan wrote about those unchanging things with such precision and such honesty that his words did not age. They cannot age. They are too close to the truth of what it means to be human.`
    )
  );

  // Section 8: Gen Z Discovering Kannadasan
  blocks.push(
    h2("புதிய தலைமுறை — Why Gen Z is Discovering Kannadasan")
  );
  blocks.push(
    p(
      `Something interesting has been happening on social media in recent years. A new generation of Tamil young people — who grew up with AR Rahman, Yuvan, Harris Jayaraj — have started discovering Kannadasan.`
    )
  );
  blocks.push(
    p(
      `Not through school assignments or parental pressure. Through reels. Through YouTube rabbit holes. Through someone sharing a lyric in a comment that perfectly described what they were feeling at 2am.`
    )
  );
  blocks.push(
    p(
      `"Idhu eppadi ithana years munna ezhuthanga — ithu exactly namma feeling"`
    )
  );
  blocks.push(
    p(
      `That reaction — that shock of recognition across decades — is the ultimate proof of Kannadasan's greatness. He wasn't writing for his era. He was writing for all eras.`
    )
  );

  // Section 9: The Final Word
  blocks.push(h2("கடைசி வார்த்தைகள் — The Final Word"));

  // IMAGE 6: Kannadasan memorial statue
  if (imageIds.image6) {
    blocks.push(imgBlock(imageIds.image6, IMAGE_MAP["image6.png"].alt, IMAGE_MAP["image6.png"].caption));
  }

  blocks.push(
    p(
      `Kannadasan spent the last years of his life battling illness, financial difficulty, and the complicated loneliness of a man who had given everything to his art. He died on October 17, 1981, in Chennai.`
    )
  );
  blocks.push(
    p(
      `He left behind no great fortune. No dynasty. No institution bearing his name.`
    )
  );
  blocks.push(p(`He left behind 5,000 songs.`));
  blocks.push(
    p(
      `And in those songs, he left behind something more valuable than any of those things: a complete map of the Tamil human heart. Every joy, every grief, every confusion, every moment of grace and every moment of despair — it is all there, in simple words, set to beautiful melodies, waiting for whoever needs it.`
    )
  );
  blocks.push(
    p(
      `Tamil cinema has produced remarkable directors, unforgettable heroes, legendary composers. But for the single person sitting alone at night, reaching for something that understands them — they don't reach for a director. They don't reach for a hero.`
    )
  );
  blocks.push(p(`They reach for Kannadasan.`));
  blocks.push(p(`And he is always there.`));

  return blocks;
}

// Main Execution
async function main() {
  console.log("TamilCinemaHub - Kannadasan Blog Seeder (with images)");
  console.log("=".repeat(55));
  console.log();

  // Step 1: Upload all local images
  console.log("Step 1: Uploading images...");
  const imageIds = {};

  for (const [filename, meta] of Object.entries(IMAGE_MAP)) {
    const key = filename.replace(/\.[^.]+$/, ""); // remove extension for key
    try {
      imageIds[key] = await uploadLocalImage(filename);
    } catch (err) {
      console.error(`  Failed to upload ${filename}: ${err.message}`);
      imageIds[key] = null;
    }
  }

  const uploadedCount = Object.values(imageIds).filter(Boolean).length;
  console.log(`\nUploaded ${uploadedCount}/${Object.keys(IMAGE_MAP).length} images\n`);

  // Step 2: Check if post already exists
  console.log("Step 2: Checking for existing post...");
  const slug = "kannadasan-tamil-cinema-greatest-lyricist-legacy";
  const existing = await client.fetch(
    '*[_type == "blog" && slug.current == $slug][0]._id',
    { slug }
  );

  // Step 3: Build body with images
  console.log("Step 3: Building blog body with images...");
  const body = buildBody(imageIds);

  // Step 4: Create or update the blog post
  const doc = {
    _type: "blog",
    title: "Kannadasan: Yean Avar Lyrics Indha Varai Namba Manasula Vazhkiran?",
    slug: { current: slug },
    author: "Jai Vijai M",
    publishedAt: "2026-06-09T10:00:00Z",
    category: "Feature",
    excerpt:
      "He wrote over 5,000 songs. He never directed a film. He never played a hero. Yet Kannadasan remains the soul of Tamil cinema — a poet whose words on love, loss, and life still make us cry decades after his death. Here is why.",
    body: body,
    seoTitle:
      "Kannadasan: The Greatest Tamil Lyricist Who Still Makes Us Cry | TamilCinemaHub",
    seoDescription:
      "Discover why Kannadasan's Tamil song lyrics on love, heartbreak, and philosophy still move millions today. A deep tribute to Tamil cinema's greatest poet and lyricist.",
    tags: [
      "Kannadasan",
      "Tamil Lyrics",
      "Tamil Cinema History",
      "Tamil Poets",
      "Classic Tamil Songs",
      "Kollywood Legends",
      "Tamil Music",
      "Lyricist",
    ],
    likes: 0,
    dislikes: 0,
  };

  // Attach hero/main image if uploaded
  if (imageIds["MAIN_Image"]) {
    doc.mainImage = {
      _type: "image",
      asset: { _type: "reference", _ref: imageIds["MAIN_Image"] },
    };
  }

  console.log("Step 4: Creating/updating blog post...");

  if (existing) {
    console.log("Post already exists! Updating...");
    const result = await client.patch(existing).set(doc).commit();
    console.log(`Updated: ${result._id}`);
  } else {
    const result = await client.create(doc);
    console.log(`Created: ${result._id}`);
  }

  console.log();
  console.log("=".repeat(55));
  console.log("Done!");
  console.log();
  console.log("Blog post details:");
  console.log(`  Title: ${doc.title}`);
  console.log(`  Category: ${doc.category}`);
  console.log(`  Images: ${uploadedCount} uploaded`);
  console.log(`  Hero image: ${imageIds["MAIN_Image"] ? "YES" : "NO"}`);
  console.log();
  console.log("Verify at:");
  console.log("  https://tamilcinema-website.vercel.app/blogs");
  console.log(`  https://tamilcinema-website.vercel.app/blogs/${slug}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
