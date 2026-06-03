#!/usr/bin/env node
/**
 * Generate NDJSON file for Sanity blog import.
 * Run: node scripts/generate-ndjson.js > /tmp/blogs.ndjson
 */

const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

function key() { return crypto.randomBytes(8).toString('hex') }

function p(text) {
  return { _type: 'block', _key: key(), style: 'normal', children: [{ _type: 'span', _key: key(), text }] }
}
function h2(text) {
  return { _type: 'block', _key: key(), style: 'h2', children: [{ _type: 'span', _key: key(), text }] }
}
function h3(text) {
  return { _type: 'block', _key: key(), style: 'h3', children: [{ _type: 'span', _key: key(), text }] }
}
function quote(text) {
  return { _type: 'block', _key: key(), style: 'blockquote', children: [{ _type: 'span', _key: key(), text }] }
}

const posts = [
  {
    title: 'Coolie Movie Review: Rajinikanth Delivers the Biggest Blockbuster of 2025',
    slug: 'coolie-movie-review-rajinikanth-2025',
    author: 'Karthik S',
    publishedAt: '2025-12-15T10:00:00Z',
    category: 'Review',
    excerpt: 'Lokesh Kanagaraj teams up with the Superstar for a high-octane action spectacle that shattered every box office record. Here is why Coolie is the definitive Tamil blockbuster of the decade.',
    body: [
      h2('The Hype Was Real'),
      p('When Lokesh Kanagaraj was announced as the director of Rajinikanth\'s next film, the entire Indian film industry held its breath. The man who built the Lokesh Cinematic Universe (LCU) with Kaithi and Vikram was now directing the biggest star in Indian cinema. Coolie does not just meet those expectations — it obliterates them.'),
      p('From the opening frame, Lokesh\'s signature kinetic energy is on full display. The camera rarely sits still, the editing is razor-sharp, and every action set-piece feels choreographed by someone who genuinely understands the pulse of mass cinema.'),
      h2('Rajinikanth at His Absolute Peak'),
      p('At 75 years old, Rajinikanth moves, speaks, and dominates the screen with the energy of a man half his age. There is a scene in the second half where he walks into a room full of enemies, adjusts his sunglasses, and delivers a single dialogue that brought the entire theatre to its feet. No VFX — just pure, unadulterated Rajini swag.'),
      p('But what makes Coolie special is that Lokesh does not just use Rajini as a mass machine. There are quiet, vulnerable moments that reveal the character beneath the legend. One particular scene with Nagarjuna — two titans of Indian cinema sharing screen space for the first time — is worth the ticket price alone.'),
      h2('The Ensemble Cast Shines'),
      p('Nagarjuna is menacingly good as the antagonist, bringing a gravitas that matches Rajini step for step. Upendra brings unexpected depth to his role, and Soubin Shahir provides moments of genuine humour that break the tension beautifully. The casting across multiple languages makes this a truly pan-Indian experience without feeling forced.'),
      h2('Technical Brilliance'),
      p('Anirudh Ravichander\'s background score is an absolute banger. Girish Gangadharan\'s cinematography captures the scale of the film while maintaining intimacy in the quieter moments. The production design is world-class — every frame looks like it belongs in a 500-crore film.'),
      h2('The Box Office Numbers Speak'),
      p('Coolie grossed between 514 and 675 crore worldwide, making it the highest-grossing Tamil film of 2025 and one of the highest-grossing Indian films ever. The numbers are staggering, but what matters more is the cultural impact. Coolie brings families to theatres and gets dialogue references in political speeches.'),
      h2('Verdict: A Landmark in Tamil Cinema'),
      p('Coolie is not a perfect film — the second act drags slightly, and a few subplots could have been tighter. But these are minor complaints in what is otherwise a magnificent piece of commercial filmmaking.'),
      quote('Rating: 4.5 out of 5 — A must-watch theatrical experience that reminds you why cinema exists.'),
    ],
    seoTitle: 'Coolie Movie Review (2025) — Rajinikanth & Lokesh Kanagaraj Blockbuster',
    seoDescription: 'Read our in-depth review of Coolie (2025), starring Rajinikanth and directed by Lokesh Kanagaraj. The highest-grossing Tamil film of 2025.',
    tags: ['coolie', 'rajinikanth', 'lokanagaraj', 'kollywood', 'blockbuster', 'review', '2025'],
  },
  {
    title: 'Thug Life Review: Mani Ratnam and Kamal Haasan Reunite — Does It Deliver?',
    slug: 'thug-life-review-mani-ratnam-kamal-haasan',
    author: 'Priya R',
    publishedAt: '2025-11-20T10:00:00Z',
    category: 'Review',
    excerpt: 'The reunion of Mani Ratnam and Kamal Haasan — decades after Nayakan — was the most anticipated event in Tamil cinema. Thug Life is ambitious, visually stunning, and deeply polarising.',
    body: [
      h2('A Reunion Decades in the Making'),
      p('When Mani Ratnam and Kamal Haasan announced their next collaboration, Tamil cinema collectively lost its mind. Nayakan is not just a film — it is a cultural artefact. Thug Life is its own beast entirely.'),
      p('Set against the backdrop of the Tamil Nadu underworld spanning three decades, Thug Life follows the rise, fall, and redemption of a man caught between loyalty and survival. It is ambitious storytelling that demands your full attention.'),
      h2('Kamal Haasan: The Actor\'s Actor'),
      p('Kamal Haasan delivers a performance that is frightening in its intensity. At 70, he brings a rawness and physicality that younger actors would struggle to match. The ageing makeup is extraordinary — you genuinely believe you are watching the same man across three decades.'),
      p('But it is the vulnerability that stays with you. Beneath the gangster bravado, Kamal reveals a man haunted by choices he cannot undo. It is the kind of performance that reminds you why he is called Ulaganayagan.'),
      h2('The Mani Ratnam Touch'),
      p('Visually, Thug Life is breathtaking. Ravi K Chandran\'s cinematography is painterly — every frame could be a still photograph. AR Rahman\'s score is haunting and melancholic, perfectly complementing the themes of loss and regret.'),
      h2('Where It Divides'),
      p('Thug Life is not for everyone. The pacing is deliberately slow, the narrative jumps between timelines without explicit markers, and the emotional payoff comes much later than mainstream audiences might expect. Some viewers will find this pretentious; others will find it masterful.'),
      h2('Verdict: Ambitious, Flawed, Unforgettable'),
      p('Thug Life grossed approximately 97 crore — a respectable figure but below the blockbuster threshold. Commercially, it underperformed. Artistically, however, it is one of the most significant Tamil films of 2025.'),
      quote('Rating: 4 out of 5 — Not a crowd-pleaser, but a film that demands to be taken seriously. A reunion that was worth the wait.'),
    ],
    seoTitle: 'Thug Life Movie Review (2025) — Mani Ratnam & Kamal Haasan Reunion',
    seoDescription: 'In-depth review of Thug Life (2025), directed by Mani Ratnam and starring Kamal Haasan. A polarising but artistically significant gangster drama.',
    tags: ['thug-life', 'kamal-haasan', 'mani-ratnam', 'review', 'kollywood', '2025'],
  },
  {
    title: 'Top 10 Tamil Movies of 2025: The Films That Defined Kollywood This Year',
    slug: 'top-10-tamil-movies-2025',
    author: 'Vikram M',
    publishedAt: '2025-12-28T10:00:00Z',
    category: 'Top List',
    excerpt: 'From Rajinikanth\'s Coolie to newcomer breakouts, 2025 was a year of massive blockbusters and surprising gems. Here are the 10 Tamil films you absolutely cannot miss.',
    body: [
      h2('A Year of Extremes'),
      p('2025 was the year Tamil cinema released 285 films — a staggering number that reflects both creative energy and oversaturation. Among the noise stood films that reminded us why Kollywood remains one of the most dynamic film industries in the world.'),
      h3('1. Coolie (Dir: Lokesh Kanagaraj)'),
      p('The undisputed king of 2025. Rajinikanth + Lokesh Kanagaraj = highest-grossing Tamil film at 514-675 crore worldwide. A pan-Indian action spectacle that delivered on every front.'),
      h3('2. Thug Life (Dir: Mani Ratnam)'),
      p('The legendary Mani Ratnam-Kamal Haasan reunion. Polarising but artistically significant, Thug Life is a gangster epic that demands multiple viewings.'),
      h3('3. Good Bad Ugly (Dir: Adhik Ravichandran)'),
      p('Ajith Kumar\'s charisma meets Adhik Ravichandran\'s wild tonal shifts in a dark comedy-action hybrid that grossed 200-248 crore. The unpredictability is its greatest strength.'),
      h3('4. Dragon (Dir: Ashwath Marimuthu)'),
      p('The breakout hit of the year. Pradeep Ranganathan proved he is a bankable hero, grossing 150 crore with a film that blended Gen-Z humour with mass entertainer energy.'),
      h3('5. Vidaamuyarchi (Dir: Magizh Thirumeni)'),
      p('A taut, gripping thriller that showcased Ajith\'s range. Thirumeni\'s tight screenplay made this one of the most satisfying theatrical experiences of 2025.'),
      h3('6. Kuberaa (Dir: Sekhar Kammula)'),
      p('Dhanush teams up with Telugu director Sekhar Kammula in a multilingual film that grossed 115-132 crore. A landmark for cross-industry collaboration.'),
      h3('7. Maaman (Dir: Prabhu Solomon)'),
      p('The sleeper hit. A small-budget emotional drama that proved content is king. Best profitability-to-budget ratio in Kollywood.'),
      h3('8. Maharaja (Dir: Nithilan Saminathan)'),
      p('Vijay Sethupathi in a revenge thriller with a genuinely shocking twist. One of the most talked-about films of the year.'),
      h3('9. Amaran (Dir: Rajkumar Periasamy)'),
      p('Sivakarthikeyan delivered a career-best performance in this military drama based on a true story. Emotional, patriotic, and surprisingly restrained.'),
      h3('10. Kanguva (Dir: Siruthai Siva)'),
      p('Despite mixed reviews, Kanguva\'s ambition cannot be denied. A period action epic with stunning visuals and Suriya in a dual role.'),
      quote('Which Tamil film was YOUR favourite of 2025? Let us know in the comments!'),
    ],
    seoTitle: 'Top 10 Tamil Movies of 2025 — Best Kollywood Films Ranked',
    seoDescription: 'Our definitive ranking of the top 10 Tamil movies of 2025, from Coolie to Dragon. The best Kollywood films you need to watch.',
    tags: ['top-10', 'best-tamil-movies', '2025', 'kollywood', 'blockbuster', 'list'],
  },
  {
    title: 'Thalapathy Vijay\'s Jananayagan: Why His Final Film Is the Most Emotional Event in Tamil Cinema',
    slug: 'thalapathy-vijay-jananayagan-final-film',
    author: 'Deepa L',
    publishedAt: '2026-01-10T10:00:00Z',
    category: 'News',
    excerpt: 'The end of an era. Vijay — one of Tamil cinema\'s biggest superstars — is leaving acting for politics. His final film Jananayagan promises to be the most emotionally charged theatrical event in Kollywood history.',
    body: [
      h2('The End of an Era'),
      p('For over three decades, Thalapathy Vijay has been more than an actor to Tamil audiences. He has been a cultural phenomenon — the man whose films open to 50-crore first day, whose dialogues become political slogans, whose dance moves a generation tries to replicate. Now, he is walking away from it all.'),
      p('His decision to enter politics and contest elections is not entirely surprising, but the finality of it — this IS the last film — has hit fans hard.'),
      h2('From Ilayaraja to Politics'),
      p('Joseph Vijay Chandrasekhar debuted as a child actor in 1984\'s Naalaiya Theerpu and has since delivered over 70 films as a lead actor. Along the way, he transformed from a fresh-faced newcomer into one of the three pillars of Tamil cinema — alongside Rajinikanth and Kamal Haasan.'),
      h2('What We Know About Jananayagan'),
      p('Details about Jananayagan are being guarded closely, but the film is described as a mass entertainer with substance. Given that this is Vijay\'s farewell to cinema, expectations are astronomical. Industry insiders suggest the film will be a celebration of Vijay\'s career — a greatest hits of his iconic style, dialogue delivery, and dance moves.'),
      h2('The Fan Reaction'),
      p('Vijay\'s fan clubs — among the most organised and passionate in Indian cinema — have already begun planning massive celebrations. Theatre owners across Tamil Nadu are preparing for unprecedented advance booking demand. Social media is flooded with tribute videos, career retrospectives, and emotional posts from fans who grew up watching him.'),
      h2('A Cultural Moment'),
      p('Jananayagan is not just a film — it is a cultural moment. It represents the end of one of the most successful careers in Indian cinema and the beginning of a new chapter in Tamil Nadu\'s political landscape.'),
      quote('The question is not whether Jananayagan will be a blockbuster — it will. The question is whether it can capture the emotions of millions who grew up watching Thalapathy.'),
    ],
    seoTitle: 'Thalapathy Vijay\'s Last Film Jananayagan (2026) — Everything We Know',
    seoDescription: 'Everything about Thalapathy Vijay\'s final film Jananayagan. Why this is the most emotional event in Tamil cinema history.',
    tags: ['vijay', 'thalapathy', 'jananayagan', '2026', 'news', 'kollywood', 'politics'],
  },
  {
    title: 'Director Spotlight: How Lokesh Kanagaraj Became the Biggest Filmmaker in Tamil Cinema',
    slug: 'lokesh-kanagaraj-director-spotlight',
    author: 'Arun T',
    publishedAt: '2025-12-01T10:00:00Z',
    category: 'Director',
    excerpt: 'From Kaithi to Coolie, the rise of Lokesh Kanagaraj is one of the most remarkable stories in Indian cinema. Here is how a short-film filmmaker became the architect of Tamil cinema\'s biggest universe.',
    body: [
      h2('The Unlikely Auteur'),
      p('In 2019, a relatively unknown Tamil filmmaker released Kaithi — a film about an ex-convict trying to reunite with his daughter over a single night. It was made on a modest budget of 25 crore, starred no traditional heroes, and had zero songs. It became one of the biggest sleeper hits in Tamil cinema history. That filmmaker was Lokesh Kanagaraj.'),
      h2('Building the LCU'),
      p('What Lokesh did next was unprecedented in Indian cinema — he built a cinematic universe. Vikram connected directly to Kaithi and introduced a web of characters, timelines, and criminal organisations that span multiple films. The Lokesh Cinematic Universe (LCU) is India\'s answer to the MCU, but grittier, more grounded, and deeply rooted in Tamil Nadu\'s criminal underworld.'),
      p('It proved that Indian cinema could sustain long-form storytelling across multiple films — something previously thought to be a Hollywood-only concept.'),
      h2('The Coolie Triumph'),
      p('Coolie was the ultimate test: could Lokesh handle the biggest star in Indian cinema without compromising his vision? The answer was a resounding yes. The film grossed 514-675 crore worldwide. More importantly, Lokesh delivered a Rajinikanth film that felt fresh, modern, and exciting while still delivering every ounce of Superstar swag that fans crave.'),
      h2('The Lokesh Style'),
      p('What makes a Lokesh Kanagaraj film feel like a Lokesh Kanagaraj film? Non-linear storytelling that trusts the audience. Tight, muscular screenplays with zero fat. Long, unbroken action sequences that feel visceral. Soundtracks that become cultural phenomena. Characters who feel lived-in, not constructed. A deep respect for genre conventions — even as he subverts them.'),
      h2('What is Next?'),
      p('With Kaithi 2 confirmed and the LCU continuing to expand, Lokesh Kanagaraj is now the most in-demand director in Indian cinema. Every major star wants to work with him, every studio wants to fund him, and every fan wants to see what he does next.'),
      p('From making short films on YouTube to directing the biggest blockbusters in Indian cinema, Lokesh Kanagaraj\'s journey is a reminder that talent, vision, and persistence can take you anywhere.'),
      quote('Lokesh Kanagaraj did not just make films — he created a universe. And Tamil cinema is richer for it.'),
    ],
    seoTitle: 'Lokesh Kanagaraj Director Spotlight — From Kaithi to Coolie',
    seoDescription: 'The rise of Lokesh Kanagaraj, from short films to directing Rajinikanth in Coolie. How he built the LCU and became Kollywood\'s biggest filmmaker.',
    tags: ['lokesh-kanagaraj', 'director', 'luc', 'kaithi', 'coolie', 'vikram', 'kollywood'],
  },
  {
    title: '5 Career-Best Performances in Tamil Cinema That Every Fan Should Watch',
    slug: 'career-best-performances-tamil-cinema',
    author: 'Meena K',
    publishedAt: '2025-11-05T10:00:00Z',
    category: 'Actor',
    excerpt: 'From Kamal Haasan\'s transformative roles to Vijay Sethupathi\'s fearless choices — these 5 performances represent the absolute pinnacle of Tamil cinema acting.',
    body: [
      h2('The Art of Performance in Tamil Cinema'),
      p('Tamil cinema has a rich tradition of extraordinary performances. While the industry is often associated with larger-than-life mass entertainers, it has also produced some of the most nuanced, committed acting in all of Indian cinema. Here are 5 career-best performances that every film lover should experience.'),
      h3('1. Kamal Haasan — Nayakan (1987)'),
      p('Decades before method acting became a buzzword in Indian cinema, Kamal Haasan was doing it in Nayakan. His transformation from a young man witnessing his father\'s murder to a powerful underworld don spans three decades of a character\'s life, and Kamal inhabits every stage with frightening authenticity.'),
      p('The scene where he sits silently after learning of his friend\'s betrayal contains more emotional depth than most entire performances. One of the greatest performances in Asian cinema — period.'),
      h3('2. Vijay Sethupathi — Super Deluxe (2019)'),
      p('Super Deluxe asked Vijay Sethupathi to play a transgender woman returning to her family after a sex-change operation. In an industry where male actors rarely take such risks, Sethupathi committed fully — physically, emotionally, and vocally.'),
      p('His performance transcends the shock value of the premise. Shilpa is tender, vulnerable, and ultimately triumphant. It is the kind of role that changes how audiences see an actor forever.'),
      h3('3. Dhanush — Asuran (2019)'),
      p('Asuran was the film that showed the world what Dhanush fans already knew — he is a force of nature. Playing a father protecting his family from caste-based violence, Dhanush delivers a performance that is simultaneously explosive and deeply restrained.'),
      p('The contrast between his quiet, stoic moments with his son and his ferocious rage when pushed to the edge is electrifying.'),
      h3('4. Suriya — Pithamagan (2003)'),
      p('Long before he was a superstar, Suriya delivered one of Tamil cinema\'s most memorable supporting performances in Pithamagan. His portrayal of a naive young man caught in a world of violence is heartbreaking in its simplicity.'),
      p('Working alongside the legendary Vikram, Suriya more than holds his own. It announced his arrival as a serious actor — not just a star, but someone with genuine dramatic range.'),
      h3('5. Trisha Krishnan — 96 (2018)'),
      p('Often overlooked in best performance lists, Trisha\'s work in 96 is a masterclass in subtlety. Playing a woman reconnecting with her college sweetheart after 22 years, Trisha conveys decades of emotion through the smallest gestures.'),
      p('The way she looks at Vijay Sethupathi\'s Ram during their class reunion scene, the slight tremor in her voice when she talks about her marriage, the tears she holds back — Trisha proves that great acting is not about big scenes but about the moments in between.'),
      quote('Great performances do not just entertain — they transform how we see the world. These 5 performances did exactly that.'),
    ],
    seoTitle: '5 Career-Best Performances in Tamil Cinema — Kamal, Vijay Sethupathi, Dhanush',
    seoDescription: 'Explore the 5 greatest career-best performances in Tamil cinema history, from Kamal Haasan in Nayakan to Vijay Sethupathi in Super Deluxe.',
    tags: ['best-performances', 'kamal-haasan', 'vijay-sethupathi', 'dhanush', 'actors', 'kollywood'],
  },
]

const lines = posts.map(post => {
  const doc = {
    _type: 'blog',
    title: post.title,
    slug: { current: post.slug },
    author: post.author,
    publishedAt: post.publishedAt,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    tags: post.tags,
  }
  return JSON.stringify(doc)
})

const outPath = path.join(__dirname, '..', 'blogs.ndjson')
fs.writeFileSync(outPath, lines.join('\n') + '\n')
console.log(`Generated ${lines.length} blog posts in ${outPath}`)
