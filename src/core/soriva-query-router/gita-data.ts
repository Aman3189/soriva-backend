/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BHAGAVAD GITA DATA - Day 2
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { GitaShlok, GitaChapter } from './types';

export const GITA_CHAPTERS: GitaChapter[] = [
  { number: 1, nameSanskrit: 'अर्जुन विषाद योग', nameHindi: 'अर्जुन विषाद योग', nameEnglish: 'Arjuna Visada Yoga', totalShlokas: 47, summary: 'Arjuna ka yuddh se pehle vishaad - apne parivaar se ladne ki peeda' },
  { number: 2, nameSanskrit: 'सांख्य योग', nameHindi: 'सांख्य योग', nameEnglish: 'Sankhya Yoga', totalShlokas: 72, summary: 'Atma ki amarta, Nishkaam Karma ka updesh - Gita ka saar' },
  { number: 3, nameSanskrit: 'कर्म योग', nameHindi: 'कर्म योग', nameEnglish: 'Karma Yoga', totalShlokas: 43, summary: 'Karm karo, phal ki chinta mat karo' },
  { number: 4, nameSanskrit: 'ज्ञान कर्म सन्यास योग', nameHindi: 'ज्ञान कर्म संन्यास योग', nameEnglish: 'Jnana Karma Sannyasa Yoga', totalShlokas: 42, summary: 'Gyan aur Karm ka sangam, Avatar ka rahasya' },
  { number: 5, nameSanskrit: 'कर्म सन्यास योग', nameHindi: 'कर्म संन्यास योग', nameEnglish: 'Karma Sannyasa Yoga', totalShlokas: 29, summary: 'Sanyas vs Karma Yoga - dono ek hi hain' },
  { number: 6, nameSanskrit: 'ध्यान योग', nameHindi: 'ध्यान योग', nameEnglish: 'Dhyana Yoga', totalShlokas: 47, summary: 'Meditation aur self-control ki vidhi' },
  { number: 7, nameSanskrit: 'ज्ञान विज्ञान योग', nameHindi: 'ज्ञान विज्ञान योग', nameEnglish: 'Jnana Vijnana Yoga', totalShlokas: 30, summary: 'Bhagwan ke swaroop ka gyan' },
  { number: 8, nameSanskrit: 'अक्षर ब्रह्म योग', nameHindi: 'अक्षर ब्रह्म योग', nameEnglish: 'Akshara Brahma Yoga', totalShlokas: 28, summary: 'Brahm, Adhyatma, aur mrityu ke samay ka gyan' },
  { number: 9, nameSanskrit: 'राज विद्या राज गुह्य योग', nameHindi: 'राज विद्या राज गुह्य योग', nameEnglish: 'Raja Vidya Raja Guhya Yoga', totalShlokas: 34, summary: 'Sabse bada rahasya - Bhakti Yoga' },
  { number: 10, nameSanskrit: 'विभूति योग', nameHindi: 'विभूति योग', nameEnglish: 'Vibhuti Yoga', totalShlokas: 42, summary: 'Bhagwan ki vibhutiyan (glories)' },
  { number: 11, nameSanskrit: 'विश्वरूप दर्शन योग', nameHindi: 'विश्वरूप दर्शन योग', nameEnglish: 'Vishwarupa Darshana Yoga', totalShlokas: 55, summary: 'Arjuna ko Vishwaroop darshan' },
  { number: 12, nameSanskrit: 'भक्ति योग', nameHindi: 'भक्ति योग', nameEnglish: 'Bhakti Yoga', totalShlokas: 20, summary: 'Bhakti ka mahatva aur lakshan' },
  { number: 13, nameSanskrit: 'क्षेत्र क्षेत्रज्ञ विभाग योग', nameHindi: 'क्षेत्र क्षेत्रज्ञ विभाग योग', nameEnglish: 'Kshetra Kshetragna Vibhaga Yoga', totalShlokas: 35, summary: 'Sharir (Kshetra) aur Atma (Kshetragna) ka gyan' },
  { number: 14, nameSanskrit: 'गुणत्रय विभाग योग', nameHindi: 'गुणत्रय विभाग योग', nameEnglish: 'Gunatraya Vibhaga Yoga', totalShlokas: 27, summary: 'Teen Gunas - Sattva, Rajas, Tamas' },
  { number: 15, nameSanskrit: 'पुरुषोत्तम योग', nameHindi: 'पुरुषोत्तम योग', nameEnglish: 'Purushottama Yoga', totalShlokas: 20, summary: 'Purushottam (Supreme Being) ka gyan' },
  { number: 16, nameSanskrit: 'दैवासुर सम्पद्विभाग योग', nameHindi: 'दैवासुर सम्पद्विभाग योग', nameEnglish: 'Daivasura Sampad Vibhaga Yoga', totalShlokas: 24, summary: 'Daivi vs Asuri qualities' },
  { number: 17, nameSanskrit: 'श्रद्धात्रय विभाग योग', nameHindi: 'श्रद्धात्रय विभाग योग', nameEnglish: 'Shraddhatraya Vibhaga Yoga', totalShlokas: 28, summary: 'Teen prakar ki Shraddha' },
  { number: 18, nameSanskrit: 'मोक्ष सन्यास योग', nameHindi: 'मोक्ष संन्यास योग', nameEnglish: 'Moksha Sannyasa Yoga', totalShlokas: 78, summary: 'Final conclusion - Moksha ka maarg' },
];

export const FAMOUS_SHLOKAS: GitaShlok[] = [
  {
    chapter: 2,
    shlok: 47,
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    transliteration: 'karmanye vadhikaraste ma phaleshu kadachana',
    hindiMeaning: 'Tumhara adhikaar sirf karm karne mein hai, phal mein kabhi nahi.',
    englishMeaning: 'You have the right to perform your duty, but never to the fruits of action.',
    speaker: 'Krishna',
    keywords: ['karma', 'duty', 'action', 'detachment', 'karm'],
  },
  {
    chapter: 4,
    shlok: 7,
    sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
    transliteration: 'yada yada hi dharmasya glanir bhavati bharata',
    hindiMeaning: 'Jab jab dharma ki haani hoti hai, tab tab main prakat hota hoon.',
    englishMeaning: 'Whenever there is a decline in righteousness, I manifest Myself.',
    speaker: 'Krishna',
    keywords: ['dharma', 'avatar', 'incarnation', 'righteousness'],
  },
  {
    chapter: 4,
    shlok: 8,
    sanskrit: 'परित्राणाय साधूनां विनाशाय च दुष्कृताम्। धर्मसंस्थापनार्थाय सम्भवामि युगे युगे॥',
    transliteration: 'paritranaya sadhunam vinashaya cha dushkritam',
    hindiMeaning: 'Sajjano ki raksha, dushton ke vinash, aur dharma ki sthapana ke liye main har yug mein aata hoon.',
    englishMeaning: 'For protection of the good, destruction of evil, and establishment of dharma, I appear in every age.',
    speaker: 'Krishna',
    keywords: ['avatar', 'protection', 'dharma', 'yuga'],
  },
  {
    chapter: 6,
    shlok: 5,
    sanskrit: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥',
    transliteration: 'uddhared atmanatmanam natmanam avasadayet',
    hindiMeaning: 'Apne aap ko khud uthao. Tum khud apne mitra ho aur khud apne shatru.',
    englishMeaning: 'Elevate yourself by your own mind. The mind alone is friend and enemy of the self.',
    speaker: 'Krishna',
    keywords: ['self', 'mind', 'atma', 'friend', 'enemy'],
  },
  {
    chapter: 9,
    shlok: 22,
    sanskrit: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥',
    transliteration: 'ananyash chintayanto mam ye janah paryupasate',
    hindiMeaning: 'Jo ananaya bhav se meri upasana karte hain, unka main khud dhyan rakhta hoon.',
    englishMeaning: 'Those who worship Me with exclusive devotion - I personally carry their necessities.',
    speaker: 'Krishna',
    keywords: ['bhakti', 'devotion', 'protection', 'worship'],
  },
  {
    chapter: 18,
    shlok: 66,
    sanskrit: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
    transliteration: 'sarva-dharman parityajya mam ekam sharanam vraja',
    hindiMeaning: 'Sab chod kar meri sharan aa jao. Main tumhe sab paapon se mukti dunga.',
    englishMeaning: 'Abandon all dharmas and surrender unto Me alone. I shall deliver you from all sins.',
    speaker: 'Krishna',
    keywords: ['surrender', 'moksha', 'liberation', 'sharan', 'samarpan'],
  },
];

export const TOPIC_TO_SHLOKAS: Record<string, number[]> = {
  'karma': [0], 'karm': [0], 'duty': [0], 'action': [0],
  'dharma': [1, 2], 'avatar': [1, 2], 'incarnation': [1, 2],
  'self': [3], 'mind': [3], 'atma': [3],
  'bhakti': [4], 'devotion': [4],
  'surrender': [5], 'moksha': [5], 'liberation': [5], 'sharan': [5],
};

export function getChapterInfo(chapterNum: number): GitaChapter | null {
  return GITA_CHAPTERS.find(c => c.number === chapterNum) || null;
}

export function getShlok(chapter: number, shlok: number): GitaShlok | null {
  return FAMOUS_SHLOKAS.find(s => s.chapter === chapter && s.shlok === shlok) || null;
}

export function getShlokasByTopic(topic: string): GitaShlok[] {
  const indices = TOPIC_TO_SHLOKAS[topic.toLowerCase()] || [];
  return indices.map(i => FAMOUS_SHLOKAS[i]);
}

export function getRandomFamousShlok(): GitaShlok {
  return FAMOUS_SHLOKAS[Math.floor(Math.random() * FAMOUS_SHLOKAS.length)];
}

export function formatShlokResponse(shlok: GitaShlok, language: 'hi' | 'en' | 'hinglish' = 'hinglish'): string {
  let response = `📖 **Bhagavad Gita ${shlok.chapter}.${shlok.shlok}**\n\n`;
  response += `🔱 *${shlok.sanskrit}*\n\n`;
  response += language === 'en' 
    ? `📝 **Meaning:** ${shlok.englishMeaning}\n\n`
    : `📝 **Arth:** ${shlok.hindiMeaning}\n\n`;
  response += `🎤 *Speaker: ${shlok.speaker}*`;
  return response;
}

export function formatChapterResponse(chapter: GitaChapter): string {
  return `📖 **Bhagavad Gita - Chapter ${chapter.number}**\n\n` +
    `🔱 **${chapter.nameSanskrit}**\n` +
    `📝 ${chapter.nameEnglish}\n\n` +
    `📊 Total Shlokas: **${chapter.totalShlokas}**\n\n` +
    `💡 **Summary:** ${chapter.summary}`;
}
