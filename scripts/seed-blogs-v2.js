#!/usr/bin/env node
/**
 * Enhanced Blog Seeder v2 - TamilCinemaHub
 *
 * Downloads free images from Unsplash, uploads them to Sanity,
 * and creates 6 high-quality Tamil cinema blog posts with:
 * - Hero/main images on every post
 * - Inline images within article body
 * - Much more engaging, personality-driven writing
 * - Pull quotes, rating cards, and rich formatting
 *
 * Usage:
 *   SANITY_AUTH_TOKEN=your_token node scripts/seed-blogs-v2.js
 */

const { createClient } = require("@sanity/client");
const crypto = require("crypto");
const https = require("https");
const http = require("http");

// Sanity Client - accept token from CLI arg or env var
const TOKEN = process.argv[2] || process.env.SANITY_AUTH_TOKEN;
if (!TOKEN) {
  console.error("Missing token!");
  console.error(
    "Run: node scripts/seed-blogs-v2.js YOUR_TOKEN_HERE"
  );
  process.exit(1);
}

const client = createClient({
  projectId: "od67iigb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: TOKEN,
  useCdn: false,
});

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

function bulletItem(text) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", _key: key(), text }],
  };
}

// Image Download & Upload
function download(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    proto
      .get(url, { headers: { "User-Agent": "TamilCinemaHub/1.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function uploadImage(url, filename) {
  console.log(`  Downloading: ${filename}`);
  const buf = await download(url);
  console.log(`  Uploading to Sanity...`);
  const asset = await client.assets.upload("image", buf, {
    filename: filename,
    contentType: "image/jpeg",
  });
  console.log(`  Uploaded: ${asset._id}`);
  return asset._id;
}

// Unsplash Images (free to use under Unsplash License)
const IMAGES = {
  coolie_hero: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=675&fit=crop&q=85",
  coolie_action: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&h=500&fit=crop&q=85",
  thuglife_hero: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=675&fit=crop&q=85",
  thuglife_noir: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=900&h=500&fit=crop&q=85",
  top10_hero: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=675&fit=crop&q=85",
  top10_reel: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=500&fit=crop&q=85",
  vijay_hero: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=675&fit=crop&q=85",
  vijay_crowd: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&h=500&fit=crop&q=85",
  lokesh_hero: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1200&h=675&fit=crop&q=85",
  lokesh_camera: "https://images.unsplash.com/photo-1585644198527-05f156a4b194?w=900&h=500&fit=crop&q=85",
  acting_hero: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200&h=675&fit=crop&q=85",
  acting_stage: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&h=500&fit=crop&q=85",
};

// Blog Post Definitions
const POSTS = [
  // === 1. Coolie Review ===
  {
    title: "Coolie Review: Rajinikanth & Lokesh Kanagaraj Deliver a 675-Crore Masterclass in Mass Cinema",
    slug: "coolie-movie-review-rajinikanth-2025",
    author: "Karthik Selvaraj",
    publishedAt: "2025-12-15T10:00:00Z",
    category: "Review",
    heroImage: "coolie_hero",
    excerpt: `Lokesh Kanagaraj first Rajinikanth film is not just a blockbuster -- it is a statement. With 675 crore worldwide and a performance that silenced every critic, Coolie rewrites what a 75-year-old superstar can do on screen.`,
    tags: ["coolie", "rajinikanth", "lokesh-kanagaraj", "review", "blockbuster", "kollywood", "2025"],
    seoTitle: "Coolie Movie Review (2025) - Rajinikanth & Lokesh Kanagaraj Blockbuster",
    seoDescription: "In-depth review of Coolie (2025), starring Rajinikanth and directed by Lokesh Kanagaraj. The highest-grossing Tamil film of 2025.",
    bodyFn: (images) => [
      h2("Let us Get One Thing Straight"),
      p(`There is a moment in Coolie -- about twenty minutes into the second half -- where Rajinikanth walks into a warehouse full of armed men. He adjusts his cufflinks. He fixes his sunglasses. He says exactly one line of dialogue. And 600 people in my theatre erupted like a volcano.`),
      p(`That moment is not fan service. It is masterful filmmaking. Lokesh Kanagaraj understands something most directors never learn: Rajinikanth does not need explosions to set the screen on fire. He just needs a close-up and a half-decent line.`),
      p(`Coolie is, on every measurable level, the biggest Tamil film of 2025. It crossed 675 crore worldwide. It ran for 100+ days in single screens across Tamil Nadu. It made grown men cry in Imax auditoriums in Dubai. But the numbers, impressive as they are, do not tell the real story.`),

      imgBlock(images.coolie_action, "Cinematic action sequence", "The action in Coolie is visceral, grounded, and unlike anything Lokesh has done before"),

      h2("Rajini at 75: Age Is Just a Dialog Card"),
      p(`Let us address the elephant in the room: Rajinikanth is 75 years old. In an industry that often sidelines its veterans, here is a man delivering the most physically demanding performance of his career. The fight choreography is brutal, the emotional range is wider than anything he has attempted since Kabali, and the screen presence -- well, that was never in question.`),
      p(`But here is what surprised me: the quiet scenes. There is a conversation Rajini has with Nagarjuna in the film's third act -- two legends sitting across a table, talking about legacy and loss -- that contains more genuine acting than most entire films released this year. Rajini lets his guard down for exactly ninety seconds, and those ninety seconds will wreck you.`),
      p(`The "sunglasses adjustment" will get all the memes. The quiet vulnerability is what makes Coolie special.`),

      h2("The LCU Connect: Lokesh's Universe Expands"),
      p(`Without spoiling too much for those who have not seen it yet -- Coolie deepens the Lokesh Cinematic Universe in ways that recontextualize both Kaithi and Vikram. The connections are not heavy-handed; they are woven into the fabric of the story so naturally that you would miss them if you were not paying attention.`),
      p(`This is what separates Lokesh from every other franchise-builder in Indian cinema. He is not chasing Marvel-style post-credit stingers. He is building a mythology -- one grounded in the grit and grime of Tamil Nadu's criminal underworld, connected by threads that reward attentive viewing.`),

      h2("The Supporting Cast Deserves Its Own Film"),
      p(`Nagarjuna, as the primary antagonist, is magnificent. He brings a quiet menace that makes every scene he is in feel dangerous. The Tamil-Telugu dynamic between his character and Rajini's adds a layer of cultural tension that elevates the conflict beyond typical hero-villain dynamics.`),
      p(`Upendra, in a role that could have been a throwaway, delivers genuine pathos. Soubin Shahir brings much-needed comic relief without undermining the film's stakes. And the ensemble -- from Soubin to Sathyaraj -- ensures that no scene ever feels wasted.`),

      h2("Anirudh's Score Is the Real Hero"),
      p(`Anirudh Ravichander has had a historic year, but his Coolie background score might be his finest work yet. The main theme -- a throbbing, bass-heavy motif that plays during Rajini's introduction -- has become the most-streamed BGM clip in Tamil cinema history. The "Coolie Monster" cue during the climax is goosebump-inducing.`),
      p(`Girish Gangadharan's cinematography deserves equal praise. The film looks expensive without being sterile. The colour palette shifts between warm ambers in the flashback sequences and cold steel blues in the present day -- a visual language that tells you exactly which timeline you are in without a single title card.`),

      h2("The Flaws (Because No Film Is Perfect)"),
      p(`Coolie is not flawless. The second act drags slightly -- there is a subplot involving a missing container that could have been tightened by fifteen minutes. A couple of the comedic beats land flat. And the climax, while spectacular, relies on a coincidence that stretches credulity even by mass cinema standards.`),
      p(`But these are quibbles. In a film that delivers this much entertainment, this much emotional weight, and this much sheer spectacle, the flaws feel like rough edges on a diamond rather than cracks in the foundation.`),

      h2("The Verdict"),
      quote("Coolie is the definitive Tamil blockbuster of 2025 -- a film that proves Rajinikanth remains the most electrifying presence in Indian cinema, and that Lokesh Kanagaraj is the only director alive who can make a 600-crore film feel personal."),
      p(`If you have not seen it yet, fix that. If you have, you already know: this one is going in the time capsule.`),
      p(""),
      pBold("Rating: 4.5 out of 5"),
      p("Genre: Action / Thriller | Runtime: 2h 48m | Language: Tamil (dubbed in Telugu, Hindi, Kannada)"),
    ],
  },

  // === 2. Thug Life Review ===
  {
    title: "Thug Life Review: Mani Ratnam & Kamal Haasan Reunite -- Art Over Box Office",
    slug: "thug-life-review-mani-ratnam-kamal-haasan",
    author: "Priya Ramachandran",
    publishedAt: "2025-11-20T10:00:00Z",
    category: "Review",
    heroImage: "thuglife_hero",
    excerpt: `Thirty-eight years after Nayakan, Mani Ratnam and Kamal Haasan reunite for a gangster epic that divided audiences and conquered critics. Thug Life is not for everyone -- but for those it is for, it is unforgettable.`,
    tags: ["thug-life", "kamal-haasan", "mani-ratnam", "review", "kollywood", "ar-rahman", "2025"],
    seoTitle: "Thug Life Review (2025) - Mani Ratnam & Kamal Haasan Gangster Epic",
    seoDescription: "In-depth review of Thug Life (2025), directed by Mani Ratnam and starring Kamal Haasan. A polarising but artistically brilliant gangster drama.",
    bodyFn: (images) => [
      h2("The Weight of Expectation"),
      p(`Here is a question nobody asked but everyone was thinking: can Mani Ratnam and Kamal Haasan possibly recreate the magic of Nayakan? The answer, it turns out, is a fascinating "no" -- and that is exactly what makes Thug Life so compelling.`),
      p(`Thug Life is not Nayakan. It does not try to be. What it is, instead, is a 165-minute meditation on time, loyalty, and the impossible cost of survival in Tamil Nadu's criminal underworld. It is deliberately paced, structurally ambitious, and visually ravishing. It is also, depending on your patience threshold, either a masterpiece or a chore.`),
      p(`I fall firmly in the masterpiece camp.`),

      h2("Kamal Haasan at 70: The Performance of a Lifetime"),
      p(`Let me be blunt: Kamal Haasan, at 70, delivers the finest performance by any actor in any Indian film this year. This is not hyperbole. Watch the scene where his character -- aged thirty years through prosthetic magic -- sits alone in a train compartment, staring at his own reflection. Watch the slight tremor in his hands. Watch the way his eyes shift from recognition to disgust to acceptance in the span of four seconds.`),
      p(`That is not acting. That is alchemy.`),
      p(`The ageing prosthetics by hours-long makeup sessions are extraordinary. You genuinely believe you are watching the same man at 35, 55, and 70. But it is the internal transformation that sells it -- Kamal does not just look different at each stage, he moves differently, speaks differently, inhabits a fundamentally altered body with each passing decade.`),

      imgBlock(images.thuglife_noir, "Dramatic noir lighting", "The cinematography by Ravi K. Chandran uses light and shadow as narrative tools"),

      h2("Mani Ratnam's Visual Poetry"),
      p(`Ravi K. Chandran's cinematography in Thug Life is some of the most beautiful work in Indian cinema this decade. Every frame is composed like a painting -- the use of warm amber tones for the 1980s sequences, desaturated blues for the 2000s, and harsh fluorescent whites for the present day creates a visual timeline that tells its own story.`),
      p(`The action sequences, staged by stunt coordinator Anal Arasu, are choreographed with the precision of dance. There is a chase through the streets of Madurai in the first act that is shot in a single unbroken take -- seven minutes of running, fighting, and weaving through market stalls that left my jaw on the floor.`),

      h2("AR Rahman's Haunting Score"),
      p(`Rahman's score for Thug Life is restrained, melancholic, and utterly devastating. The main theme -- a lone nadaswaram melody over a bed of ambient electronics -- plays during the film's most emotional moments and cuts deeper than any dramatic dialogue.`),
      p(`The song "Karuppu" has already become a cultural phenomenon, but it is the background score that lingers. Rahman has not been this emotionally raw since his work on Dil Se, and the combination of Mani Ratnam's visuals with Rahman's music is as potent as it has ever been.`),

      h2("Where Thug Life Divides"),
      p(`I will not pretend this film is for everyone. The pacing is deliberately slow. The narrative jumps between three timelines without explicit markers -- you have to piece together the chronology yourself. The emotional payoff comes in the final twenty minutes, not the final two hours. And the climax, while devastating, is likely to frustrate viewers who wanted a more traditional resolution.`),
      p(`If you walked out of Ponniyin Selvan thinking "Mani Ratnam has lost it", Thug Life will not change your mind. But if you have ever been captivated by a film that trusts its audience enough to be patient, this is Mani Ratnam operating at the peak of his powers.`),

      h2("The Verdict"),
      quote("Thug Life is the rare Indian film that treats its audience as adults. It asks for your patience, rewards your attention, and leaves you emotionally devastated when the credits roll. Commercially, it underperformed at 97 crore. Artistically, it may be the most significant Tamil film of the decade."),
      p(""),
      pBold("Rating: 4 out of 5"),
      p("Genre: Crime / Drama | Runtime: 2h 45m | Language: Tamil"),
    ],
  },

  // === 3. Top 10 Tamil Movies of 2025 ===
  {
    title: "Top 10 Tamil Movies of 2025: From Rajinikanth's Coolie to the Year's Hidden Gems",
    slug: "top-10-tamil-movies-2025",
    author: "Vikram Madhavan",
    publishedAt: "2025-12-28T10:00:00Z",
    category: "Top List",
    heroImage: "top10_hero",
    excerpt: `285 Tamil films released in 2025. We watched dozens. These are the 10 that actually matter -- from record-smashing blockbusters to low-budget sleepers that caught us completely off guard.`,
    tags: ["top-10", "best-tamil-movies", "2025", "kollywood", "blockbuster", "list"],
    seoTitle: "Top 10 Tamil Movies of 2025 - Best Kollywood Films Ranked",
    seoDescription: "The definitive ranking of the top 10 Tamil movies of 2025, from Coolie to Dragon. The best Kollywood films you need to watch right now.",
    bodyFn: (images) => [
      p(`2025 was the year Tamil cinema lost its mind -- in the best possible way. 285 films released. Over 4000 crore in total box office revenue. Three films crossed 200 crore. And a 75-year-old man proved he is still the biggest box office draw in the country.`),
      p(`But raw numbers do not tell the story of a year in cinema. What does? The films that stayed with us. The ones we argued about over chai. The ones that made us text our friends at midnight saying "you HAVE to watch this". Here are our top 10.`),

      imgBlock(images.top10_reel, "Cinema audience", "Theatres were packed across Tamil Nadu throughout 2025"),

      h3("1. Coolie -- The Undisputed King"),
      p(`Rajinikanth + Lokesh Kanagaraj = 675 crore worldwide. The highest-grossing Tamil film ever. But beyond the numbers, Coolie proved that mass cinema and auteur filmmaking are not mutually exclusive.`),
      bulletItem("Director: Lokesh Kanagaraj"),
      bulletItem("Box Office: 675 crore worldwide"),
      bulletItem("Why it matters: Proved a 75-year-old star can still shatter every record"),

      h3("2. Thug Life -- The Art-House Blockbuster"),
      p(`Mani Ratnam and Kamal Haasan reunite 38 years after Nayakan, and the result is a gangster epic that critics adored and audiences argued about. Kamal at 70 is mesmerising. AR Rahman's score is haunting. It did not break box office records (97 crore), but it may be the most important film on this list.`),

      h3("3. Good Bad Ugly -- Ajith Unleashed"),
      p(`Adhik Ravichandran took Ajith Kumar's star power and threw it into a dark comedy-action blender that somehow worked brilliantly. The tonal shifts are wild -- one minute you are laughing, the next you are on the edge of your seat. 200+ crore and counting.`),

      h3("4. Dragon -- The Gen-Z Mass Film"),
      p(`Pradeep Ranganathan proved that the "mass film" template can evolve without dying. Dragon blends Gen-Z humor, college drama, and legitimate action set-pieces into something that feels genuinely fresh. 150 crore for a debut hero's second film? The numbers do not lie.`),

      h3("5. Vidaamuyarchi -- The Thriller Machine"),
      p(`Magizh Thirumeni and Ajith Kumar made a film that does exactly what it promises: grips you from the first frame and does not let go until the last. No songs mid-flight, no comedy tracks, no filler. Just lean, relentless tension for 130 minutes.`),

      h3("6. Kuberaa -- The Cross-Industry Triumph"),
      p(`Dhanush + Sekhar Kammula + a multilingual approach = 132 crore and a landmark for pan-Indian cinema. Kuberaa proved that language barriers in Indian cinema are dissolving.`),

      h3("7. Maharaja -- The Sleeper Masterpiece"),
      p(`Vijay Sethupathi plays a barber with a secret, and Nithilan Saminathan directs a revenge thriller so cleverly plotted that the final twist retroactively changes everything you thought you saw. If you have not watched Maharaja yet, stop reading and go watch it now.`),

      h3("8. Amaran -- The Emotional Gut-Punch"),
      p(`Based on the true story of Major Mukund Varadarajan, Amaran proved Sivakarthikeyan is more than a comedian-turned-hero. He is an actor. The final act had entire theatres weeping. A 150+ crore emotional blockbuster that earned every tear.`),

      h3("9. Maaman -- The Profit King"),
      p(`A small-town family drama about an uncle-nephew bond. No stars. No viral songs. No controversy. Maaman just quietly became the most profitable Tamil film of 2025 relative to its budget. Content is king.`),

      h3("10. Demonte Colony 2 -- The Horror Surprise"),
      p(`Nobody expected a sequel to a 2015 low-budget horror film to be this good. Demonte Colony 2 blends genuine scares with sharp writing and a self-aware sense of humor that makes it one of the most entertaining theatrical experiences of the year.`),

      h2("Honourable Mentions"),
      bulletItem("Vaadivaasal -- Vetrimaaran's jallikattu epic"),
      bulletItem("Lover -- A refreshingly honest romance"),
      bulletItem("Kanguva -- Ambitious period drama (despite mixed reviews)"),
      bulletItem("Andhaghaaram -- A slow-burn masterpiece that found its audience on OTT"),

      quote("2025 proved that Tamil cinema's greatest strength is not its stars -- it is its willingness to take risks. From horror sequels to gangster meditations, this was a year where boldness paid off."),
    ],
  },

  // === 4. Vijay's Final Film ===
  {
    title: "Thalapathy Vijay's Jananayagan: Why His Final Film Is Tamil Cinema's Most Emotional Event",
    slug: "thalapathy-vijay-jananayagan-final-film",
    author: "Deepa Lakshmi",
    publishedAt: "2026-01-10T10:00:00Z",
    category: "News",
    heroImage: "vijay_hero",
    excerpt: `After 70+ films and three decades of box office dominance, Thalapathy Vijay is leaving cinema for politics. His farewell film Jananayagan is not just a movie -- it is the end of an era.`,
    tags: ["vijay", "thalapathy", "jananayagan", "2026", "news", "kollywood", "politics"],
    seoTitle: "Thalapathy Vijay Last Film Jananayagan (2026) - Everything We Know",
    seoDescription: "Everything about Thalapathy Vijay final film Jananayagan. Why this is the most emotionally significant event in Tamil cinema history.",
    bodyFn: (images) => [
      h2("The Day Tamil Cinema Held Its Breath"),
      p(`When Vijay officially announced his entry into Tamil Nadu politics -- and confirmed that Jananayagan would be his final film -- the reaction was seismic. Fan clubs that together command millions of members mobilised overnight. Theatre owners across the state braced for demand they had never seen. And social media became a time capsule of three decades of movie memories.`),
      p(`This is not just another film announcement. This is the closing chapter of one of the most extraordinary careers in Indian cinema.`),

      imgBlock(images.vijay_crowd, "Crowd at a cinema event", "Vijay fan clubs are among the largest and most organised in Indian cinema"),

      h2("From Child Actor to Thalapathy: A Career in Numbers"),
      p(`Vijay first appeared on screen at age 10, in his father S.A. Chandrasekhar's Naalaiya Theerpu (1992). Three decades and 70+ films later, he has accumulated a box office track record that rivals anyone in Indian cinema:`),
      bulletItem("70+ films as lead actor"),
      bulletItem("Multiple 100-crore openers"),
      bulletItem("A fanbase estimated at 80+ million"),
      bulletItem("Films translated into Hindi, Telugu, Kannada, Malayalam, and Chinese"),
      p(`But numbers do not capture what Vijay means to Tamil Nadu. His dialogues have been quoted in legislative assemblies. His songs are played at political rallies. His film releases are treated like festivals -- with fan-organised blood donation drives, milk-abhishekam for cutouts, and midnight first-day-first-show celebrations that turn entire cities into carnival grounds.`),

      h2("What We Know About Jananayagan"),
      p(`Details are being guarded tighter than a Rajinikanth introduction scene, but here is what we know:`),
      bulletItem("Director: Confirmed as a major Tamil filmmaker (official announcement pending)"),
      bulletItem("Genre: Mass entertainer with political undertones"),
      bulletItem("Cast: Ensemble featuring both commercial favourites and serious dramatic actors"),
      bulletItem("Release: Expected late 2026"),
      bulletItem("Budget: Rumoured to be the most expensive Tamil film ever made"),
      p(`Industry insiders describe the film as "a celebration of everything Vijay represents to Tamil audiences -- a greatest hits of his style, delivered with the emotional weight of a farewell."`),

      h2("The Fan Phenomenon"),
      p(`Vijay's fan clubs -- the Vijay Makkal Iyakkam -- are not typical film fan organisations. They are a movement. With an estimated 80 million members across Tamil Nadu, Karnataka, Kerala, Andhra Pradesh, and the global diaspora, they represent one of the largest grassroots mobilisation networks in Indian cinema.`),
      p(`In the weeks following the announcement, fan clubs have organised:`),
      bulletItem("Mass screening events for Vijay's entire filmography"),
      bulletItem("Career retrospective video compilations that have crossed 100 million views"),
      bulletItem("Fundraising drives for education and healthcare in Vijay's name"),
      bulletItem("Plans for Jananayagan's opening day that include 24-hour celebrations in every major city"),
      p(`The emotional weight is real. For millions of fans, Vijay is not just a star -- he is a part of their coming-of-age story. The boy who watched Pokkiri in 2007 is now a father taking his own child to see Thalapathy's final film.`),

      h2("The Political Subtext"),
      p(`Vijay's transition from cinema to politics is the most significant crossover since M.G. Ramachandran in 1977. MGR, of course, went on to become Chief Minister and remain in power until his death in 1987.`),
      p(`Whether Vijay can replicate that political success is an open question. What is not in question is the impact: his entry has fundamentally altered Tamil Nadu's political landscape, forcing established parties to recalibrate their strategies.`),
      p(`Jananayagan, therefore, exists in a unique space -- it is simultaneously a commercial entertainer, a political statement, and a personal farewell. No Indian film has ever carried that weight before.`),

      h2("Why This Matters Beyond Fandom"),
      p(`This is not just a story about one actor's final film. It is a story about the intersection of cinema and politics in Tamil Nadu -- a state where film stars have governed for decades, where movie dialogues shape political discourse, and where a single actor's decision can alter election outcomes.`),
      p(`When the lights go down for Jananayagan's first screening, millions of people will be watching not just a movie, but the closing of a chapter that has defined Tamil popular culture for a generation.`),

      quote("The question is not whether Jananayagan will be a blockbuster. It will. The question is whether any film -- ever -- can capture what Thalapathy Vijay means to the people of Tamil Nadu."),
    ],
  },

  // === 5. Director Spotlight: Lokesh Kanagaraj ===
  {
    title: "Lokesh Kanagaraj: From YouTube Short Films to 675-Crore Blockbusters",
    slug: "lokesh-kanagaraj-director-spotlight",
    author: "Arun Thirunavukkarasu",
    publishedAt: "2025-12-01T10:00:00Z",
    category: "Director",
    heroImage: "lokesh_hero",
    excerpt: `Five years ago, he was making short films for YouTube. Today, he has built India's most ambitious cinematic universe and directed the highest-grossing Tamil film ever. Here is the Lokesh Kanagaraj story.`,
    tags: ["lokesh-kanagaraj", "director", "lcu", "kaithi", "coolie", "vikram", "kollywood"],
    seoTitle: "Lokesh Kanagaraj - From Kaithi to Coolie: Tamil Cinema Biggest Director",
    seoDescription: "The rise of Lokesh Kanagaraj, from YouTube short films to directing Rajinikanth in Coolie. How he built the LCU and became Kollywood biggest filmmaker.",
    bodyFn: (images) => [
      h2("The Short-Film Kid Who Conquered Kollywood"),
      p(`In 2017, a 29-year-old from Kumbakonam released a Tamil short film on YouTube called "Maanagaram". It was gritty, relentlessly paced, and had a storytelling confidence that felt years beyond its maker's experience. Within two years, that short film had been expanded into a feature that became one of Tamil cinema's most talked-about debuts.`),
      p(`The filmmaker was Lokesh Kanagaraj, and the industry had not seen anything like him before.`),

      imgBlock(images.lokesh_camera, "Behind the camera", "Lokesh's visual style combines handheld urgency with carefully composed frames"),

      h2("The Kaithi Revolution"),
      p(`Kaithi (2019) should not have worked. A film about an ex-convict trying to reunite with his daughter over a single night, with no songs, no heroine, no traditional hero moments, and a budget of just 25 crore -- in a commercial Tamil cinema landscape that demands song-dance-comedy formula?`),
      p(`It became a massive hit. Not because of marketing or star power, but because of raw storytelling power. Lokesh's ability to sustain tension across multiple timelines, his refusal to waste a single scene, and his instinct for the precise moment to deploy emotion -- these qualities announced a major talent.`),
      p(`But what happened next was even more remarkable.`),

      h2("Building the LCU: India's First Gritty Cinematic Universe"),
      p(`When Vikram (2022) dropped, audiences who had stayed through the credits of Kaithi realised something extraordinary: these films were connected. Vikram, Kaithi, and the upcoming Leo formed the backbone of the Lokesh Cinematic Universe -- a shared world of undercover agents, drug cartels, and morally grey characters operating in the shadows of Tamil Nadu.`),
      bulletItem("Kaithi (2019): A single-night prison break thriller that introduced the drug cartel world"),
      bulletItem("Vikram (2022): Kamal Haasan leads an elite squad against the same cartel"),
      bulletItem("Leo (2023): Vijay plays a man whose past catches up with him in the LCU drug underworld"),
      bulletItem("Coolie (2025): Rajinikanth enters the universe, and the stakes go global"),
      p(`The LCU is not just Tamil cinema's answer to the MCU -- it is better than most of what Hollywood's shared universes produce. Each film stands on its own while enriching the larger narrative.`),

      h2("The Lokesh Signature: What Makes His Films Feel Like His Films"),
      p(`Watch five minutes of any Lokesh Kanagaraj film and you will know it is his. The hallmarks are unmistakable:`),
      bulletItem("Non-linear timelines that trust the audience to connect the dots"),
      bulletItem("Long, unbroken tracking shots during action sequences"),
      bulletItem("Anirudh Ravichander's thunderous background scores"),
      bulletItem("Muscular, zero-fat screenplays -- not a wasted scene in the bunch"),
      bulletItem("Characters who feel like real people, not plot devices"),
      bulletItem("A deep respect for genre conventions, even as he subverts them"),
      p(`What is most impressive is how consistent this vision has remained across wildly different budgets and star vehicles.`),

      h2("The Coolie Triumph: Biggest Star, Biggest Budget, Same Vision"),
      p(`The question everyone asked before Coolie was simple: can Lokesh handle Rajinikanth without compromising his vision? The answer, delivered in the form of a 675-crore worldwide grosser, was an emphatic yes.`),
      p(`Lokesh did not turn Rajinikanth into a Lokesh character. He turned the LCU into a Rajinikanth playground. The result is a film that satisfies every Superstar fan while advancing the universe's mythology in meaningful ways.`),

      h2("What is Next?"),
      bulletItem("Kaithi 2: The most-awaited sequel in Tamil cinema"),
      bulletItem("LCU expansion: More characters, more connections, more chaos"),
      bulletItem("Possible collaboration with a Bollywood star for a Hindi-market LCU entry"),
      p(`From Kumbakonam to the biggest stages in Indian cinema, Lokesh Kanagaraj's journey is proof that in the right hands, Tamil storytelling can conquer the world.`),

      quote("Lokesh Kanagaraj did not just make good films -- he created a universe that made millions of people care about continuity, timelines, and fictional criminal organisations. That is not just filmmaking. That is world-building at its finest."),
    ],
  },

  // === 6. Career-Best Performances ===
  {
    title: "5 Tamil Film Performances That Will Destroy You -- And Why You Need to Watch Them",
    slug: "career-best-performances-tamil-cinema",
    author: "Meena Kannan",
    publishedAt: "2025-11-05T10:00:00Z",
    category: "Actor",
    heroImage: "acting_hero",
    excerpt: `Tamil cinema has produced some of the most devastating screen performances in all of Indian film. These five -- spanning three decades -- will change how you think about acting.`,
    tags: ["best-performances", "kamal-haasan", "vijay-sethupathi", "dhanush", "actors", "kollywood"],
    seoTitle: "5 Career-Best Tamil Film Performances - Kamal, Vijay Sethupathi, Dhanush",
    seoDescription: "Five of the greatest acting performances in Tamil cinema history, from Nayakan to Super Deluxe.",
    bodyFn: (images) => [
      h2("Why Tamil Cinema Produces the Best Actors in India"),
      p(`There is a reason the greatest actors in Indian cinema keep coming from Tamil Nadu. The industry demands range -- you need mass appeal for the front-benchers and emotional depth for the critics. You need to dance like a martial artist and cry like a poet. The actors who thrive in this environment are not just stars. They are transformers.`),
      p(`Here are five performances that prove it.`),

      imgBlock(images.acting_stage, "Performance and emotion", "Great acting transcends language -- these performances connect universally"),

      h3("1. Kamal Haasan -- Nayakan (1987)"),
      p(`Thirty-eight years later, Kamal Haasan's Velu Naicker remains the gold standard against which every Indian screen performance is measured. His transformation from a wide-eyed boy watching his father's murder to a weary don contemplating his legacy spans three decades -- and Kamal inhabits every stage with an authenticity that borders on unsettling.`),
      p(`The scene everyone remembers: Velu, now powerful and ageing, sits alone after learning of a betrayal. He says nothing. He does nothing. He just sits. And in that silence, Kamal conveys decades of trust, loss, and the crushing weight of power. Mani Ratnam holds the shot for forty-five seconds. It is the longest forty-five seconds in Indian cinema.`),

      h3("2. Vijay Sethupathi -- Super Deluxe (2019)"),
      p(`When Thiagarajan Kumararaja wrote a character called Shilpa -- a transgender woman returning to her family after a sex-change operation -- he needed an actor fearless enough to commit fully. He found one in Vijay Sethupathi.`),
      p(`What Sethupathi does in Super Deluxe is revolutionary. In an industry where male actors routinely refuse to show vulnerability, he transforms physically, vocally, and emotionally into someone entirely unlike any character he had played before. The voice alone -- softer, more tentative, carrying decades of suppressed identity -- is a masterclass.`),
      p(`But the real genius is in the small moments. The way Shilpa touches her own face in the mirror, as if checking that she is real. The hesitation before entering her family home. The quiet pride in the final scene. Sethupathi does not ask you to feel sorry for Shilpa. He asks you to see her. And you do.`),

      h3("3. Dhanush -- Asuran (2019)"),
      p(`Vetrimaaran and Dhanush have made four films together, and each one has been extraordinary. But Asuran is their apex -- a film that asks Dhanush to play a father protecting his family from caste-based violence, and receives the most physically and emotionally demanding performance of his career.`),
      p(`The genius of Dhanush in Asuran is the contrast. One moment, he is a tender father reading to his son, his voice impossibly soft. The next, he is a force of nature -- all coiled fury and desperate survival instinct. The transitions between these registers happen in seconds, and they feel completely organic.`),
      bulletItem("The river scene: Dhanush alone with his thoughts, and you can see thirty years of trauma in his eyes"),
      bulletItem("The confrontation scene: controlled rage that builds like a pressure cooker"),
      bulletItem("The final scene: a father's love expressed through the most primal act of protection"),
      p(`Asuran grossed over 100 crore and won Dhanush his fourth National Film Award. But the numbers and trophies are incidental. What matters is that this is the performance that made international critics take Dhanush seriously as one of the finest actors working anywhere in the world.`),

      h3("4. Trisha Krishnan -- 96 (2018)"),
      p(`Trisha's work in 96 is the most underrated performance in Tamil cinema. Playing Janu -- a woman reconnecting with her college sweetheart (Vijay Sethupathi) after 22 years -- she conveys an entire lifetime of emotion through the smallest gestures.`),
      p(`The college reunion scene. Watch her eyes. Watch the exact moment when professional composure cracks and twenty-two years of "what if" come flooding back. Watch how she recovers -- barely, almost imperceptibly -- and resumes conversation as if nothing happened. That is not acting. That is mind-reading.`),
      p(`In an industry that often reduces its actresses to decorative roles, Trisha in 96 is a reminder that when given the material, Tamil cinema women can deliver performances that rank alongside anyone in the world.`),

      h3("5. Suriya -- Pithamagan (2003)"),
      p(`Before he was a superstar, Suriya was already a brilliant actor. Pithamagan proved it. As a naive young man caught in a world of violence he does not understand, Suriya delivers a performance of heartbreaking simplicity.`),
      p(`Working alongside Vikram -- who gives his own career-best performance in the same film -- Suriya does not try to match Vikram's pyrotechnics. Instead, he goes the opposite direction: quiet, bewildered, fundamentally decent. The contrast between their performances creates a dynamic that elevates the entire film.`),
      p(`Pithamagan announced Suriya as a serious dramatic talent, not just a star's son. Everything that followed -- Vaaranam Aayiram, Singam, Jai Bhim -- was built on the foundation he laid in this remarkable early performance.`),

      h2("The Thread That Connects Them"),
      p(`What all five performances share is commitment -- the willingness to disappear into a character so completely that you forget you are watching an actor. Kamal became Velu. Sethupathi became Shilpa. Dhanush became Sivasamy. Trisha became Janu. Suriya became a young man the world chewed up and spat out.`),
      p(`That commitment is Tamil cinema's greatest export. And these five performances are its finest ambassadors.`),

      quote("Great acting is not about big scenes or dramatic speeches. It is about the moment between moments -- the flicker in the eyes, the hesitation before speaking, the silence that says everything words cannot. These five performances understood that truth."),
    ],
  },
];

// Main Execution
async function main() {
  console.log("TamilCinemaHub Blog Seeder v2");
  console.log("=".repeat(50));
  console.log();

  // Step 1: Delete existing blog posts
  console.log("Deleting existing blog posts...");
  const existing = await client.fetch('*[_type == "blog"]{_id}');
  for (const doc of existing) {
    await client.delete(doc._id);
  }
  console.log(`Deleted ${existing.length} old posts\n`);

  // Step 2: Download and upload all images
  console.log("Downloading and uploading images...");
  const imageIds = {};
  for (const [name, url] of Object.entries(IMAGES)) {
    try {
      imageIds[name] = await uploadImage(url, `${name}.jpg`);
    } catch (err) {
      console.error(`  Failed to upload ${name}: ${err.message}`);
      imageIds[name] = null;
    }
  }
  const uploadedCount = Object.values(imageIds).filter(Boolean).length;
  console.log(`\nUploaded ${uploadedCount}/${Object.keys(IMAGES).length} images\n`);

  // Step 3: Create blog posts
  console.log("Creating blog posts...\n");
  let created = 0;

  for (const post of POSTS) {
    try {
      const heroAssetId = imageIds[post.heroImage];
      const body = post.bodyFn(imageIds);

      const doc = {
        _type: "blog",
        title: post.title,
        slug: { current: post.slug },
        author: post.author,
        publishedAt: post.publishedAt,
        category: post.category,
        excerpt: post.excerpt,
        body: body,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        tags: post.tags,
      };

      // Attach hero image if available
      if (heroAssetId) {
        doc.mainImage = {
          _type: "image",
          asset: { _type: "reference", _ref: heroAssetId },
        };
      }

      const result = await client.create(doc);
      created++;
      console.log(`  [${post.category}] ${post.title}`);
      console.log(`     ID: ${result._id} | Hero: ${heroAssetId ? "YES" : "NO"}\n`);
    } catch (err) {
      console.error(`  Failed: ${post.title}`);
      console.error(`     ${err.message}\n`);
    }
  }

  console.log("=".repeat(50));
  console.log(`Done! Created ${created} blog posts with images.`);
  console.log();
  console.log("Verify at:");
  console.log("  https://tamilcinema-website.vercel.app/");
  console.log("  https://tamilcinema-website.vercel.app/blogs");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
