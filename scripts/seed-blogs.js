/**
 * Seed Tamil Cinema Blog Posts into Sanity CMS
 *
 * Usage:
 *   SANITY_AUTH_TOKEN=your_token node scripts/seed-blogs.js
 *
 * Get your token from: https://sanity.io/manage → project → API → Tokens
 * Token needs "Editor" permissions (read + write).
 */

const { createClient } = require('@sanity/client')
const crypto = require('crypto')

const client = createClient({
  projectId: 'od67iigb',
  dataset: 'production',
  apiVersion: '2026-05-30',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

// Helper: create a slug from a title
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Helper: create Sanity Portable Text block
function p(text) {
  return {
    _type: 'block',
    _key: crypto.randomBytes(8).toString('hex'),
    style: 'normal',
    children: [{ _type: 'span', _key: crypto.randomBytes(8).toString('hex'), text }],
  }
}

function h2(text) {
  return {
    _type: 'block',
    _key: crypto.randomBytes(8).toString('hex'),
    style: 'h2',
    children: [{ _type: 'span', _key: crypto.randomBytes(8).toString('hex'), text }],
  }
}

function h3(text) {
  return {
    _type: 'block',
    _key: crypto.randomBytes(8).toString('hex'),
    style: 'h3',
    children: [{ _type: 'span', _key: crypto.randomBytes(8).toString('hex'), text }],
  }
}

function quote(text) {
  return {
    _type: 'block',
    _key: crypto.randomBytes(8).toString('hex'),
    style: 'blockquote',
    children: [{ _type: 'span', _key: crypto.randomBytes(8).toString('hex'), text }],
  }
}

// ── Blog Posts ────────────────────────────────────────────────────────────────

const blogPosts = [
  // ─── 1. Coolie Review ───────────────────────────────────────────────────
  {
    title: 'Coolie Movie Review: Rajinikanth Delivers the Biggest Blockbuster of 2025',
    slug: { current: 'coolie-movie-review-rajinikanth-2025' },
    author: 'Karthik S',
    publishedAt: '2025-12-15T10:00:00Z',
    category: 'Review',
    excerpt:
      'Lokesh Kanagaraj teams up with the Superstar for a high-octane action spectacle that shattered every box office record. Here is why Coolie is the definitive Tamil blockbuster of the decade.',
    body: [
      h2('The Hype Was Real'),
      p(
        'When Lokesh Kanagaraj was announced as the director of Rajinikanth\'s next film, the entire Indian film industry held its breath. The man who built the Lokesh Cinematic Universe (LCU) with Kaithi and Vikram was now directing the biggest star in Indian cinema. Coolie does not just meet those expectations — it obliterates them.'
      ),
      p(
        'From the opening frame, Lokesh\'s signature kinetic energy is on full display. The camera rarely sits still, the editing is razor-sharp, and every action set-piece feels like it was choreographed by someone who genuinely understands the pulse of mass cinema. This is not mindless action — it is action with intention.'
      ),
      h2('Rajinikanth at His Absolute Peak'),
      p(
        'At 75 years old, Rajinikanth moves, speaks, and dominates the screen with the energy of a man half his age. The Superstar delivers a performance that reminds you exactly why he is called the Superstar. There is a scene in the second half where he walks into a room full of enemies, adjusts his sunglasses, and delivers a single dialogue that brought the entire theatre to its feet. No特效, no VFX — just pure, unadulterated Rajini swag.'
      ),
      p(
        'But what makes Coolie special is that Lokesh does not just use Rajini as a mass machine. There are quiet, vulnerable moments that reveal the character beneath the legend. One particular scene with Nagarjuna — two titans of Indian cinema sharing screen space for the first time — is worth the ticket price alone.'
      ),
      h2('The Ensemble Cast Shines'),
      p(
        'Nagarjuna is menacingly good as the antagonist, bringing a gravitas that matches Rajini step for step. Upendra brings unexpected depth to his role, and Soubin Shahir provides moments of genuine humour that break the tension beautifully. The casting across multiple languages — Tamil, Telugu, Kannada, Malayalam — makes this a truly pan-Indian experience without feeling forced.'
      ),
      h2('Technical Brilliance'),
      p(
        'Anirudh Ravichander\'s background score is an absolute banger. The themes he weaves for each character add layers that the screenplay only hints at. Girish Gangadharan\'s cinematography captures the scale of the film while maintaining intimacy in the quieter moments. The production design is world-class — every frame looks like it belongs in a ₹500-crore film.'
      ),
      h2('The Box Office Numbers Speak'),
      p(
        'Coolie grossed between ₹514 and ₹675 crore worldwide, making it the highest-grossing Tamil film of 2025 and one of the highest-grossing Indian films ever. The numbers are staggering, but what matters more is the cultural impact. Coolie is the kind of film that brings families to theatres, that gets dialogue references in political speeches, and that will be remembered for years.'
      ),
      h2('Verdict: A Landmark in Tamil Cinema'),
      p(
        'Coolie is not a perfect film — the second act drags slightly, and a few subplots could have been tighter. But these are minor complaints in what is otherwise a magnificent piece of commercial filmmaking. Lokesh Kanagaraj has proven that he can handle the biggest stars and the biggest budgets without losing his creative voice.'
      ),
      quote('Rating: ★★★★½ out of 5 — A must-watch theatrical experience that reminds you why cinema exists.'),
    ],
    seoTitle: 'Coolie Movie Review (2025) — Rajinikanth & Lokesh Kanagaraj Blockbuster',
    seoDescription:
      'Read our in-depth review of Coolie (2025), starring Rajinikanth and directed by Lokesh Kanagaraj. The highest-grossing Tamil film of 2025 reviewed.',
    tags: ['coolie', 'rajinikanth', 'lokanagaraj', 'kollywood', 'blockbuster', 'review', '2025'],
  },

  // ─── 2. Thug Life Review ────────────────────────────────────────────────
  {
    title: 'Thug Life Review: Mani Ratnam and Kamal Haasan Reunite — Does It Deliver?',
    slug: { current: 'thug-life-review-mani-ratnam-kamal-haasan' },
    author: 'Priya R',
    publishedAt: '2025-11-20T10:00:00Z',
    category: 'Review',
    excerpt:
      'The reunion of Mani Ratnam and Kamal Haasan — decades after Nayakan — was the most anticipated event in Tamil cinema. Thug Life is ambitious, visually stunning, and deeply polarising.',
    body: [
      h2('A Reunion Decades in the Making'),
      p(
        'When Mani Ratnam and Kamal Haasan announced their next collaboration, Tamil cinema collectively lost its mind. Nayakan (1987) is not just a film — it is a cultural artefact, consistently ranked among the greatest Indian films ever made. Recreating that magic was always going to be an impossible task. To Mani Ratnam\'s credit, he does not try to recreate it. Thug Life is its own beast entirely.'
      ),
      p(
        'Set against the backdrop of the Tamil Nadu underworld spanning three decades, Thug Life follows the rise, fall, and redemption of a man caught between loyalty and survival. It is ambitious storytelling that demands your full attention — this is not a film you can watch while scrolling your phone.'
      ),
      h2('Kamal Haasan: The Actor\'s Actor'),
      p(
        'Kamal Haasan delivers a performance that is, frankly, frightening in its intensity. At 70, he brings a rawness and physicality that younger actors would struggle to match. The ageing makeup is extraordinary — you genuinely believe you are watching the same man across three decades. One scene in particular, a silent confrontation with Silambarasan, contains more acting than most entire films.'
      ),
      p(
        'But it is the vulnerability that stays with you. Beneath the gangster bravado, Kamal reveals a man haunted by choices he cannot undo. It is the kind of performance that reminds you why he is called Ulaganayagan.'
      ),
      h2('The Mani Ratnam Touch'),
      p(
        'Visually, Thug Life is breathtaking. Ravi K. Chandran\'s cinematography is painterly — every frame could be a still photograph. The use of colour to denote different time periods is subtle but effective, and the action sequences are staged with the precision of a ballet.'
      ),
      p(
        'AR Rahman\'s score is haunting and melancholic, perfectly complementing the film\'s themes of loss and regret. The song "Karuppu" has already become an anthem, with its haunting melody and lyrics that cut deep.'
      ),
      h2('Where It Divides'),
      p(
        'Thug Life is not for everyone. The pacing is deliberately slow, the narrative jumps between timelines without explicit markers, and the emotional payoff comes much later than mainstream audiences might expect. Some viewers will find this pretentious; others will find it masterful. The truth, as always with Mani Ratnam, lies somewhere in between.'
      ),
      p(
        'Silambarasan delivers a solid supporting performance, and Trisha brings warmth to a role that could have been one-dimensional. But make no mistake — this is Kamal and Mani Ratnam\'s show.'
      ),
      h2('Verdict: Ambitious, Flawed, Unforgettable'),
      p(
        'Thug Life grossed approximately ₹97 crore — a respectable figure but below the blockbuster threshold. Commercially, it underperformed relative to expectations. Artistically, however, it is one of the most significant Tamil films of 2025. It is the kind of film that grows on you with every rewatch, revealing new layers each time.'
      ),
      quote('Rating: ★★★★ out of 5 — Not a crowd-pleaser, but a film that demands to be taken seriously. A reunion that was worth the wait.'),
    ],
    seoTitle: 'Thug Life Movie Review (2025) — Mani Ratnam & Kamal Haasan Reunion',
    seoDescription:
      'In-depth review of Thug Life (2025), directed by Mani Ratnam and starring Kamal Haasan. A polarising but artistically significant gangster drama.',
    tags: ['thug-life', 'kamal-haasan', 'mani-ratnam', 'review', 'kollywood', '2025'],
  },

  // ─── 3. Top 10 Tamil Movies of 2025 ─────────────────────────────────────
  {
    title: 'Top 10 Tamil Movies of 2025: The Films That Defined Kollywood This Year',
    slug: { current: 'top-10-tamil-movies-2025' },
    author: 'Vikram M',
    publishedAt: '2025-12-28T10:00:00Z',
    category: 'Top List',
    excerpt:
      'From Rajinikanth\'s Coolie to newcomer breakouts, 2025 was a year of massive blockbusters and surprising gems. Here are the 10 Tamil films you absolutely cannot miss.',
    body: [
      h2('A Year of Extremes'),
      p(
        '2025 was the year Tamil cinema released 285 films — a staggering number that reflects both the industry\'s creative energy and its oversaturation problem. Among the noise, however, stood films that reminded us why Kollywood remains one of the most dynamic film industries in the world. Here are our top 10 picks.'
      ),
      h3('1. Coolie (Dir: Lokesh Kanagaraj)'),
      p(
        'The undisputed king of 2025. Rajinikanth + Lokesh Kanagaraj = the highest-grossing Tamil film of the year at ₹514–675 crore worldwide. A pan-Indian action spectacle that delivered on every front.'
      ),
      h3('2. Thug Life (Dir: Mani Ratnam)'),
      p(
        'The legendary Mani Ratnam–Kamal Haasan reunion. Polarising but artistically significant, Thug Life is a gangster epic that demands multiple viewings. Not for the casual viewer — but unforgettable for those who commit.'
      ),
      h3('3. Good Bad Ugly (Dir: Adhik Ravichandran)'),
      p(
        'Ajith Kumar\'s charisma meets Adhik Ravichandran\'s wild tonal shifts in a dark comedy-action hybrid that grossed ₹200–248 crore. The film\'s unpredictability is its greatest strength — you genuinely never know what\'s coming next.'
      ),
      h3('4. Dragon (Dir: Ashwath Marimuthu)'),
      p(
        'The breakout hit of the year. Pradeep Ranganathan proved he is a bankable hero, grossing ₹150 crore with a film that perfectly blended Gen-Z humour with mass entertainer energy. A turning point for what a "mass" film can be.'
      ),
      h3('5. Vidaamuyarchi (Dir: Magizh Thirumeni)'),
      p(
        'Ajith Kumar\'s second entry on this list, and deservedly so. Vidaamuyarchi is a taut, gripping thriller that showcased Ajith\'s range. Thirumeni\'s tight screenplay and controlled pacing made this one of the most satisfying theatrical experiences of 2025.'
      ),
      h3('6. Kuberaa (Dir: Sekhar Kammula)'),
      p(
        'Dhanush teams up with Telugu director Sekhar Kammula in a multilingual film that grossed ₹115–132 crore. A landmark for cross-industry collaboration, with Dhanush delivering yet another powerhouse performance.'
      ),
      h3('7. Maaman (Dir: Prabhu Solomon)'),
      p(
        'The sleeper hit of the year. A small-budget emotional drama that proved content is king. Maaman made audiences laugh and cry in equal measure, and its profitability-to-budget ratio was the best in Kollywood.'
      ),
      h3('8. Maharaja (Dir: Nithilan Saminathan)'),
      p(
        'Vijay Sethupathi in a revenge thriller that kept audiences on the edge of their seats. Smart writing and a genuinely shocking twist made Maharaja one of the most talked-about films of the year.'
      ),
      h3('9. Amaran (Dir: Rajkumar Periasamy)'),
      p(
        'Sivakarthikeyan delivered a career-best performance in this military drama based on a true story. Emotional, patriotic, and surprisingly restrained for a big-hero film. A film that stayed with you long after the credits.'
      ),
      h3('10. Kanguva (Dir: Siruthai Siva)'),
      p(
        'Despite mixed reviews, Kanguva\'s ambition cannot be denied. A period action epic with stunning visuals and Suriya in a dual role, it pushed the boundaries of what Tamil cinema can attempt on a technical level.'
      ),
      h2('Honourable Mentions'),
      p(
        'Vaadivaasal, Demonte Colony 2, and Lover all deserve recognition for pushing creative boundaries in their respective genres. 2025 was a tough year to crack the top 10 — which says a lot about the depth of talent in Kollywood right now.'
      ),
      quote('Which Tamil film was YOUR favourite of 2025? Let us know in the comments!'),
    ],
    seoTitle: 'Top 10 Tamil Movies of 2025 — Best Kollywood Films Ranked',
    seoDescription:
      'Our definitive ranking of the top 10 Tamil movies of 2025, from Coolie to Dragon. The best Kollywood films you need to watch.',
    tags: ['top-10', 'best-tamil-movies', '2025', 'kollywood', 'blockbuster', 'list'],
  },

  // ─── 4. Vijay's Last Film ───────────────────────────────────────────────
  {
    title: 'Thalapathy Vijay\'s Jananayagan: Why His Final Film Is the Most Emotional Event in Tamil Cinema',
    slug: { current: 'thalapathy-vijay-jananayagan-final-film' },
    author: 'Deepa L',
    publishedAt: '2026-01-10T10:00:00Z',
    category: 'News',
    excerpt:
      'The end of an era. Vijay — one of Tamil cinema\'s biggest superstars — is leaving acting for politics. His final film Jananayagan promises to be the most emotionally charged theatrical event in Kollywood history.',
    body: [
      h2('The End of an Era'),
      p(
        'For over three decades, Thalapathy Vijay has been more than an actor to Tamil audiences. He has been a cultural phenomenon — the man whose films open to ₹50-crore第一天, whose dialogues become political slogans, whose dance moves a generation tries to replicate. Now, he is walking away from it all. And his final film, Jananayagan, is shaping up to be the most emotionally significant Tamil film event in recent memory.'
      ),
      h2('From Ilayaraja to Politics'),
      p(
        'Joseph Vijay Chandrasekhar debuted as a child actor in 1984\'s Naalaiya Theerpu and has since delivered over 70 films as a lead actor. Along the way, he transformed from a fresh-faced newcomer into one of the three pillars of Tamil cinema — alongside Rajinikanth and Kamal Haasan.'
      ),
      p(
        'His decision to enter politics and contest elections is not entirely surprising — his father, S.A. Chandrasekhar, has long been involved in political commentary. But the finality of it — this IS the last film — has hit fans hard.'
      ),
      h2('What We Know About Jananayagan'),
      p(
        'Details about Jananayagan are being guarded closely, but here is what we know: the film is directed by a major Tamil filmmaker, features an ensemble cast, and is described as a "mass entertainer with substance." Given that this is Vijay\'s farewell to cinema, expectations are astronomical.'
      ),
      p(
        'Industry insiders suggest the film will be a celebration of Vijay\'s career — a greatest hits of his iconic style, dialogue delivery, and dance moves. If done right, this could be the highest-grossing Indian film of 2026.'
      ),
      h2('The Fan Reaction'),
      p(
        'Vijay\'s fan clubs — among the most organised and passionate in Indian cinema — have already begun planning massive celebrations. Theatre owners across Tamil Nadu are preparing for unprecedented advance booking demand. Social media is flooded with tribute videos, career retrospectives, and emotional posts from fans who grew up watching him.'
      ),
      p(
        'The emotional weight of a superstar\'s final film cannot be understated. When Rajinikanth announced his retirement (which he later reversed), theatres were flooded with tearful fans. Jananayagan will likely amplify that energy tenfold.'
      ),
      h2('A Cultural Moment'),
      p(
        'Jananayagan is not just a film — it is a cultural moment. It represents the end of one of the most successful careers in Indian cinema and the beginning of a new chapter in Tamil Nadu\'s political landscape. Whether you are a Vijay fan or not, the significance of this event is impossible to ignore.'
      ),
      quote('The question is not whether Jananayagan will be a blockbuster — it will. The question is whether it can capture the emotions of millions who grew up watching Thalapathy. We believe it will.'),
    ],
    seoTitle: 'Thalapathy Vijay\'s Last Film Jananayagan (2026) — Everything We Know',
    seoDescription:
      'Everything about Thalapathy Vijay\'s final film Jananayagan. Why this is the most emotional event in Tamil cinema history.',
    tags: ['vijay', 'thalapathy', 'jananayagan', '2026', 'news', 'kollywood', 'politics'],
  },

  // ─── 5. Director Spotlight: Lokesh Kanagaraj ────────────────────────────
  {
    title: 'Director Spotlight: How Lokesh Kanagaraj Became the Biggest Filmmaker in Tamil Cinema',
    slug: { current: 'lokesh-kanagaraj-director-spotlight' },
    author: 'Arun T',
    publishedAt: '2025-12-01T10:00:00Z',
    category: 'Director',
    excerpt:
      'From Kaithi to Coolie, the rise of Lokesh Kanagaraj is one of the most remarkable stories in Indian cinema. Here is how a short-film filmmaker became the architect of Tamil cinema\'s biggest universe.',
    body: [
      h2('The Unlikely Auteur'),
      p(
        'In 2019, a relatively unknown Tamil filmmaker released a film about a ex-convict trying to reunite with his daughter over a single night. Kaithi was made on a modest budget of ₹25 crore, starred no traditional heroes, and had zero songs. It became one of the biggest sleeper hits in Tamil cinema history.'
      ),
      p(
        'That filmmaker was Lokesh Kanagaraj, and Kaithi was just the beginning.'
      ),
      h2('Building the LCU'),
      p(
        'What Lokesh did next was unprecedented in Indian cinema — he built a cinematic universe. Vikram (2022), starring Kamal Haasan, connected directly to Kaithi and introduced a web of characters, timelines, and criminal organisations that span multiple films.'
      ),
      p(
        'The Lokesh Cinematic Universe (LCU) is India\'s answer to the MCU, but grittier, more grounded, and deeply rooted in Tamil Nadu\'s criminal underworld. It proved that Indian cinema could sustain long-form storytelling across multiple films — something that was previously thought to be a Hollywood-only concept.'
      ),
      h2('The Coolie Triumph'),
      p(
        'Coolie was the ultimate test: could Lokesh handle the biggest star in Indian cinema without compromising his vision? The answer was a resounding yes. The film grossed ₹514–675 crore worldwide, making it the highest-grossing Tamil film of 2025 and one of the highest-grossing Indian films ever.'
      ),
      p(
        'More importantly, Lokesh delivered a Rajinikanth film that felt fresh, modern, and exciting while still delivering every ounce of Superstar swag that fans crave. It was a masterclass in balancing auteur vision with commercial appeal.'
      ),
      h2('The Lokesh Style'),
      p(
        'What makes a Lokesh Kanagaraj film feel like a Lokesh Kanagaraj film? Several signature elements:'
      ),
      p(
        'Non-linear storytelling that trusts the audience to connect the dots. Tight, muscular screenplays with zero fat. Long, unbroken action sequences that feel visceral and real. Soundtracks that become cultural phenomena (courtesy Anirudh Ravichander). Characters who feel lived-in, not constructed. A deep respect for genre conventions — even as he subverts them.'
      ),
      h2('What is Next?'),
      p(
        'With Kaithi 2 confirmed and the LCU continuing to expand, Lokesh Kanagaraj is now the most in-demand director in Indian cinema. Every major star wants to work with him, every studio wants to fund him, and every fan wants to see what he does next.'
      ),
      p(
        'From making short films on YouTube to directing the biggest blockbusters in Indian cinema, Lokesh Kanagaraj\'s journey is a reminder that talent, vision, and persistence can take you anywhere.'
      ),
      quote('Lokesh Kanagaraj did not just make films — he created a universe. And Tamil cinema is richer for it.'),
    ],
    seoTitle: 'Lokesh Kanagaraj — From Kaithi to Coolie: The Rise of Tamil Cinema\'s Biggest Director',
    seoDescription:
      'The rise of Lokesh Kanagaraj, from short films to directing Rajinikanth in Coolie. How he built the LCU and became Kollywood\'s biggest filmmaker.',
    tags: ['lokesh-kanagaraj', 'director', 'luc', 'kaithi', 'coolie', 'vikram', 'kollywood'],
  },

  // ─── 6. Top 5 Career Performances ───────────────────────────────────────
  {
    title: '5 Career-Best Performances in Tamil Cinema That Every Fan Should Watch',
    slug: { current: 'career-best-performances-tamil-cinema' },
    author: 'Meena K',
    publishedAt: '2025-11-05T10:00:00Z',
    category: 'Actor',
    excerpt:
      'From Kamal Haasan\'s transformative roles to Vijay Sethupathi\'s fearless choices — these 5 performances represent the absolute pinnacle of Tamil cinema acting.',
    body: [
      h2('The Art of Performance in Tamil Cinema'),
      p(
        'Tamil cinema has a rich tradition of extraordinary performances. While the industry is often associated with larger-than-life mass entertainers, it has also produced some of the most nuanced, committed acting in all of Indian cinema. Here are 5 career-best performances that every film lover should experience.'
      ),
      h3('1. Kamal Haasan — Nayakan (1987)'),
      p(
        'Decades before method acting became a buzzword in Indian cinema, Kamal Haasan was doing it in Nayakan. His transformation from a young man witnessing his father\'s murder to a powerful underworld don spans three decades of a character\'s life, and Kamal inhabits every stage with frightening authenticity.'
      ),
      p(
        'The scene where he sits silently after learning of his friend\'s betrayal contains more emotional depth than most entire performances. Mani Ratnam\'s direction gives Kamal the space to breathe, and the result is one of the greatest performances in Asian cinema — period.'
      ),
      h3('2. Vijay Sethupathi — Super Deluxe (2019)'),
      p(
        'Super Deluxe asked Vijay Sethupathi to play a transgender woman returning to her family after a sex-change operation. In an industry where male actors rarely take such risks, Sethupathi committed fully — physically, emotionally, and vocally.'
      ),
      p(
        'His performance transcends the shock value of the premise. Shilpa, as he is known in the film, is tender, vulnerable, and ultimately triumphant. It is the kind of role that changes how audiences see an actor forever. Sethupathi proved he is not just a "Makkal Selvan" (people\'s treasure) — he is one of India\'s finest actors.'
      ),
      h3('3. Dhanush — Asuran (2019)'),
      p(
        'Asuran was the film that showed the world what Dhanush fans already knew — he is a force of nature. Playing a father protecting his family from caste-based violence, Dhanush delivers a performance that is simultaneously explosive and deeply restrained.'
      ),
      p(
        'The contrast between his quiet, stoic moments with his son and his ferocious rage when pushed to the edge is electrifying. Vetrimaaran\'s direction and Dhanush\'s performance together create a film that is both commercially satisfying and artistically significant.'
      ),
      h3('4. Suriya — Pithamagan (2003)'),
      p(
        'Long before he was a superstar, Suriya delivered one of Tamil cinema\'s most memorable supporting performances in Pithamagan. His portrayal of a naive young man caught in a world of violence is heartbreaking in its simplicity.'
      ),
      p(
        'Working alongside the legendary Vikram, Suriya more than holds his own. It is a performance that announced his arrival as a serious actor — not just a star, but someone with genuine dramatic range.'
      ),
      h3('5. Trisha Krishnan — 96 (2018)'),
      p(
        'Often overlooked in "best performance" lists, Trisha\'s work in 96 is a masterclass in subtlety. Playing a woman reconnecting with her college sweetheart after 22 years, Trisha conveys decades of emotion — regret, nostalgia, love, maturity — through the smallest gestures.'
      ),
      p(
        'The way she looks at Vijay Sethupathi\'s Ram during their class reunion scene, the slight tremor in her voice when she talks about her marriage, the tears she holds back during their final meeting — Trisha proves that great acting is not about big scenes but about the moments in between.'
      ),
      h2('Honourable Mentions'),
      p(
        'Prakash Raj in Nayagan. Nasser in Thevar Magan. Parthiban in Pudhiya Paathai. Jyothika in Mozhu. Simran in Vaali. Tamil cinema\'s history of extraordinary performances could fill an entire book.'
      ),
      quote('Great performances do not just entertain — they transform how we see the world. These 5 performances did exactly that.'),
    ],
    seoTitle: '5 Career-Best Performances in Tamil Cinema — Kamal, Vijay Sethupathi, Dhanush',
    seoDescription:
      'Explore the 5 greatest career-best performances in Tamil cinema history, from Kamal Haasan in Nayakan to Vijay Sethupathi in Super Deluxe.',
    tags: ['best-performances', 'kamal-haasan', 'vijay-sethupathi', 'dhanush', 'actors', 'kollywood'],
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  if (!process.env.SANITY_AUTH_TOKEN) {
    console.error('❌ Missing SANITY_AUTH_TOKEN environment variable!')
    console.error('')
    console.error('To get a token:')
    console.error('1. Go to https://sanity.io/manage')
    console.error('2. Select your project (od67iigb)')
    console.error('3. Go to API → Tokens → Create Token')
    console.error('4. Choose "Editor" permissions')
    console.error('5. Copy the token')
    console.error('')
    console.error('Then run:')
    console.error('  SANITY_AUTH_TOKEN=your_token_here node scripts/seed-blogs.js')
    process.exit(1)
  }

  console.log('🎬 Seeding Tamil Cinema blog posts into Sanity...')
  console.log(`   Project: od67iigb | Dataset: production`)
  console.log(`   Posts to create: ${blogPosts.length}`)
  console.log('')

  let created = 0
  const results = []

  for (const post of blogPosts) {
    try {
      // Check if post already exists by slug
      const existing = await client.fetch(
        `count(*[_type == "blog" && slug.current == $slug])`,
        { slug: post.slug.current }
      )

      if (existing > 0) {
        console.log(`⏭  Skipping (already exists): ${post.title}`)
        continue
      }

      const doc = {
        _type: 'blog',
        ...post,
      }

      results.push(client.create(doc))
      console.log(`✅ Queued: ${post.title}`)
      created++
    } catch (err) {
      console.error(`❌ Failed: ${post.title}`)
      console.error(`   ${err.message}`)
    }
  }

  // Wait for all creations to complete
  await Promise.all(results)

  console.log('')
  console.log(`🎉 Done! Created ${created} blog posts.`)
  console.log('')
  console.log('Verify at:')
  console.log('  https://tamilcinema-website.vercel.app/blogs')
  console.log('  https://tamilcinema-website.vercel.app/')
  console.log('')
  console.log('Blog posts created:')
  for (const post of blogPosts) {
    console.log(`  📝 ${post.category}: ${post.title}`)
  }
}

seed().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
