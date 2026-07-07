const { createClient } = require('next-sanity');
const fs = require('fs');
const path = require('path');

const projectId = 'od67iigb';
const dataset = 'production';
const token = process.env.SANITY_WRITE_TOKEN || 'skuBT5iaPNhvNYo0AaLaD2aEPzdbQmCRmdd7M1bIuNT60prYJ5n7LElOZXotlYpEqBS8IucuXnSGujl0QbOk49WFf5BJbqneyr3DeCvQkgKeocYkv2ouumnrqe8aDIj0WiJAvhxW4jt43B6DwoqyvKozImF5hJfviQGq4B3OJ8jnPUfoQhYz';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
});

// Unique key generator
let keyCounter = 0;
function makeKey() {
  keyCounter++;
  return `blog-${Date.now()}-${keyCounter}`;
}

// Helper to create a text block
function textBlock(text, marks = [], style = 'normal') {
  return {
    _type: 'block',
    _key: makeKey(),
    style,
    children: [
      {
        _type: 'span',
        _key: makeKey(),
        text,
        marks,
      },
    ],
  };
}

// Helper to create a block with mixed text (bold + normal)
function mixedBlock(parts, style = 'normal') {
  return {
    _type: 'block',
    _key: makeKey(),
    style,
    children: parts.map((part) => ({
      _type: 'span',
      _key: makeKey(),
      text: part.text,
      marks: part.bold ? ['strong'] : [],
    })),
  };
}

// Helper to create a heading block
function heading(text, level = 'h2') {
  return textBlock(text, [], level);
}

// Helper to create a list item
function listItem(text, marks = []) {
  return {
    _type: 'block',
    _key: makeKey(),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    children: [
      {
        _type: 'span',
        _key: makeKey(),
        text,
        marks,
      },
    ],
  };
}

async function main() {
  console.log('🎬 Creating Jana Nayagan blog post...');

  // 1. Upload the image
  const imagePath = 'c:\\Users\\HP VICTUS\\Downloads\\Gemini_Generated_Image_9wlifa9wlifa9wli.png';
  console.log('📸 Uploading image...');

  let mainImage;
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageAsset = await client.assets.upload('image', imageBuffer, {
      filename: 'jana-nayagan-blog.png',
    });
    mainImage = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageAsset._id,
      },
    };
    console.log('✅ Image uploaded:', imageAsset._id);
  } catch (err) {
    console.error('❌ Image upload failed:', err.message);
    process.exit(1);
  }

  // 2. Create the blog document with Portable Text body
  const slug = 'jana-nayagan-release-date-vijay-last-movie';

  const body = [
    // Intro
    textBlock('தளபதி ரசிகர்களே, காத்திருப்பு முடியப்போகுது!'),
    textBlock(''),
    mixedBlock([
      { text: 'தளபதி விஜயின் நடிப்பு பயணத்தின் ' },
      { text: 'கடைசி முழு நீள படம்', bold: true },
      { text: ' "ஜன நாயகன்" - இது கேட்டதுமே ரசிகர்களின் மனசுல ஒரு தனி emotion. மாசக்கணக்கில் தாமதம், சென்சார் போர்டுடன் சண்டை, கோர்ட் வழக்கு, லீக் பிரச்சினை... இத்தனை twists தாண்டி, இப்போ ஒரு பெரிய அப்டேட் வெளியாகியிருக்கு!' },
    ]),
    textBlock(''),
    textBlock('இந்த பதிவுல, ஜன நாயகன் பட ரிலீஸ் தேதி, சர்டிபிகேட் விவகாரம், மற்றும் ரசிகர்களை பரபரப்பாக்கும் அத்தனை details-ஐயும் ஒரே இடத்துல பாப்போம்.'),

    // Breaking section
    heading('🚨 ப்ரேக்கிங்: \'A\' சர்டிபிகேட் - விஜய் கரியரிலேயே முதல் முறை!', 'h2'),
    textBlock(''),
    mixedBlock([
      { text: 'பல மாத போராட்டத்துக்கு பிறகு, மத்திய திரைப்பட சான்றிதழ் வாரியத்திடம் (CBFC) இருந்து ஜன நாயகன் படத்திற்கு இறுதியாக க்ளியரன்ஸ் கிடைத்திருப்பதாக தகவல்கள் வெளியாகியுள்ளன. ஆனா அசல் ட்விஸ்ட் என்னன்னா - இந்த படத்திற்கு ' },
      { text: "'A' (Adults Only) சான்றிதழ் வழங்கப்பட்டிருப்பதாக", bold: true },
      { text: ' தெரிகிறது.' },
    ]),
    textBlock(''),
    mixedBlock([
      { text: 'இது ஏன் பிக் நியூஸ்னா, குடும்ப படங்களை மட்டுமே தந்திருக்கும் தளபதி விஜயின் கரியரில் ' },
      { text: 'இதுவே முதல் A சான்றிதழ் படம்', bold: true },
      { text: '! அரசியல் சார்ந்த கருத்துக்கள், மத குறிப்புகள், சில intense காட்சிகள் காரணமா, இந்த படம் censor board-டோட நீண்ட நாள் clash-ல இருந்திருக்கு.' },
    ]),

    // Release dates section
    heading('📅 ரிலீஸ் தேதி எப்போ? இதோ சாத்தியமான தேதிகள்', 'h2'),
    textBlock(''),
    textBlock('அதிகாரப்பூர்வ அறிவிப்பு இன்னும் வெளியாகல என்றாலும், ஜூலை மாதத்தில் படம் ரிலீஸ் ஆகலாம் என்று பல தகவல்கள் தெரிவிக்கின்றன. விவாதிக்கப்படும் தேதிகள்:'),
    textBlock(''),
    listItem('ஜூலை 16–17'),
    listItem('ஜூலை 23–24 (இதுவே அதிக வாய்ப்பு என பேசப்படுகிறது)'),
    listItem('ஜூலை 31 - ஆனா விஜயின் மகன் ஜேசன் சஞ்சயின் இயக்கத்தில் வெளிவரும் "சிக்மா" படத்துடன் மோதல் வராம, இந்த தேதியை தவிர்க்கலாம் என்று தகவல்'),

    // Movie details section
    heading('🎬 படத்தைப் பற்றி ஒரு சின்ன ஸ்னீக் பீக்', 'h2'),
    textBlock(''),
    mixedBlock([
      { text: 'இயக்கம்: ', bold: true },
      { text: 'H. வினோத்' },
    ]),
    mixedBlock([
      { text: 'கதாநாயகி: ', bold: true },
      { text: 'பூஜா ஹெக்டே' },
    ]),
    mixedBlock([
      { text: 'முக்கிய கதாபாத்திரங்கள்: ', bold: true },
      { text: 'போபி டியோல் (தமிழ் அறிமுகம்), மமிதா பைஜு, கௌதம் வாசுதேவ் மேனன், பிரகாஷ் ராஜ், நரேன், பிரியமணி' },
    ]),
    mixedBlock([
      { text: 'ஓட்டம்: ', bold: true },
      { text: 'சுமார் 3 மணி நேரம் - விஜயின் நீளமான படங்களில் ஒன்று' },
    ]),
    mixedBlock([
      { text: 'புரொடக்‌ஷன்: ', bold: true },
      { text: 'KVN Productions-க்கு இது தமிழ் அறிமுகம்' },
    ]),
    textBlock(''),
    mixedBlock([
      { text: 'இது தளபதியின் ' },
      { text: 'கடைசி முழு நீள நடிப்பு படம்', bold: true },
      { text: ' என்பதால், ஒவ்வொரு அப்டேட்டும் ரசிகர்களுக்கு ஒரு தனி sentimental value கொண்டதா இருக்கு.' },
    ]),

    // Controversy section
    heading('💥 ஏன் இந்த படம் இவ்வளவு கான்ட்ரோவெர்ஷியலா மாறியது?', 'h2'),
    textBlock(''),
    textBlock('ஜன நாயகன் பயணம் சுலபமா இல்லை:'),
    textBlock(''),
    listItem('ஆரம்பத்தில் ஜனவரி 9 ரிலீஸ் என அறிவிக்கப்பட்டு, சான்றிதழ் கிடைக்காம தள்ளிப் போச்சு'),
    listItem('CBFC-க்கு எதிராக KVN Productions கோர்ட்டுக்கு போனது'),
    listItem('படத்தின் சில பகுதிகள் ஆன்லைனில் லீக் ஆகி, சட்டப்பூர்வ நடவடிக்கை எடுக்கப்பட்டது'),
    listItem('ட்ரெய்லர் வெளியான 24 மணி நேரத்தில் 8 கோடிக்கும் அதிகமான views பெற்று, "அதிக பார்வையிட்ட தமிழ் ட்ரெய்லர்" record படைத்தது'),
    textBlock(''),
    mixedBlock([
      { text: 'இத்தனை drama-க்கு பிறகும், ரசிகர்களின் ஆர்வம் இன்னும் குறையாம இருப்பது தான் இந்த படத்தின் real hype-ஐ காட்டுது.' },
    ]),

    // Opinion section
    heading('🗣️ உங்க கருத்து என்ன?', 'h2'),
    textBlock(''),
    listItem('ஜன நாயகனுக்கு A சர்டிபிகேட் கிடைச்சது சரியான முடிவுதானா?'),
    listItem('விஜயின் கடைசி படமா இது இருக்குமா, இல்ல இன்னும் surprise வருமா?'),
    listItem('நீங்க எந்த தேதியில் படம் ரிலீஸ் ஆகும்னு நினைக்கிறீங்க - ஜூலை 16, 23 இல்ல வேற தேதியா?'),
    textBlock(''),
    textBlock('கமெண்ட் பண்ணி உங்க thoughts-ஐ share பண்ணுங்க! இந்த பதிவை உங்க தளபதி ரசிகர் நண்பர்களுக்கும் ஷேர் பண்ணுங்க - அதிகாரப்பூர்வ அறிவிப்பு வந்தவுடன் நாங்க உடனே அப்டேட் தருவோம். 🔔'),
    textBlock(''),
    textBlock('*இந்த பதிவு தற்போதைய தகவல்களை அடிப்படையாகக் கொண்டது. அதிகாரப்பூர்வ உறுதிப்படுத்தல் இன்னும் நிலுவையில் உள்ளது.*'),
  ];

  const blogDoc = {
    _type: 'blog',
    title: 'ஜன நாயகன் ரிலீஸ் தேதி கன்பர்ம்? விஜய் கடைசி படத்தில் அதிர்ச்சி திருப்பம்!',
    slug: { _type: 'slug', current: slug },
    author: 'TamilCinemaHub',
    publishedAt: new Date().toISOString(),
    category: 'News',
    mainImage,
    excerpt: 'தளபதி விஜயின் கடைசி படம் "ஜன நாயகன்" - A சான்றிதழ், ரிலீஸ் தேதி, மற்றும் சர்ச்சைகள் பற்றிய முழு அப்டேட்!',
    body,
    seoTitle: 'Jana Nayagan Release Date: Vijay Last Movie A Certificate Update',
    seoDescription: 'ஜன நாயகன் ரிலீஸ் தேதி, A சர்டிபிகேட், மற்றும் விஜயின் கடைசி படம் பற்றிய முழு அப்டேட் - TamilCinemaHub',
    readTime: 5,
    featured: true,
    tags: ['Vijay', 'Jana Nayagan', 'Thalapathy', 'Tamil Cinema', 'CBFC', 'A Certificate', 'Release Date'],
    likes: 0,
    dislikes: 0,
  };

  try {
    const result = await client.create(blogDoc);
    console.log('✅ Blog post created successfully!');
    console.log('📄 Document ID:', result._id);
    console.log('🔗 URL: https://tamilcinemahub.xyz/blogs/' + slug);
  } catch (err) {
    console.error('❌ Failed to create blog post:', err.message);
    process.exit(1);
  }
}

main();
