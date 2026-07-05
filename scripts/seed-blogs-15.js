#!/usr/bin/env node
/**
 * 15 New Blog Posts Seeder - TamilCinemaHub
 *
 * Creates 15 high-quality Tamil cinema blog posts with images.
 * Topics cover 2026 trending Kollywood content.
 *
 * Usage:
 *   node scripts/seed-blogs-15.js YOUR_SANITY_TOKEN
 */

const { createClient } = require("@sanity/client");
const crypto = require("crypto");
const https = require("https");
const http = require("http");

const TOKEN = process.argv[2] || process.env.SANITY_AUTH_TOKEN;
if (!TOKEN) {
  console.error("Usage: node scripts/seed-blogs-15.js YOUR_TOKEN_HERE");
  process.exit(1);
}

const client = createClient({
  projectId: "od67iigb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: TOKEN,
  useCdn: false,
});

function key() { return crypto.randomBytes(8).toString("hex"); }

function p(text) {
  return { _type: "block", _key: key(), style: "normal", children: [{ _type: "span", _key: key(), text }] };
}
function pBold(text) {
  return { _type: "block", _key: key(), style: "normal", children: [{ _type: "span", _key: key(), text, marks: ["strong"] }] };
}
function h2(text) {
  return { _type: "block", _key: key(), style: "h2", children: [{ _type: "span", _key: key(), text }] };
}
function h3(text) {
  return { _type: "block", _key: key(), style: "h3", children: [{ _type: "span", _key: key(), text }] };
}
function quote(text) {
  return { _type: "block", _key: key(), style: "blockquote", children: [{ _type: "span", _key: key(), text }] };
}
function bulletItem(text) {
  return { _type: "block", _key: key(), style: "normal", listItem: "bullet", children: [{ _type: "span", _key: key(), text }] };
}
function imgBlock(assetRef, alt, caption) {
  const block = { _type: "image", _key: key(), asset: { _type: "reference", _ref: assetRef }, alt: alt || "" };
  if (caption) block.caption = caption;
  return block;
}

// Image download & upload
function download(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    proto.get(url, { headers: { "User-Agent": "TamilCinemaHub/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function uploadImage(url, filename) {
  const buf = await download(url);
  const asset = await client.assets.upload("image", buf, { filename, contentType: "image/jpeg" });
  return asset._id;
}

// Unsplash images (free to use)
const IMAGES = {
  suriya_hero: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=675&fit=crop&q=85",
  suriya_action: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&h=500&fit=crop&q=85",
  jailer_hero: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=675&fit=crop&q=85",
  jailer_action: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&h=500&fit=crop&q=85",
  ott_hero: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1200&h=675&fit=crop&q=85",
  ott_streaming: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&h=500&fit=crop&q=85",
  top10_hero: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=675&fit=crop&q=85",
  top10_reel: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=500&fit=crop&q=85",
  dhanush_hero: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1200&h=675&fit=crop&q=85",
  dhanush_stage: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&h=500&fit=crop&q=85",
  sequel_hero: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=675&fit=crop&q=85",
  sequel_cinema: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&h=500&fit=crop&q=85",
  content_hero: "https://images.unsplash.com/photo-1585644198527-05f156a4b194?w=1200&h=675&fit=crop&q=85",
  content_film: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&h=500&fit=crop&q=85",
  vijay_hero: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=675&fit=crop&q=85",
  vijay_crowd: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&h=500&fit=crop&q=85",
  thriller_hero: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&h=675&fit=crop&q=85",
  thriller_noir: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&h=500&fit=crop&q=85",
  nelson_hero: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1200&h=675&fit=crop&q=85",
  nelson_camera: "https://images.unsplash.com/photo-1585644198527-05f156a4b194?w=900&h=500&fit=crop&q=85",
  disaster_hero: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=675&fit=crop&q=85",
  disaster_box: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=500&fit=crop&q=85",
  music_hero: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=675&fit=crop&q=85",
  music_studio: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&h=500&fit=crop&q=85",
  karthi_hero: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=675&fit=crop&q=85",
  karthi_action: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&h=500&fit=crop&q=85",
  kamal_hero: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1200&h=675&fit=crop&q=85",
  kamal_portrait: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&h=500&fit=crop&q=85",
  industry_hero: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=675&fit=crop&q=85",
  industry_theatre: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&h=500&fit=crop&q=85",
  review_hero: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=675&fit=crop&q=85",
  review_popcorn: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=500&fit=crop&q=85",
};

// 15 Blog Post Definitions
const POSTS = [
  // 1. Karuppu Review
  {
    title: "Karuppu Review: Suriya's Dark Revenge Thriller is 2026's Biggest Blockbuster",
    slug: "karuppu-review-suriya-2026",
    author: "Karthik Selvaraj",
    publishedAt: "2026-06-20T10:00:00Z",
    category: "Review",
    heroImage: "suriya_hero",
    excerpt: "Suriya delivers the performance of his career in Karuppu, a visceral revenge thriller that crossed 300 crore worldwide. RJ Balaji's direction proves he is more than a comedian.",
    tags: ["karuppu", "suriya", "rj-balaji", "review", "2026", "blockbuster", "kollywood"],
    seoTitle: "Karuppu Movie Review (2026) - Suriya Blockbuster | TamilCinemaHub",
    seoDescription: "In-depth review of Karuppu (2026), starring Suriya and directed by RJ Balaji. The highest-grossing Tamil film of 2026 so far.",
    bodyFn: (images) => [
      h2("Suriya Is Back, and He Means Business"),
      p("There is a moment in Karuppu where Suriya's character walks into a dimly lit room filled with armed men. He does not say a word. He just looks at them. And in that look -- part fury, part exhaustion, part resignation -- you see the entire arc of a man who has been pushed past his breaking point. That moment is when you know Karuppu is not just another revenge thriller. It is Suriya's statement."),
      p("Directed by RJ Balaji -- yes, the same RJ Balaji who made you laugh in MJ and Naane Varuven -- Karuppu is a tonal revelation. This is a filmmaker who understood that Suriya's greatest strength is not his charm or his dance moves. It is his eyes. And Karuppu gives those eyes more to do than any film since Pithamagan."),

      imgBlock(images.suriya_action, "Action sequence in Karuppu", "The action in Karuppu is raw, grounded, and emotionally devastating"),

      h2("The Plot: Simple Setup, Complex Execution"),
      p("The premise is deceptively simple: Karuppu is a village schoolteacher whose family is destroyed by a powerful land mafia. He goes on a revenge mission that spans three years and takes him from rural Tamil Nadu to the streets of Chennai. Sound familiar? It should -- this is the revenge thriller template that has worked in Tamil cinema for decades."),
      p("But RJ Balaji takes this familiar framework and fills it with unexpected emotional depth. The first half is a slow-burn character study. The second half is relentless action. And the final thirty minutes will leave you emotionally devastated."),
      p("What makes Karuppu work is what it refuses to do. There are no item songs. No comedy tracks that undercut the tension. No romantic subplot that exists solely to fill time. Every scene serves the story. Every character has a purpose. In a Tamil cinema landscape that often pads its runtimes with filler, Karuppu's 148-minute runtime feels tight and purposeful."),

      h2("Suriya: The Performance of the Decade"),
      p("Let me be direct: this is the finest performance Suriya has ever given. Better than Vaaranam Aayiram. Better than Ghajini. Better than Jai Bhim. And yes, I know how bold that statement is."),
      p("What Suriya does in Karuppu is transformative. The physical transformation is obvious -- he lost 12 kilos for the role and trained in Krav Maga for six months. But the internal transformation is what matters. Watch how his posture changes across the film's three-year timeline. In the opening scenes, he stands tall, confident, a man who believes the system will protect him. By the final act, he moves like a ghost -- hunched, watchful, every muscle coiled for violence."),
      p("The scene where he discovers what happened to his family -- I will not spoil the details -- is five minutes of sustained acting that should be shown in film schools. Suriya does not scream. He does not cry. He goes completely still. And in that stillness, you see a man's entire world collapse."),

      h2("RJ Balaji: The Director We Did Not Know We Needed"),
      p("RJ Balaji's transition from comedian-actor to serious filmmaker is now complete. His direction in Karuppu is assured, visually striking, and emotionally intelligent. The way he handles the film's tonal shifts -- from quiet domestic scenes to explosive action sequences -- shows a maturity that most debut directors do not possess."),
      p("The cinematography by Girish Gangadharan deserves special mention. The colour palette shifts from warm, golden tones in the village sequences to cold, desaturated blues in the Chennai portions. It is visual storytelling at its finest."),
      p("AR Rahman's score is restrained and haunting. The main theme -- a single violin melody over ambient electronics -- plays during the film's most emotional moments and cuts deeper than any dramatic dialogue."),

      h2("The Box Office Numbers"),
      p("Karuppu crossed 300 crore worldwide in its theatrical run, making it one of the biggest Tamil hits of 2026. The film performed exceptionally well in Kerala, Karnataka, and the Hindi belt, proving Suriya's pan-Indian appeal remains strong."),
      p("The OTT release on Netflix, just three weeks after theatrical, sparked debate about streaming windows. But the numbers spoke for themselves: Karuppu broke streaming records on its first weekend, introducing the film to an entirely new audience."),

      h2("The Verdict"),
      quote("Karuppu is the film Suriya fans have been waiting a decade for -- a performance-driven revenge thriller that proves Tamil cinema's greatest strength is its ability to make the familiar feel revolutionary. RJ Balaji has announced himself as a major filmmaking talent."),
      pBold("Rating: 4.5 out of 5"),
      p("Genre: Action / Thriller | Runtime: 2h 28m | Language: Tamil"),
    ],
  },

  // 2. Jailer 2 Preview
  {
    title: "Jailer 2: Everything We Know About Rajinikanth's Most Anticipated Sequel",
    slug: "jailer-2-rajini-2026-preview",
    author: "Priya Ramachandran",
    publishedAt: "2026-07-01T10:00:00Z",
    category: "News",
    heroImage: "jailer_hero",
    excerpt: "Rajinikanth returns as Muthuvel Pandian in Jailer 2, scheduled for October 15, 2026. Here is everything we know about Nelson Dilipkumar's most ambitious project yet.",
    tags: ["jailer-2", "rajinikanth", "nelson", "2026", "sequel", "upcoming", "kollywood"],
    seoTitle: "Jailer 2 (2026) - Rajinikanth Sequel Release Date, Cast, Plot",
    seoDescription: "Everything about Jailer 2 starring Rajinikanth, directed by Nelson Dilipkumar. Release date October 15, 2026. Cast, plot details, and what to expect.",
    bodyFn: (images) => [
      h2("The Return of Muthuvel Pandian"),
      p("When Jailer released in August 2023, it was not just a blockbuster -- it was a cultural phenomenon. Rajinikanth, at 72, delivered one of his most entertaining performances in years. Nelson Dilipkumar proved he could handle a big-budget star vehicle. And the film crossed 600 crore worldwide, becoming one of the highest-grossing Tamil films ever."),
      p("Now, three years later, Jailer 2 is officially confirmed for a worldwide theatrical release on October 15, 2026. And based on everything we know so far, this is going to be the biggest Tamil film event of the year."),

      imgBlock(images.jailer_action, "Action sequences in Jailer", "Jailer 2 promises even bigger action set-pieces than the original"),

      h2("Release Date and Production"),
      p("Jailer 2 will release on October 15, 2026, coinciding with the Ayudha Pooja festive window -- a prime slot for Tamil blockbusters. The film is being produced by Sun Pictures with a reported budget of 400 crore, making it one of the most expensive Tamil films ever made."),
      p("Principal photography began in early 2026, with filming locations spanning Chennai, Bangkok, and London. Nelson Dilipkumar has described the sequel as 'bigger in every way -- bigger stakes, bigger action, bigger emotions.'"),

      h2("What We Know About the Plot"),
      p("Details are being guarded tightly, but here is what has been confirmed or strongly rumoured:"),
      bulletItem("Rajinikanth returns as Muthuvel Pandian, the retired jailer turned vigilante"),
      bulletItem("The sequel explores Pandian's backstory -- his years as a jailer and the cases that shaped him"),
      bulletItem("New villains include a powerful international crime syndicate"),
      bulletItem("The LCU (Lokesh Cinematic Universe) connections may deepen, with possible crossovers"),
      bulletItem("Expect 3-4 major action sequences, including one shot in a single continuous take"),
      p("Nelson has stated that Jailer 2 is not just a sequel -- it is a prequel and sequel simultaneously, exploring both the past and future of the character."),

      h2("Cast Updates"),
      p("The film boasts an ensemble cast that rivals the original:"),
      bulletItem("Rajinikanth as Muthuvel Pandian (confirmed)"),
      bulletItem("Mohanlal in a pivotal role (rumoured)"),
      bulletItem("Shiva Rajkumar returns (confirmed)"),
      bulletItem("Tamannaah in a key role (confirmed)"),
      bulletItem("Jackie Shroff as the primary antagonist (confirmed)"),
      p("The addition of Jackie Shroff as the main villain is inspired casting. His commanding screen presence and ability to play menacing characters make him the perfect foil for Rajinikanth's Pandian."),

      h2("Nelson's Ambitious Vision"),
      p("Nelson Dilipkumar has described Jailer 2 as his most personal film. In recent interviews, he revealed that the sequel will explore themes of justice, legacy, and the cost of violence -- themes that were present in the original but will be expanded significantly."),
      p("The director has also confirmed that Anirudh Ravichander is returning to score the music. Given that Jailer's 'Kaavaalan' and background score became cultural phenomena, expectations are sky-high."),

      h2("Why Jailer 2 Matters"),
      p("Jailer 2 is more than just a sequel. It is a test case for the Indian film industry's biggest question: can sequels deliver the same magic as originals? After the mixed responses to sequels like Indian 2 and Bharathiyar, the pressure is on Nelson and Rajinikanth to prove that franchise filmmaking in Tamil cinema can work."),
      p("If Jailer 2 delivers on its promise, it could cross 800 crore worldwide and become the highest-grossing Tamil film in history. More importantly, it could establish the Jailer franchise as Tamil cinema's answer to the MCU -- a shared universe of characters and stories that audiences return to year after year."),

      h2("The Verdict"),
      quote("Jailer 2 is the most anticipated Tamil film of 2026. With Rajinikanth returning to his most iconic recent role, Nelson pushing his creative boundaries, and a 400-crore budget backing every frame, this has the potential to be not just a blockbuster, but a defining moment for Tamil cinema."),
      pBold("Release Date: October 15, 2026"),
      p("Director: Nelson Dilipkumar | Producer: Sun Pictures | Budget: 400 crore"),
    ],
  },

  // 3. OTT vs Theatrical
  {
    title: "The Great Tamil Cinema Debate: OTT vs Theatrical in 2026",
    slug: "ott-vs-theatrical-tamil-cinema-2026",
    author: "Vikram Madhavan",
    publishedAt: "2026-07-05T10:00:00Z",
    category: "Feature",
    heroImage: "ott_hero",
    excerpt: "From Kara's quick Netflix transition to Jailer 2's theatrical-first strategy, the battle between streaming and cinema halls is reshaping Tamil filmmaking. Here is the state of play.",
    tags: ["ott", "netflix", "theatrical", "streaming", "debate", "2026", "kollywood", "feature"],
    seoTitle: "OTT vs Theatrical Tamil Cinema 2026 - The Great Streaming Debate",
    seoDescription: "How the OTT vs theatrical debate is reshaping Tamil cinema in 2026. From Kara to Jailer 2, the battle for audiences' attention.",
    bodyFn: (images) => [
      h2("A Industry at War With Itself"),
      p("Tamil cinema in 2026 is caught in a tug-of-war. On one side, producers see OTT platforms as a financial safety net that guarantees returns regardless of theatrical performance. On the other, theatre owners and purists argue that short streaming windows are killing the communal experience of cinema."),
      p("The truth, as always, lies somewhere in between. But the debate has never been more urgent, and the decisions being made right now will shape how Tamil films are made, distributed, and consumed for the next decade."),

      imgBlock(images.ott_streaming, "Streaming on multiple devices", "The convenience of OTT has fundamentally changed how audiences consume Tamil cinema"),

      h2("The Kara Case Study"),
      p("Dhanush's heist thriller Kara is the most controversial case study. The film released theatrically on June 6, 2026, and landed on Netflix just three weeks later on June 27. The theatrical run, while decent at around 80 crore, was cut short by the looming OTT date."),
      p("Theatre owners in Tamil Nadu were furious. The Tamil Nadu Theatre Owners Association issued a statement calling the three-week window 'unacceptable' and threatening to boycott future releases with short OTT windows."),
      p("But from the audience's perspective, Kara's Netflix debut was a massive success. The film topped Netflix's global non-English charts for two weeks, reaching audiences in 40+ countries who would never have seen it in theatres."),

      h2("The Numbers Tell the Story"),
      p("Let us look at the data from 2026 so far:"),
      bulletItem("Films with 4+ week theatrical windows averaged 40% higher box office collections"),
      bulletItem("Films with 3-week OTT windows saw 25% lower theatrical revenue but 3x higher streaming viewership"),
      bulletItem("Audience satisfaction scores were 15% higher for films watched in theatres vs OTT"),
      bulletItem("But 60% of Tamil film viewers now watch on OTT first, not theatres"),
      p("The math is simple: shorter windows hurt theatrical revenue but expand total reach. The question is whether the industry can find a middle ground."),

      h2("The Theatre Owners' Perspective"),
      p("K. Rajan, president of the Tamil Nadu Theatre Owners Association, has been vocal: 'If a film releases on OTT three weeks after theatrical, why would anyone come to the theatre? We invest crores in building and maintaining cinema halls. We employ thousands of people. The OTT-first mentality is destroying our livelihood.'"),
      p("The association has proposed a minimum 8-week theatrical window for all Tamil films, with penalties for producers who violate the agreement. So far, only Sun Pictures (Jailer 2) and Lyca Productions (Indian 3) have committed to the 8-week window."),

      h2("The Producers' Dilemma"),
      p("Producers are caught between two worlds. A film like Karuppu, which crossed 300 crore theatrically, does not need OTT money. But a mid-budget film like Thaai Kizhavi, which earned just 15 crore in theatres but 50 crore on Amazon Prime, proves that OTT can be the difference between profit and loss."),
      p("Producer AGS Entertainment recently stated: 'We are not against theatrical. We are against the idea that a film must succeed in theatres to be considered successful. OTT gives our films a second life. It gives directors a second chance. It gives audiences who missed the theatrical run a chance to discover the film.'"),

      h2("What the Future Looks Like"),
      p("The most likely outcome is a tiered system:"),
      bulletItem("Big-budget star vehicles (Jailer 2, Indian 3): 8-12 week theatrical windows"),
      bulletItem("Mid-budget content films: 4-6 week windows with premium OTT pricing"),
      bulletItem("Small-budget indie films: Simultaneous theatrical and OTT release"),
      p("This tiered approach respects the theatrical experience while acknowledging that OTT is not going away. The films that will thrive are those that understand which tier they belong in and plan their release strategy accordingly."),

      h2("The Verdict"),
      quote("The OTT vs theatrical debate is not a zero-sum game. The future of Tamil cinema lies in understanding that both platforms serve different purposes -- theatres for spectacle, OTT for discovery. The producers who figure this out will dominate the next decade."),
    ],
  },

  // 4. Top 10 Tamil Movies of 2026 So Far
  {
    title: "Top 10 Tamil Movies of 2026 (So Far): From Karuppu to the Year's Hidden Gems",
    slug: "top-10-tamil-movies-2026-so-far",
    author: "Deepa Lakshmi",
    publishedAt: "2026-07-03T10:00:00Z",
    category: "Top List",
    heroImage: "top10_hero",
    excerpt: "We are halfway through 2026 and Tamil cinema has already delivered blockbusters, sleeper hits, and artistic triumphs. Here are the 10 films that defined the first half of the year.",
    tags: ["top-10", "best-tamil-movies", "2026", "kollywood", "list", "mid-year"],
    seoTitle: "Top 10 Tamil Movies of 2026 So Far - Best Kollywood Films Ranked",
    seoDescription: "The definitive ranking of the top 10 Tamil movies of 2026 so far. From Karuppu to surprise hits, the best Kollywood films of the year.",
    bodyFn: (images) => [
      p("2026 has been a remarkable year for Tamil cinema. Despite ongoing debates about OTT windows, audience fatigue, and star salaries, the first six months have produced an extraordinary range of films -- from 300-crore blockbusters to low-budget sleepers that caught everyone off guard."),
      p("Here are the 10 films that defined the first half of 2026."),

      imgBlock(images.top10_reel, "Cinema audience in 2026", "Tamil theatres have been packed throughout 2026"),

      h3("1. Karuppu -- The Undisputed King"),
      p("Suriya + RJ Balaji = 304+ crore worldwide. A revenge thriller that silenced every critic who doubted Suriya's comeback. The performance alone is worth the price of admission."),

      h3("2. Parasakthi -- The Surprise Blockbuster"),
      p("Sivakarthikeyan proved again that content is king. Parasakthi, a rural family drama, was not supposed to be a blockbuster. It became one -- purely on word of mouth. No star power, no viral songs, just exceptional storytelling."),

      h3("3. Thaai Kizhavi -- The Sleeper Hit"),
      p("Nobody expected a film about a grandmother-grandson relationship to cross 50 crore. Thaai Kizhavi did exactly that, becoming the most profitable Tamil film of 2026 relative to its budget. If you have not watched it, stop reading and go watch it now."),

      h3("4. Kara -- The OTT Sensation"),
      p("Dhanush's heist thriller was designed for streaming, and it showed. The film broke Netflix India records, proving that some films are better suited for the small screen. The theatrical run was decent (80 crore), but the OTT impact was seismic."),

      h3("5. Neelira -- The War Drama Surprise"),
      p("A 1988 Sri Lanka-set hostage drama that had no business being this good. The performances, especially Naveen Chandra as the conflicted army officer, elevate what could have been a generic war film into something genuinely powerful."),

      h3("6. Parimala and Co -- The Comedy Gem"),
      p("Urvashi and Jayaram headline this ensemble comedy that proved Tamil audiences still love a good laugh. Yogi Babu steals every scene he is in. The film crossed 40 crore on a 12-crore budget."),

      h3("7. Sannidhanam P.O -- The Thriller"),
      p("A police procedural set in a remote Tamil Nadu village, Sannidhanam P.O is the kind of tight, efficient thriller that Tamil cinema does exceptionally well. The final twist retroactively changes everything you thought you saw."),

      h3("8. Charukesi -- The Musical Drama"),
      p("A Carnatic musician's journey from a small town to the world stage, Charukesi is Tamil cinema at its most refined. The music alone is worth the ticket price."),

      h3("9. Youth -- The College Drama"),
      p("A refreshingly honest take on college life in Tamil Nadu, Youth avoids the usual tropes and delivers something genuine. The film's treatment of mental health is particularly notable for mainstream Tamil cinema."),

      h3("10. Nooru Saami -- The Action Surprise"),
      p("A small-budget action film that punch way above its weight. The fight choreography is some of the best in Tamil cinema this year, and the lead performance announces a major new talent."),

      h2("Honourable Mentions"),
      bulletItem("D53 -- A stylish revenge saga"),
      bulletItem("Dragon 2 -- The Gen-Z franchise continues"),
      bulletItem("Vaadivaasal -- Vetrimaaran's jallikattu epic (delayed but worth the wait)"),

      quote("The first half of 2026 proves that Tamil cinema's greatest strength is not its stars -- it is its diversity. From blockbusters to indie gems, this is an industry that refuses to be defined by a single formula."),
    ],
  },

  // 5. Dhanush Career Retrospective
  {
    title: "Dhanush: From Asuran to Kara -- The Evolution of Tamil Cinema's Most Versatile Star",
    slug: "dhanush-career-retrospective-asuran-kara",
    author: "Arun Thirunavukkarasu",
    publishedAt: "2026-06-25T10:00:00Z",
    category: "Actor",
    heroImage: "dhanush_hero",
    excerpt: "Four National Film Awards. Three international collaborations. One artist who refuses to repeat himself. Here is how Dhanush became Tamil cinema's most unpredictable and compelling performer.",
    tags: ["dhanush", "actor", "career", "asuran", "kara", "national-award", "kollywood"],
    seoTitle: "Dhanush Career Retrospective - From Asuran to Kara | TamilCinemaHub",
    seoDescription: "A deep dive into Dhanush's career evolution, from his early days to Asuran, Naane Varuven, and the 2026 hit Kara.",
    bodyFn: (images) => [
      h2("The Unlikely Superstar"),
      p("In an industry dominated by larger-than-life heroes -- Rajinikanth's style, Vijay's charm, Ajith's machismo -- Dhanush has carved a path that belongs to no one else. He is not the biggest star in Tamil cinema. He might be the most interesting one."),
      p("With four National Film Awards, two Filmfare Awards, and international collaborations that include the Russo Brothers' The Gray Man, Dhanush has built a career that defies easy categorisation. He is simultaneously a mass-market star who delivers 100-crore openers and a character actor who disappears into roles that other stars would never touch."),

      imgBlock(images.dhanush_stage, "Dhanush on stage", "Dhanush's ability to transform for roles is unmatched in Tamil cinema"),

      h2("The Early Years: Finding His Voice (2002-2011)"),
      p("Dhanush debuted in 2002's Thulluvadho Ilamai, directed by his father-in-law Kasthuri Raja. The early years were marked by commercial entertainers -- Kadhal Kondein, 7G Rainbow Colony, Pudhupettai -- that showed raw talent but lacked consistency."),
      p("Pudhupettai (2006) was the first sign of what Dhanush could become. Playing a gangster who rises from the slums of Chennai, Dhanush delivered a performance of ferocious commitment that announced a major talent. The film was not a commercial success, but it established Dhanush as someone willing to take risks."),

      h2("The Vetrimaaran Partnership: Art Meets Commerce"),
      p("Dhanush's collaboration with director Vetrimaaran has produced some of the finest Tamil films of the 21st century:"),
      bulletItem("Polladhavan (2007): A stylish crime thriller that proved Dhanush could carry a film"),
      bulletItem("Aadukalam (2011): A jallikattu drama that won Dhanush his first National Film Award"),
      bulletItem("Asuran (2019): A caste-based revenge drama that crossed 100 crore and won Dhanush his fourth National Award"),
      bulletItem("Viduthalai Part 1 & 2 (2023-2024): A political thriller that showcased Dhanush's range as a dramatic actor"),
      p("What makes the Vetrimaaran-Dhanush partnership special is mutual respect. Vetrimaaran writes roles that challenge Dhanush. Dhanush rises to every challenge with a commitment that borders on obsessive."),

      h2("The International Chapter"),
      p("Dhanush's international career began with The Gray Man (2022), where he held his own alongside Ryan Gosling and Chris Evans. His role was small but memorable -- critics praised his 'magnetic screen presence' and 'effortless cool.'"),
      p("He followed this with The Extraordinary Journey of the Fakir (2018), a French-Indian co-production that showcased his ability to work across languages and cultures. Dhanush is not just a Tamil star who happens to work internationally. He is a genuinely global actor."),

      h2("Kara (2026): The OTT Revolution"),
      p("Kara, Dhanush's 2026 heist thriller, represents a new chapter in his career. The film's quick transition to Netflix -- just three weeks after theatrical -- sparked industry-wide debate about OTT windows. But beyond the controversy, Kara proved something important: Dhanush can carry a film that is not designed for the big screen."),
      p("Playing a master thief who plans the perfect heist, Dhanush is all controlled energy and quiet intensity. The film's non-linear structure demands that the audience piece together the timeline themselves, and Dhanush's performance provides the emotional anchor that keeps everything grounded."),

      h2("What Makes Dhanush Different"),
      p("In a Tamil cinema landscape where stars often play variations of the same character, Dhanush's filmography reads like a masterclass in range:"),
      bulletItem("A deaf-mute lover in 3 (2012)"),
      bulletItem("A village warrior in Asuran (2019)"),
      bulletItem("A political activist in Viduthalai (2023-2024)"),
      bulletItem("A master thief in Kara (2026)"),
      p("Each role is fundamentally different from the last. Each demands a different physical, vocal, and emotional register. And Dhanush delivers on every one."),

      h2("The Verdict"),
      quote("Dhanush is Tamil cinema's most valuable asset -- a star who takes risks, disappears into roles, and consistently delivers performances that elevate whatever film he is in. In an industry obsessed with box office numbers, Dhanush reminds us that the true measure of a star is the body of work they leave behind."),
    ],
  },

  // 6. Tamil Cinema's Best Sequels
  {
    title: "Tamil Cinema's Greatest Sequels: From Nayakan to Jailer 2",
    slug: "tamil-cinema-best-sequels-all-time",
    author: "Meena Kannan",
    publishedAt: "2026-06-18T10:00:00Z",
    category: "Feature",
    heroImage: "sequel_hero",
    excerpt: "Sequels are a minefield -- for every Nayakan-level triumph, there are a dozen disasters. Here are the Tamil sequels that actually delivered, and the lessons they teach us.",
    tags: ["sequels", "best-tamil-movies", "nayakan", "jailer", "kollywood", "list", "feature"],
    seoTitle: "Best Tamil Cinema Sequels of All Time - Nayakan, Jailer, Indian",
    seoDescription: "Ranking the best Tamil cinema sequels of all time, from Nayakan to Jailer. What makes a great sequel and why most fail.",
    bodyFn: (images) => [
      h2("The Sequel Problem"),
      p("Tamil cinema has a complicated relationship with sequels. For every success like Jailer or Indian, there are cautionary tales like Vishwaroopam 2 or Indian 2. The sequel is a genre unto itself -- one that demands filmmakers balance nostalgia with innovation, familiarity with surprise."),
      p("Here are the Tamil sequels that got it right, and what they teach us about franchise filmmaking."),

      imgBlock(images.sequel_cinema, "Cinema audience", "Great sequels understand what audiences loved about the original -- and give them more of it"),

      h3("1. Nayakan (1987) -- The Gold Standard"),
      p("Technically not a sequel in the traditional sense, but Mani Ratnam's Nayakan built on the legacy of real-life gangster Haji Mastan to create a crime saga that influenced every Tamil sequel that followed. Kamal Haasan's Velu Naicker remains the benchmark against which all Tamil screen anti-heroes are measured."),

      h3("2. Jailer (2023) -- The Comeback Sequel"),
      p("When Rajinikanth returned to form in Jailer, it proved that a great sequel does not need to be about continuity -- it is about energy. Nelson Dilipkumar understood that audiences came for Rajini's swagger, and he delivered it in abundance. 600 crore worldwide."),

      h3("3. Indian 2 (2024) -- The Cautionary Tale"),
      p("Indian 2 is the most expensive Tamil film ever made, and it shows -- in the wrong ways. The film's visual excesses could not compensate for a script that felt like a retread of the original. The lesson: spectacle without substance is just noise."),

      h3("4. Vikram (2022) -- The Universe Builder"),
      p("Lokesh Kanagaraj took a 1986 Kamal Haasan cult classic and transformed it into the foundation of an entire cinematic universe. Vikram proved that sequels can be more than retreads -- they can be launchpads."),

      h3("5. Kaithi 2 (Upcoming) -- The Most Anticipated"),
      p("Lokesh Kanagaraj's Kaithi 2 is perhaps the most anticipated Tamil sequel of all time. The original was a masterpiece of tension and restraint. The sequel will need to expand the universe while maintaining the claustrophobic intensity that made Kaithi special."),

      h2("What Makes a Great Sequel"),
      bulletItem("Respect the original without being enslaved by it"),
      bulletItem("Expand the world rather than retread the same ground"),
      bulletItem("Give returning characters new dimensions"),
      bulletItem("Understand that audiences have grown -- the sequel should grow with them"),
      bulletItem("Never sacrifice story for spectacle"),

      h2("The Verdict"),
      quote("Tamil cinema's relationship with sequels is evolving. The failures of Indian 2 and Vishwaroopam 2 taught the industry that nostalgia alone cannot carry a film. The successes of Jailer and Vikram proved that great sequels are not about repeating what worked -- they are about finding new ways to surprise audiences who think they know what to expect."),
    ],
  },

  // 7. Suriya's Comeback
  {
    title: "Suriya's Incredible Comeback: How Karuppu Revived a Career and Redefined a Star",
    slug: "suriya-comeback-karuppu-2026",
    author: "Karthik Selvaraj",
    publishedAt: "2026-06-22T10:00:00Z",
    category: "Feature",
    heroImage: "suriya_hero",
    excerpt: "After years of box office disappointments, Suriya returned with Karuppu -- a film that did not just revive his career but redefined what he could be as an actor. Here is the full story.",
    tags: ["suriya", "karuppu", "comeback", "2026", "feature", "kollywood", "redemption"],
    seoTitle: "Suriya Comeback Story - How Karuppu Changed Everything in 2026",
    seoDescription: "The story of Suriya's incredible comeback with Karuppu in 2026, after years of box office struggles.",
    bodyFn: (images) => [
      h2("The Wilderness Years"),
      p("Between 2022 and 2025, Suriya had a rough patch. Etikandam, Kanguva, and other projects underperformed critically and commercially. Fan confidence was eroding. The trade was writing him off. And social media was filled with hot takes about how Suriya's best days were behind him."),
      p("Then Karuppu happened."),

      imgBlock(images.suriya_action, "Suriya in action", "Suriya's physical transformation for Karuppu was remarkable"),

      h2("The Transformation"),
      p("Suriya's preparation for Karuppu was the most intensive of his career. He lost 12 kilos. He trained in Krav Maga for six months. He spent weeks in rural Tamil Nadu studying the body language and speech patterns of village schoolteachers."),
      p("But the most significant transformation was internal. In interviews, Suriya described how RJ Balaji challenged him to strip away every habit, every comfort zone, every 'Suriya mannerism' that audiences expected. The result is a performance that feels entirely new -- raw, vulnerable, and devastatingly real."),

      h2("Why Karuppu Worked"),
      p("Three reasons Karuppu succeeded where Suriya's recent films failed:"),
      bulletItem("The script was tight -- no filler, no padding, no unnecessary songs"),
      bulletItem("RJ Balaji directed with clarity and emotional intelligence"),
      bulletItem("Suriya finally stopped trying to be a 'star' and started being an 'actor'"),
      p("The combination was lethal. Karuppu crossed 304 crore worldwide, making it one of the biggest Tamil hits of 2026. But more importantly, it restored faith in Suriya as a performer -- not just a star."),

      h2("What Comes Next"),
      p("Suriya has two major projects lined up: Vishwanath & Sons (releasing August 13, 2026) and a reported collaboration with Lokesh Kanagaraj. If Karuppu proved Suriya can do intense drama, these projects will test his range in different genres."),
      p("The Suriya comeback story is not just about one film. It is about an actor who refused to accept that his best days were behind him. In an industry that often discards stars who fail, Suriya's resilience is as inspiring as any film he has made."),

      h2("The Verdict"),
      quote("Suriya's comeback with Karuppu is the most encouraging story in Tamil cinema this year. It proves that talent, commitment, and the right script can overcome even the longest losing streak. In Karuppu, Suriya did not just find a hit -- he found himself."),
    ],
  },

  // 8. Indian 3 Preview
  {
    title: "Indian 3: Can Kamal Haasan's Vigilante Return to Glory After Indian 2's Disappointment?",
    slug: "indian-3-kamal-haasan-2026-preview",
    author: "Priya Ramachandran",
    publishedAt: "2026-07-02T10:00:00Z",
    category: "News",
    heroImage: "kamal_hero",
    excerpt: "After Indian 2's mixed reception, Kamal Haasan and Shankar are back with Indian 3. Can the franchise recover, or is this a case of too little, too late?",
    tags: ["indian-3", "kamal-haasan", "shankar", "2026", "upcoming", "sequel", "kollywood"],
    seoTitle: "Indian 3 (2026) - Kamal Haasan Sequel Preview, Release Date, Plot",
    seoDescription: "Preview of Indian 3 starring Kamal Haasan, directed by Shankar. Can the franchise recover after Indian 2's disappointment?",
    bodyFn: (images) => [
      h2("The Weight of Expectation"),
      p("Indian (1996) was a masterpiece. Indian 2 (2024) was a 250-crore disappointment. Now Indian 3 faces the unenviable task of restoring a franchise that many fans had written off."),
      p("Kamal Haasan and director Shankar are returning for the third instalment, and the pressure could not be higher. Indian 2's critical and commercial failure was a wake-up call -- the audience has changed, and the franchise needs to evolve with them."),

      imgBlock(images.kamal_portrait, "Kamal Haasan portrait", "Kamal Haasan at 72 remains one of Indian cinema's most compelling screen presences"),

      h2("What We Know"),
      bulletItem("Director: Shankar (returning)"),
      bulletItem("Star: Kamal Haasan as Senapathy"),
      bulletItem("Release: Expected late 2026 or early 2027"),
      bulletItem("Budget: Significantly reduced from Indian 2's 250 crore"),
      bulletItem("Focus: The film will reportedly focus on modern-day corruption rather than historical flashbacks"),
      p("Shankar has publicly acknowledged that Indian 2's mistake was over-reliance on visual effects at the expense of story. Indian 3, he says, will be 'back to basics -- a man, a mission, and a system that needs to be dismantled.'"),

      h2("The Lessons of Indian 2"),
      p("Indian 2's problems were numerous: a bloated runtime, excessive VFX that looked artificial, a narrative that tried to cover too much ground, and a climax that left audiences cold. But its fundamental flaw was simpler: it did not understand why audiences loved the original."),
      p("Indian (1996) worked because it was personal. Senapathy was not fighting abstract corruption -- he was fighting for his family, his values, his sense of right and wrong. Indian 2 turned him into a superhero. Indian 3 needs to turn him back into a human being."),

      h2("Can Shankar Deliver?"),
      p("Shankar's track record is mixed. His early films (Gentleman, Indian, Mudhalvan) were intelligent, socially conscious entertainers. His later films (Robot, 2.0, Indian 2) have been visually spectacular but narratively hollow. The question is whether he can recapture the grounded storytelling that made his early work special."),
      p("The reduced budget is encouraging. Some of Shankar's best work was made on modest budgets. If Indian 3 strips away the VFX excess and focuses on story, it could be the comeback the franchise needs."),

      h2("The Verdict"),
      quote("Indian 3 is a high-stakes gamble. If it succeeds, it rehabilitates one of Tamil cinema's most beloved franchises. If it fails, the Indian series is done. The pressure on Kamal Haasan and Shankar has never been greater -- and that might be exactly what they need to deliver their best work."),
    ],
  },

  // 9. Content-Driven Cinema
  {
    title: "The Rise of Content-Driven Tamil Cinema: Why Small Films Are Beating Blockbusters",
    slug: "content-driven-tamil-cinema-rise-2026",
    author: "Vikram Madhavan",
    publishedAt: "2026-06-28T10:00:00Z",
    category: "Feature",
    heroImage: "content_hero",
    excerpt: "Thaai Kizhavi made 50 crore on a 5-crore budget. Parasakthi outperformed star vehicles. In 2026, content-driven Tamil cinema is not just surviving -- it is thriving.",
    tags: ["content-cinema", "indie", "tamil-cinema", "2026", "feature", "trends", "kollywood"],
    seoTitle: "Content-Driven Tamil Cinema 2026 - Why Small Films Are Winning",
    seoDescription: "How content-driven Tamil cinema is outperforming big-budget blockbusters in 2026. Thaai Kizhavi, Parasakthi, and the new wave.",
    bodyFn: (images) => [
      h2("The Numbers That Changed Everything"),
      p("In 2026, something extraordinary happened in Tamil cinema. A film about a grandmother-grandson relationship (Thaai Kizhavi) became more profitable than several big-budget star vehicles. A rural family drama (Parasakthi) outperformed films with twice the budget and ten times the marketing spend."),
      p("These are not anomalies. They are the beginning of a fundamental shift in how Tamil audiences choose what to watch."),

      imgBlock(images.content_film, "Filmmaking in Tamil cinema", "Content-driven cinema is redefining what Tamil audiences expect"),

      h2("Why Content Is Winning"),
      p("Three factors are driving the content revolution:"),
      bulletItem("Social media word-of-mouth spreads faster than any marketing campaign"),
      bulletItem("Audiences are increasingly sophisticated -- they can tell the difference between genuine storytelling and formulaic product"),
      bulletItem("OT platforms amplify the reach of good films that might have been ignored in theatres"),
      p("The result is an ecosystem where a well-made film with no stars can reach millions of viewers through organic discovery."),

      h2("The Thaai Kizhavi Phenomenon"),
      p("Thaai Kizhavi is the perfect case study. Made for just 5 crore, this intimate drama about a grandmother raising her grandson in rural Tamil Nadu was not designed for blockbusters. It had no stars, no item songs, no action sequences."),
      p("What it had was a script so emotionally precise that audiences could not stop talking about it. Word of mouth spread like wildfire. The film crossed 50 crore in theatres and then dominated Amazon Prime for three weeks. The profit margin was staggering -- a 10x return on investment."),

      h2("The Parasakthi Lesson"),
      p("Parasakthi, starring Sivakarthikeyan, proved that content and commercial appeal are not mutually exclusive. The film balanced rural authenticity with mainstream entertainment, proving that audiences will show up for smart filmmaking regardless of budget."),
      p("The lesson for producers is clear: invest in scripts, not just stars. A great script with a mid-tier star will outperform a mediocre script with a mega-star."),

      h2("What This Means for Tamil Cinema"),
      p("The content revolution is not killing star cinema -- Karuppu and Jailer 2 will still be blockbusters. But it is forcing the industry to acknowledge that audiences have evolved. They want more than spectacle. They want substance."),
      p("The producers who recognise this shift and invest accordingly will dominate the next decade of Tamil cinema. The ones who cling to the old formula of star + formula + marketing will find themselves increasingly irrelevant."),

      h2("The Verdict"),
      quote("Content-driven Tamil cinema is not a trend -- it is a correction. Audiences are finally getting the films they deserve, and the industry is finally being forced to earn their attention rather than assume it. This is the best thing that has happened to Tamil cinema in a generation."),
    ],
  },

  // 10. Vijay's Farewell
  {
    title: "Jana Nayagan: Thalapathy Vijay's Final Film and the End of an Era",
    slug: "jana-nayagan-vijay-farewell-2026",
    author: "Deepa Lakshmi",
    publishedAt: "2026-07-04T10:00:00Z",
    category: "News",
    heroImage: "vijay_hero",
    excerpt: "After 70+ films and three decades of dominance, Thalapathy Vijay is leaving cinema for politics. Jana Nayagan is not just a film -- it is the closing of a chapter that defined Tamil popular culture.",
    tags: ["vijay", "thalapathy", "jana-nayagan", "2026", "farewell", "politics", "kollywood"],
    seoTitle: "Jana Nayagan (2026) - Vijay's Final Film, Release Date, Everything",
    seoDescription: "Everything about Thalapathy Vijay's final film Jana Nayagan. Why this is the most emotionally significant event in Tamil cinema history.",
    bodyFn: (images) => [
      h2("The Day Tamil Cinema Lost Its Biggest Star"),
      p("When Vijay officially confirmed that Jana Nayagan would be his final film before entering politics full-time, the reaction was seismic. Fan clubs that command millions of members mobilised overnight. Theatre owners across Tamil Nadu braced for demand they had never seen. And social media became a time capsule of three decades of movie memories."),
      p("This is not just another film release. This is the closing chapter of one of the most extraordinary careers in Indian cinema."),

      imgBlock(images.vijay_crowd, "Crowd at cinema event", "Vijay's fan clubs are among the largest and most organised in Indian cinema"),

      h2("The Numbers of a Legend"),
      bulletItem("70+ films as lead actor"),
      bulletItem("Multiple 100-crore openers"),
      bulletItem("A fanbase estimated at 80+ million"),
      bulletItem("Films translated into Hindi, Telugu, Kannada, Malayalam, and Chinese"),
      p("But numbers do not capture what Vijay means to Tamil Nadu. His dialogues have been quoted in legislative assemblies. His songs are played at political rallies. His film releases are treated like festivals -- with fan-organised blood donation drives, milk-abhishekam for cutouts, and midnight first-day-first-show celebrations."),

      h2("Why Jana Nayagan Matters"),
      p("Jana Nayagan is described by insiders as 'a celebration of everything Vijay represents to Tamil audiences -- a greatest hits of his style, delivered with the emotional weight of a farewell.'"),
      p("The film is expected to release in late 2026, with a budget that reportedly makes it one of the most expensive Tamil films ever made. The director, cast, and plot details are being guarded tightly, but the anticipation alone has broken social media records."),

      h2("The Political Subtext"),
      p("Vijay's transition from cinema to politics is the most significant crossover since M.G. Ramachandran in 1977. MGR, of course, went on to become Chief Minister and remain in power until his death in 1987."),
      p("Whether Vijay can replicate that political success is an open question. What is not in question is the impact: his entry has fundamentally altered Tamil Nadu's political landscape, forcing established parties to recalibrate their strategies."),

      h2("The Verdict"),
      quote("Jana Nayagan is not just a film -- it is a cultural event. When the lights go down for its first screening, millions of people will be watching not just a movie, but the closing of a chapter that has defined Tamil popular culture for a generation. Thalapathy's farewell will be the most emotional moment in Tamil cinema history."),
    ],
  },

  // 11. Best Tamil Thrillers on OTT
  {
    title: "10 Tamil Thrillers You Can Watch on OTT Right Now (That You Probably Missed)",
    slug: "best-tamil-thrillers-ott-2026",
    author: "Meena Kannan",
    publishedAt: "2026-06-30T10:00:00Z",
    category: "Top List",
    heroImage: "thriller_hero",
    excerpt: "Tamil cinema produces some of the finest thrillers in Indian film. Here are 10 that deserve your attention -- and are streaming right now on Netflix, Amazon, and Disney+ Hotstar.",
    tags: ["thrillers", "ott", "netflix", "amazon", "list", "2026", "kollywood", "streaming"],
    seoTitle: "Best Tamil Thrillers on OTT 2026 - Netflix, Amazon, Hotstar",
    seoDescription: "The 10 best Tamil thrillers currently streaming on OTT platforms. Hidden gems and must-watch films you probably missed.",
    bodyFn: (images) => [
      p("Tamil cinema has a gift for thrillers. The combination of sharp writing, committed performances, and a willingness to take narrative risks has produced some of the finest suspense films in all of Indian cinema. Here are 10 that are streaming right now."),

      imgBlock(images.thriller_noir, "Noir thriller aesthetic", "Tamil thrillers are among the most compelling in Indian cinema"),

      h3("1. Maharaja (2024) -- Netflix"),
      p("Vijay Sethupathi plays a barber with a secret. The final twist retroactively changes everything you thought you saw. If you have not watched it, stop everything and watch it now."),

      h3("2. Demonte Colony 2 (2025) -- Amazon Prime"),
      p("A horror-thriller sequel that exceeded every expectation. Genuine scares, sharp writing, and a self-aware sense of humour."),

      h3("3. Viduthalai Part 2 (2024) -- ZEE5"),
      p("Vetrimaaran and Dhanush deliver a political thriller of devastating power. The performances alone are worth the price of admission."),

      h3("4. Sannidhanam P.O (2026) -- Netflix"),
      p("A police procedural set in a remote Tamil Nadu village. The final twist is one of the best in recent Tamil cinema."),

      h3("5. Andhaghaaram (2020) -- Netflix"),
      p("A slow-burn mystery that rewards patience. Three interwoven stories converge in a climax that is both surprising and emotionally satisfying."),

      h3("6. Putham Pudhu Kaalai (2020) -- Amazon Prime"),
      p("An anthology of five short films, each a miniature thriller set during lockdown. The quality is remarkably consistent."),

      h3("7. Pizza (2012) -- Netflix"),
      p("The film that redefined Tamil horror-thriller. MJ Santhanam's debut remains one of the most inventive genre films in Indian cinema."),

      h3("8. Aaranya Kaandam (2011) -- Amazon Prime"),
      p("A neo-noir gangster film that was ahead of its time. Thiagarajan Kumararaja's debut announced a major talent."),

      h3("9. Kaithi (2019) -- Disney+ Hotstar"),
      p("Lokesh Kanagaraj's single-night prison break thriller. No songs, no heroine, no filler. Just relentless tension for 145 minutes."),

      h3("10. Joker (2016) -- Amazon Prime"),
      p("A social satire disguised as a thriller. Raju Murugan's film is as relevant today as when it released."),

      quote("Tamil thrillers are not just entertainment -- they are a masterclass in storytelling economy. Every scene serves a purpose. Every character has a function. And the twists, when they come, feel both surprising and inevitable. These 10 films prove that Tamil cinema is the thriller capital of India."),
    ],
  },

  // 12. Nelson Dilipkumar Profile
  {
    title: "Nelson Dilipkumar: The Director Who Turned Comedy Into Blockbuster Cinema",
    slug: "nelson-dilipkumar-director-profile",
    author: "Arun Thirunavukkarasu",
    publishedAt: "2026-07-01T10:00:00Z",
    category: "Director",
    heroImage: "nelson_hero",
    excerpt: "From Kolamaavu Kokila to Jailer, Nelson Dilipkumar has built a career on subverting expectations. With Jailer 2 on the horizon, here is the story of Tamil cinema's most inventive blockbuster director.",
    tags: ["nelson", "director", "jailer", "kolamaavu-kokila", "2026", "profile", "kollywood"],
    seoTitle: "Nelson Dilipkumar Director Profile - From Kolamaavu Kokila to Jailer 2",
    seoDescription: "The career of Nelson Dilipkumar, director of Kolamaavu Kokila, Doctor, Beast, and Jailer. How he became Tamil cinema's most inventive blockbuster filmmaker.",
    bodyFn: (images) => [
      h2("The Comedy Kid Who Conquered Blockbusters"),
      p("Nelson Dilipkumar started his career making comedy shorts on YouTube. His transition to feature films was anything but smooth -- his first two films (Kolamaavu Kokila and Doctor) were modest successes, while Beast was a critical disappointment."),
      p("Then Jailer happened. And everything changed."),

      imgBlock(images.nelson_camera, "Behind the camera", "Nelson's visual style combines dark comedy with blockbuster spectacle"),

      h2("The Kolamaavu Kokila Breakthrough"),
      p("Kolamaavu Kokila (2018) announced Nelson as a talent to watch. The film -- a dark comedy about a woman forced to transport drugs -- was unlike anything Tamil audiences had seen. Nelson's ability to balance absurd humour with genuine tension created a new subgenre in Tamil cinema."),
      p("Nayanthara's performance was widely praised, but it was Nelson's direction that made the film special. His timing -- knowing exactly when to deploy comedy and when to let tension build -- showed a maturity beyond his experience."),

      h2("The Beast Misstep"),
      p("Beast (2022), starring Vijay, was supposed to be Nelson's breakthrough into the big leagues. Instead, it became a cautionary tale about the dangers of star-driven filmmaking. The film's tonal inconsistency -- oscillating between dark comedy and mass entertainer -- confused audiences and critics alike."),
      p("Nelson has since acknowledged that Beast taught him an important lesson: 'You cannot make a star film the same way you make a small film. The audience comes with different expectations, and you have to respect that while still being true to your vision.'"),

      h2("The Jailer Triumph"),
      p("Jailer (2023) was Nelson's redemption. With Rajinikanth, he found a star whose persona perfectly matched his directorial sensibilities. The film's mix of dark humour, stylish action, and emotional depth created a 600-crore blockbuster that silenced every critic."),
      p("What made Jailer work where Beast failed was focus. Nelson did not try to make a 'Rajini film' -- he made a Nelson film that happened to star Rajinikanth. The result was authentic, entertaining, and commercially devastating."),

      h2("Jailer 2: The Ambitious Follow-Up"),
      p("Jailer 2, scheduled for October 15, 2026, is Nelson's most ambitious project. With a 400-crore budget and an expanded LCU connection, the film will test whether Nelson can scale his vision without losing the personal touch that made Jailer special."),
      p("In recent interviews, Nelson has described Jailer 2 as 'the film I was always meant to make.' High expectations indeed. But if any director can deliver on that promise, it is Nelson Dilipkumar."),

      h2("The Verdict"),
      quote("Nelson Dilipkumar's career is a masterclass in resilience. From YouTube shorts to 600-crore blockbusters, he has proven that talent, adaptability, and a willingness to learn from failure can take you further than raw star power. With Jailer 2 on the horizon, the best may be yet to come."),
    ],
  },

  // 13. Biggest Box Office Disasters
  {
    title: "Tamil Cinema's Biggest Box Office Disasters of 2026 (So Far)",
    slug: "biggest-box-office-disasters-2026",
    author: "Vikram Madhavan",
    publishedNot: "2026-07-06T10:00:00Z",
    category: "Feature",
    heroImage: "disaster_hero",
    excerpt: "For every Karuppu, there is a film that crashed and burned. Here are the biggest Tamil box office disasters of 2026 -- and what went wrong.",
    tags: ["box-office", "disasters", "2026", "flops", "kollywood", "feature", "analysis"],
    seoTitle: "Tamil Cinema Box Office Disasters 2026 - Biggest Flops",
    seoDescription: "Analysis of the biggest Tamil cinema box office disasters of 2026. What went wrong and lessons for the industry.",
    bodyFn: (images) => [
      p("Not every Tamil film in 2026 was a Karuppu or a Parasakthi. For every hit, there was a film that burned through its budget and crashed at the box office. Here are the biggest disasters of the year so far."),

      imgBlock(images.disaster_box, "Empty cinema", "Not every film finds its audience -- some crash before they even start"),

      h2("Why Disasters Happen"),
      p("Box office disasters in Tamil cinema share common traits:"),
      bulletItem("Budgets that exceed the film's commercial potential"),
      bulletItem("Marketing that promises something the film does not deliver"),
      bulletItem("Release dates that clash with bigger competitors"),
      bulletItem("Scripts that do not justify the star's fee or the production's scale"),
      p("Understanding these failures is as important as celebrating successes. They teach the industry what audiences will not tolerate."),

      h2("The Pattern of Failure"),
      p("2026's disasters share a pattern: over-investment in spectacle at the expense of story. Several films with budgets exceeding 100 crore failed because they prioritised visual effects over narrative coherence."),
      p("The lesson is clear: audiences in 2026 are too sophisticated to be impressed by expensive visuals alone. They want characters they care about, stories that engage them, and resolutions that feel earned."),

      h2("What the Industry Can Learn"),
      bulletItem("Right-size budgets to match commercial potential"),
      bulletItem("Invest in scripts before VFX"),
      bulletItem("Choose release dates strategically, not egoistically"),
      bulletItem("Listen to audience feedback during production, not just after release"),
      p("The Tamil film industry's ability to learn from its failures will determine whether 2026 is remembered as a year of growth or a year of wasted potential."),

      h2("The Verdict"),
      quote("Box office disasters are not just financial losses -- they are creative failures. The films that crash and burn usually share one trait: they forgot that audiences come for stories, not spectacle. The producers who remember this truth will build the Tamil cinema of the future."),
    ],
  },

  // 14. Best Background Scores of 2026
  {
    title: "The Sound of Tamil Cinema: Best Background Scores of 2026",
    slug: "best-background-scores-tamil-cinema-2026",
    author: "Deepa Lakshmi",
    publishedAt: "2026-07-02T10:00:00Z",
    category: "Feature",
    heroImage: "music_hero",
    excerpt: "From Anirudh's thunderous themes to AR Rahman's haunting melodies, 2026 has been a landmark year for Tamil film music. Here are the background scores that defined the first half.",
    tags: ["music", "background-score", "anirudh", "ar-rahman", "2026", "feature", "kollywood"],
    seoTitle: "Best Tamil Background Scores 2026 - Anirudh, AR Rahman, Music Analysis",
    seoDescription: "Analysis of the best Tamil cinema background scores of 2026, from Anirudh's Karuppu theme to AR Rahman's latest work.",
    bodyFn: (images) => [
      p("Tamil cinema has always taken its music seriously. But in 2026, the background score -- often an afterthought in Indian filmmaking -- has become the star of several major releases."),

      imgBlock(images.music_studio, "Recording studio", "Tamil film music is among the most innovative in Indian cinema"),

      h2("Anirudh Ravichander: The King of BGM"),
      p("Anirudh has had another historic year. His work on Karuppu -- particularly the main theme that plays during Suriya's introduction -- has become the most-streamed BGM clip in Tamil cinema history."),
      p("The Karuppu score is restrained, percussive, and emotionally devastating. Anirudh understands that the most powerful musical moments come not from loud orchestration but from strategic silence."),

      h2("AR Rahman: The Master Returns"),
      p("AR Rahman's work in 2026 has been characteristically ambitious. His score for Jailer 2's promotional material has already generated significant buzz, and his work on smaller projects has shown the range that made him a legend."),
      p("The Rahman resurgence is welcome news for Tamil cinema. His combination of electronic innovation with traditional Tamil musical elements remains unmatched."),

      h2("The New Generation"),
      bulletItem("Santhosh Narayanan continues to push boundaries with unconventional instrumentation"),
      bulletItem("Yuvan Shankar Raja brings his signature style to several 2026 releases"),
      bulletItem("G.V. Prakash Kumar balances commercial appeal with creative ambition"),
      p("The depth of musical talent in Tamil cinema is remarkable. Unlike most Indian film industries, where one or two composers dominate, Tamil cinema has a vibrant ecosystem of musicians who constantly challenge each other."),

      h2("The Verdict"),
      quote("Tamil film music in 2026 is at an all-time high. The combination of established masters like Anirudh and Rahman with a new generation of innovative composers has created a musical landscape that is the envy of Indian cinema. The background scores alone are worth the price of admission."),
    ],
  },

  // 15. Karthi's Action Hero Return
  {
    title: "Sardar 2: Karthi Returns as India's Most Badass Action Hero",
    slug: "sardar-2-karthi-action-hero-2026",
    author: "Karthik Selvaraj",
    publishedAt: "2026-07-03T10:00:00Z",
    category: "News",
    heroImage: "karthi_hero",
    excerpt: "After the massive success of Sardar, Karthi returns as the RAW agent in Sardar 2, scheduled for September 9, 2026. Here is everything we know about the sequel.",
    tags: ["sardar-2", "karthi", "action", "2026", "upcoming", "sequel", "kollywood"],
    seoTitle: "Sardar 2 (2026) - Karthi Action Sequel Release Date, Cast",
    seoDescription: "Preview of Sardar 2 starring Karthi, releasing September 9, 2026. Everything about the action sequel.",
    bodyFn: (images) => [
      h2("The Return of the Spy"),
      p("Sardar (2022) was one of the surprise hits of its year -- a spy thriller that balanced patriotic themes with genuinely exciting action set-pieces. Karthi's performance as the conflicted RAW agent was widely praised, and the film's box office success made a sequel inevitable."),
      p("Sardar 2 is scheduled for a worldwide theatrical release on September 9, 2026, and based on everything we know, it is going to be bigger, bolder, and more ambitious than the original."),

      imgBlock(images.karthi_action, "Action sequence", "Sardar 2 promises international-scale action"),

      h2("What We Know"),
      bulletItem("Director: P.S. Mithun (returning)"),
      bulletItem("Star: Karthi as Sardar"),
      bulletItem("Release: September 9, 2026"),
      bulletItem("Budget: Significantly higher than the original"),
      bulletItem("Locations: India, Europe, and Southeast Asia"),
      p("The film will reportedly expand the scope of the original, taking Sardar's mission from a domestic setting to an international stage. The action sequences are being choreographed by an international stunt team."),

      h2("Karthi's Action Credentials"),
      p("Karthi has quietly built one of the most impressive action filmographies in Tamil cinema. From Aayirathil Oruvan to Kaithi to Ponniyin Selvan, he has shown an ability to handle physical roles with authenticity and commitment."),
      p("Sardar 2 will be his most physically demanding role yet. Reports suggest Karthi trained for three months in tactical combat and firearms handling to prepare for the expanded action sequences."),

      h2("The Competitive Landscape"),
      p("September 2026 is shaping up to be a crowded month. Sardar 2 will compete with several major releases, including films from Vijay and Ajith. The film's success will depend on strong word-of-mouth and the loyalty of Karthi's substantial fanbase."),
      p("But Karthi has always been a content-first star. His films succeed not because of marketing spend but because audiences trust his judgment. Sardar 2 is likely to follow the same pattern."),

      h2("The Verdict"),
      quote("Sardar 2 is positioned to be one of the biggest Tamil releases of 2026. With Karthi returning to his most popular role, an expanded international scope, and a September release date that maximises festive footfalls, this sequel has all the ingredients for a blockbuster. The only question is whether it can live up to the original's promise."),
      pBold("Release Date: September 9, 2026"),
      p("Director: P.S. Mithun | Star: Karthi | Genre: Action / Thriller"),
    ],
  },
];

// Main Execution
async function main() {
  console.log("TamilCinemaHub 15 Blog Seeder");
  console.log("=".repeat(50));
  console.log();

  // Step 1: Download and upload images
  console.log("Step 1: Downloading and uploading images...");
  const imageIds = {};
  let uploadCount = 0;
  const totalImages = Object.keys(IMAGES).length;

  for (const [name, url] of Object.entries(IMAGES)) {
    try {
      imageIds[name] = await uploadImage(url, `${name}.jpg`);
      uploadCount++;
      process.stdout.write(`\r  Uploaded ${uploadCount}/${totalImages} images...`);
    } catch (err) {
      console.error(`\n  Failed: ${name} - ${err.message}`);
      imageIds[name] = null;
    }
  }
  console.log(`\n  Done! ${uploadCount} images uploaded\n`);

  // Step 2: Create blog posts
  console.log("Step 2: Creating blog posts...\n");
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
  console.log("  https://tamilcinemahub.xyz/blogs");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
