const { createClient } = require('next-sanity');
const fs = require('fs');

const projectId = 'od67iigb';
const dataset = 'production';
const token = 'skuBT5iaPNhvNYo0AaLaD2aEPzdbQmCRmdd7M1bIuNT60prYJ5n7LElOZXotlYpEqBS8IucuXnSGujl0QbOk49WFf5BJbqneyr3DeCvQkgKeocYkv2ouumnrqe8aDIj0WiJAvhxW4jt43B6DwoqyvKozImF5hJfviQGq4B3OJ8jnPUfoQhYz';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
});

let keyCounter = 0;
function makeKey() {
  keyCounter++;
  return `enhanced-${Date.now()}-${keyCounter}`;
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

// Helper to create a heading block
function heading(text, level = 'h2') {
  return textBlock(text, [], level);
}

// Helper to create a callout/highlight box (using blockquote with custom styling)
function calloutBox(text, type = 'info') {
  return {
    _type: 'block',
    _key: makeKey(),
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        _key: makeKey(),
        text: text,
        marks: ['strong'],
      },
    ],
  };
}

// Helper to create an image block
function imageBlock(assetRef, alt = '', caption = '') {
  return {
    _type: 'image',
    _key: makeKey(),
    asset: {
      _type: 'reference',
      _ref: assetRef,
    },
    alt: alt,
    caption: caption,
  };
}

// Helper to create a poll question block (custom type)
function pollBlock(question, options) {
  return {
    _type: 'block',
    _key: makeKey(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: makeKey(),
        text: `📊 POLL: ${question}`,
        marks: ['strong'],
      },
    ],
  };
}

// Helper to create a highlight/emphasis block
function highlightBlock(text) {
  return {
    _type: 'block',
    _key: makeKey(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: makeKey(),
        text: text,
        marks: ['em'],
      },
    ],
  };
}

async function main() {
  console.log('🎬 Enhancing Jana Nayagan blog post...');

  // 1. Find the existing blog document
  const blogId = 'Nc4mTuYZIAMFPBjKxeZ6J0';
  let blog;
  try {
    blog = await client.getDocument(blogId);
    console.log('📄 Found blog:', blog.title);
  } catch (err) {
    console.error('❌ Blog not found:', err.message);
    process.exit(1);
  }

  // 2. Get the existing image asset ID
  const existingImageRef = blog.mainImage?.asset?._ref;
  if (!existingImageRef) {
    console.error('❌ No main image found in blog');
    process.exit(1);
  }
  console.log('📸 Using existing image:', existingImageRef);

  // 3. Create enhanced body with inline images and interactive elements
  const enhancedBody = [
    // Opening with dramatic image
    imageBlock(existingImageRef, 'ஜன நாயகன் - தளபதி விஜயின் கடைசி படம்', 'ஜன நாயகன் - தளபதி விஜயின் கடைசி படம்'),
    textBlock(''),

    // Dramatic intro
    heading('🎬 தளபதி ரசிகர்களே, காத்திருப்பு முடியப்போகுது!', 'h1'),
    textBlock(''),
    textBlock('தளபதி விஜயின் நடிப்பு பயணத்தின் கடைசி முழு நீள படம் "ஜன நாயகன்" - இது கேட்டதுமே ரசிகர்களின் மனசுல ஒரு தனி emotion.'),
    textBlock(''),
    calloutBox('🔥 BREAKING: விஜய் கரியரிலேயே முதல் முறையாக \'A\' சர்டிபிகேட் பெற்ற படம்!'),
    textBlock(''),

    // Breaking news section with highlight
    heading('🚨 ப்ரேக்கிங்: \'A\' சர்டிபிகேட் - விஜய் கரியரிலேயே முதல் முறை!', 'h2'),
    textBlock(''),
    highlightBlock('இது ஏன் பிக் நியூஸ்னா, குடும்ப படங்களை மட்டுமே தந்திருக்கும் தளபதி விஜயின் கரியரில் இதுவே முதல் A சான்றிதழ் படம்!'),
    textBlock(''),
    textBlock('அரசியல் சார்ந்த கருத்துக்கள், மத குறிப்புகள், சில intense காட்சிகள் காரணமா, இந்த படம் censor board-டோட நீண்ட நாள் clash-ல இருந்திருக்கு.'),
    textBlock(''),

    // Timeline visual (using callout boxes)
    heading('📅 ரிலீஸ் தேதி எப்போ? இதோ சாத்தியமான தேதிகள்', 'h2'),
    textBlock(''),
    textBlock('அதிகாரப்பூர்வ அறிவிப்பு இன்னும் வெளியாகல என்றாலும், ஜூலை மாதத்தில் படம் ரிலீஸ் ஆகலாம் என்று பல தகவல்கள் தெரிவிக்கின்றன.'),
    textBlock(''),
    calloutBox('📅 ஜூலை 16–17: முதல் வாய்ப்பு'),
    calloutBox('📅 ஜூலை 23–24: அதிக வாய்ப்பு என பேசப்படுகிறது'),
    calloutBox('📅 ஜூலை 31: "சிக்மா" படத்துடன் மோதல் வராம தவிர்க்கலாம்'),
    textBlock(''),

    // Movie details section
    heading('🎬 படத்தைப் பற்றி ஒரு சின்ன ஸ்னீக் பீக்', 'h2'),
    textBlock(''),
    textBlock('• இயக்கம்: H. வினோத்'),
    textBlock('• கதாநாயகி: பூஜா ஹெக்டே'),
    textBlock('• முக்கிய கதாபாத்திரங்கள்: போபி டியோல் (தமிழ் அறிமுகம்), மமிதா பைஜு, கௌதம் வாசுதேவ் மேனன், பிரகாஷ் ராஜ், நரேன், பிரியமணி'),
    textBlock('• ஓட்டம்: சுமார் 3 மணி நேரம் - விஜயின் நீளமான படங்களில் ஒன்று'),
    textBlock('• புரொடக்‌ஷன்: KVN Productions-க்கு இது தமிழ் அறிமுகம்'),
    textBlock(''),
    highlightBlock('இது தளபதியின் கடைசி முழு நீள நடிப்பு படம் என்பதால், ஒவ்வொரு அப்டேட்டும் ரசிகர்களுக்கு ஒரு தனி sentimental value கொண்டதா இருக்கு.'),
    textBlock(''),

    // Controversy section
    heading('💥 ஏன் இந்த படம் இவ்வளவு கான்ட்ரோவெர்ஷியலா மாறியது?', 'h2'),
    textBlock(''),
    textBlock('ஜன நாயகன் பயணம் சுலபமா இல்லை:'),
    textBlock(''),
    textBlock('• ஆரம்பத்தில் ஜனவரி 9 ரிலீஸ் என அறிவிக்கப்பட்டு, சான்றிதழ் கிடைக்காம தள்ளிப் போச்சு'),
    textBlock('• CBFC-க்கு எதிராக KVN Productions கோர்ட்டுக்கு போனது'),
    textBlock('• படத்தின் சில பகுதிகள் ஆன்லைனில் லீக் ஆகி, சட்டப்பூர்வ நடவடிக்கை எடுக்கப்பட்டது'),
    textBlock('• ட்ரெய்லர் வெளியான 24 மணி நேரத்தில் 8 கோடிக்கும் அதிகமான views பெற்று, "அதிக பார்வையிட்ட தமிழ் ட்ரெய்லர்" record படைத்தது'),
    textBlock(''),
    calloutBox('🏆 RECORD: 8 கோடி+ views ட்ரெய்லர் - தமிழ் சினிமா வரலாற்றில் அதிக பார்வையிட்ட ட்ரெய்லர்!'),
    textBlock(''),
    highlightBlock('இத்தனை drama-க்கு பிறகும், ரசிகர்களின் ஆர்வம் இன்னும் குறையாம இருப்பது தான் இந்த படத்தின் real hype-ஐ காட்டுது.'),
    textBlock(''),

    // Interactive poll section
    heading('🗣️ உங்க கருத்து என்ன?', 'h2'),
    textBlock(''),
    pollBlock('ஜன நாயகனுக்கு A சர்டிபிகேட் கிடைச்சது சரியான முடிவுதானா?', ['ஆம், சரியான முடிவு', 'இல்ல, U சர்டிபிகேட் இருக்கணும்', 'படத்தை பார்த்துட்டு சொல்றேன்']),
    textBlock(''),
    pollBlock('விஜயின் கடைசி படமா இது இருக்குமா, இல்ல இன்னும் surprise வருமா?', ['இதுதான் கடைசி', 'இன்னும் surprise வரும்', 'அரசியலுக்கு போயிடுவார்']),
    textBlock(''),
    pollBlock('நீங்க எந்த தேதியில் படம் ரிலீஸ் ஆகும்னு நினைக்கிறீங்க?', ['ஜூலை 16', 'ஜூலை 23', 'ஜூலை 31', 'வேற தேதி']),
    textBlock(''),
    textBlock('கமெண்ட் பண்ணி உங்க thoughts-ஐ share பண்ணுங்க! இந்த பதிவை உங்க தளபதி ரசிகர் நண்பர்களுக்கும் ஷேர் பண்ணுங்க - அதிகாரப்பூர்வ அறிவிப்பு வந்தவுடன் நாங்க உடனே அப்டேட் தருவோம். 🔔'),
    textBlock(''),
    highlightBlock('🔔 இந்த பதிவு தற்போதைய தகவல்களை அடிப்படையாகக் கொண்டது. அதிகாரப்பூர்வ உறுதிப்படுத்தல் இன்னும் நிலுவையில் உள்ளது.'),
  ];

  // 4. Update the blog document with enhanced body
  try {
    const result = await client
      .patch(blogId)
      .set({ body: enhancedBody })
      .commit();
    
    console.log('✅ Blog post enhanced successfully!');
    console.log('📄 Document ID:', result._id);
    console.log('🔗 URL: https://tamilcinemahub.xyz/blogs/jana-nayagan-release-date-vijay-last-movie');
    console.log('📸 Added: Inline image, callout boxes, poll sections, highlight blocks');
  } catch (err) {
    console.error('❌ Failed to enhance blog post:', err.message);
    process.exit(1);
  }
}

main();
