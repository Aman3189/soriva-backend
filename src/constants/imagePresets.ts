// src/constants/imagePresets.ts

/**
 * ==========================================
 * SORIVA IMAGE PRESETS v12.0 (2-Model System)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: One-click preset prompts for high-quality image generation
 * 
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 * 
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 * 
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25 - Nature, animals, scenery
 *    - GPT LOW (OpenAI): ₹1.18 - Text, logos, festivals, ads
 * 
 * ✅ UPDATED:
 *    - All presets now use ImageProvider.GPT_LOW
 *    - Festivals, occasions, business → GPT LOW (best for text & design)
 *
 * ==========================================
 * v3.0 (January 20, 2026): [SUPERSEDED]
 * ==========================================
 * - Removed deity presets
 * - Added ultra-realistic prompts
 * 
 * Categories:
 * - Festival Presets (10)
 * - Occasion Presets (6)
 * - Business Presets (4)
 * 
 * Last Updated: February 22, 2026
 */

import { ImageProvider } from '../types/image.types';

// ==========================================
// SORIVA BASE STYLE (Ultra Realistic Signature)
// ==========================================

export const SORIVA_BASE_STYLE = 
  'ultra-realistic, photorealistic quality, cinematic composition, centered subject, balanced colors, professional photography';

export const SORIVA_QUALITY_SUFFIX = 
  'RAW photo, hyper-detailed, 8K UHD, DSLR quality, sharp focus, natural lighting, depth of field, professional color grading';

// ==========================================
// TYPES
// ==========================================

export interface ImagePreset {
  id: string;
  version: number;
  name: string;
  nameHindi?: string;
  icon: string;
  category: PresetCategory;
  description: string;
  provider: ImageProvider;
  promptTemplate: string;
  baseStyle: string;
  elements: string[];
  lighting: string;
  colorPalette: string[];
  forbiddenElements?: string[];
  modelHint?: string;
  culturalNotes?: string;
  outputTypes: OutputType[];
  tags: string[];
  popular?: boolean;
  seasonal?: boolean;
  seasonMonths?: number[];
}

export type PresetCategory = 
  | 'festival' 
  | 'occasion' 
  | 'business'
  | 'nature'
  | 'portrait';

export type PresetStyle = 
  | 'traditional' 
  | 'modern' 
  | 'realistic' 
  | 'artistic' 
  | 'minimalist'
  | 'festive'
  | 'professional';

export type OutputType = 
  | 'portrait' 
  | 'landscape' 
  | 'square' 
  | 'poster' 
  | 'card'
  | 'story'
  | 'banner'
  | 'wide';

// ==========================================
// COMMON FORBIDDEN ELEMENTS
// ==========================================

const FESTIVAL_FORBIDDEN = [
  'distorted human faces',
  'unnatural body proportions',
  'dark or horror themes',
  'inappropriate content',
  'cluttered messy composition',
  'cartoon style',
  'anime style',
  'low quality',
  'blurry',
];

const GENERAL_FORBIDDEN = [
  'distorted faces',
  'unnatural proportions',
  'cluttered composition',
  'oversaturated colors',
  'cartoon style',
  'low quality',
  'blurry',
];

// ==========================================
// FESTIVAL PRESETS (10) - ULTRA REALISTIC
// ==========================================

export const FESTIVAL_PRESETS: ImagePreset[] = [
  {
    id: 'festival.diwali',
    version: 2,
    name: 'Diwali – Golden Glow',
    nameHindi: 'दीपावली',
    icon: '🪔',
    category: 'festival',
    description: 'Beautiful Diwali celebration with diyas',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Diwali celebration scene, traditional brass diyas with flickering flames arranged in artistic pattern, 
      intricate colorful rangoli with flower petals, fresh orange marigold garlands, 
      warm bokeh fairy lights in background, authentic Indian home interior with marble floor, 
      golden hour warm lighting through window, photorealistic detail, 
      RAW photo quality, cinematic depth of field, natural candlelight glow`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['brass diyas', 'rangoli', 'marigold', 'fairy lights', 'marble floor'],
    lighting: 'Warm golden diya glow with soft bokeh, natural candlelight',
    colorPalette: ['gold', 'orange', 'red', 'yellow', 'warm amber'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Festival of lights',
    outputTypes: ['square', 'portrait', 'poster', 'banner'],
    tags: ['diwali', 'deepavali', 'lights', 'indian'],
    popular: true,
    seasonal: true,
    seasonMonths: [10, 11],
  },
  {
    id: 'festival.holi',
    version: 2,
    name: 'Holi – Color Explosion',
    nameHindi: 'होली',
    icon: '🎨',
    category: 'festival',
    description: 'Vibrant Holi celebration with colors',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Holi festival scene, gulaal powder clouds frozen mid-air, 
      vibrant magenta pink, electric blue, bright yellow, neon green color powder explosion, 
      high-speed photography style capturing color particles, 
      bright sunny day with lens flare, action freeze frame, 
      photorealistic texture of powder particles, DSLR quality, 
      sharp focus on color clouds, natural daylight, studio lighting quality`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['gulaal powder', 'color explosion', 'powder particles', 'bright sky'],
    lighting: 'Bright daylight with color diffusion, high-speed flash',
    colorPalette: ['magenta', 'purple', 'electric blue', 'neon green', 'yellow'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Festival of colors',
    outputTypes: ['square', 'landscape', 'poster', 'wide'],
    tags: ['holi', 'colors', 'spring', 'indian'],
    popular: true,
    seasonal: true,
    seasonMonths: [2, 3],
  },
  {
    id: 'festival.basant_panchami',
    version: 2,
    name: 'Basant Panchami',
    nameHindi: 'बसंत पंचमी',
    icon: '🪷',
    category: 'festival',
    description: 'Spring festival with yellow theme',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Basant Panchami scene, fresh yellow mustard flower field in full bloom, 
      traditional veena instrument with intricate wood carving, 
      white lotus flowers floating in brass bowl, elegant white swan, 
      soft golden morning sunlight streaming through, 
      shallow depth of field, photorealistic flower textures, 
      RAW photo quality, natural outdoor lighting, spring morning atmosphere`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['yellow mustard flowers', 'veena', 'lotus', 'swan', 'brass bowl'],
    lighting: 'Soft golden morning sunlight, spring daylight',
    colorPalette: ['yellow', 'white', 'gold', 'saffron', 'cream'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Spring festival celebrating knowledge',
    outputTypes: ['square', 'portrait', 'poster'],
    tags: ['basant', 'spring', 'yellow', 'flowers'],
    seasonal: true,
    seasonMonths: [1, 2],
  },
  {
    id: 'festival.navratri',
    version: 2,
    name: 'Navratri – Garba Night',
    nameHindi: 'नवरात्रि',
    icon: '💃',
    category: 'festival',
    description: 'Garba and Dandiya celebration',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Navratri Garba night scene, colorful embroidered chaniya choli fabric detail, 
      polished wooden dandiya sticks with decorative patterns, 
      elaborate festive decorations with mirror work, warm string lights bokeh, 
      night festival atmosphere with multiple colored spotlights, 
      photorealistic fabric textures and embroidery detail, 
      DSLR night photography quality, cinematic lighting, motion blur dance effect`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['chaniya choli fabric', 'dandiya sticks', 'mirror work', 'string lights'],
    lighting: 'Colorful festival spotlights with warm string light bokeh',
    colorPalette: ['red', 'orange', 'pink', 'green', 'gold', 'mirror silver'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Nine nights celebration',
    outputTypes: ['square', 'landscape', 'poster', 'wide'],
    tags: ['navratri', 'garba', 'dandiya', 'dance'],
    popular: true,
    seasonal: true,
    seasonMonths: [9, 10],
  },
  {
    id: 'festival.dussehra',
    version: 2,
    name: 'Dussehra – Victory',
    nameHindi: 'दशहरा',
    icon: '🏹',
    category: 'festival',
    description: 'Ravan Dahan celebration',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Dussehra night scene, massive Ravan effigy silhouette, 
      dramatic orange and red fire flames against dark night sky, 
      colorful fireworks bursting overhead, crowd silhouettes watching, 
      intense fire glow illuminating surroundings, smoke rising, 
      photorealistic fire texture and flames, DSLR night photography, 
      long exposure firework trails, cinematic dramatic lighting`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['Ravan effigy silhouette', 'fire flames', 'fireworks', 'night sky', 'crowd silhouettes'],
    lighting: 'Dramatic fire glow with firework illumination',
    colorPalette: ['orange', 'red', 'yellow', 'dark blue', 'fire gold'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Victory of good over evil',
    outputTypes: ['landscape', 'poster', 'wide', 'banner'],
    tags: ['dussehra', 'vijayadashami', 'fire', 'victory', 'fireworks'],
    seasonal: true,
    seasonMonths: [9, 10],
  },
  {
    id: 'festival.janmashtami',
    version: 2,
    name: 'Janmashtami',
    nameHindi: 'जन्माष्टमी',
    icon: '🦚',
    category: 'festival',
    description: 'Krishna Janmashtami celebration',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Janmashtami decoration scene, ornate decorated silver cradle with flowers, 
      iridescent peacock feathers arranged artistically, traditional butter pots (makhan), 
      bamboo flute with intricate carvings, midnight puja setup with brass lamps, 
      blue and gold silk fabric draping, photorealistic textures, 
      warm diya lighting with blue accent, DSLR quality, shallow depth of field`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['silver cradle', 'peacock feathers', 'butter pots', 'flute', 'brass lamps'],
    lighting: 'Midnight diya glow with blue and gold accents',
    colorPalette: ['blue', 'gold', 'peacock green', 'yellow', 'silver'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Krishna Janmashtami celebration setup',
    outputTypes: ['square', 'portrait', 'poster'],
    tags: ['janmashtami', 'krishna', 'celebration', 'midnight'],
    popular: true,
    seasonal: true,
    seasonMonths: [8, 9],
  },
  {
    id: 'festival.ram_navami',
    version: 2,
    name: 'Ram Navami',
    nameHindi: 'राम नवमी',
    icon: '🏛️',
    category: 'festival',
    description: 'Ram Navami celebration',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Ram Navami celebration scene, grand temple interior with carved pillars, 
      fresh flower arrangements and prasad thali, divine golden sunlight rays streaming through, 
      saffron and gold silk decorations, brass bells and lamps, 
      photorealistic marble temple architecture detail, RAW photo quality, 
      volumetric light rays, spiritual serene atmosphere`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['temple pillars', 'flowers', 'prasad thali', 'light rays', 'brass lamps'],
    lighting: 'Divine golden sunlight rays through temple',
    colorPalette: ['saffron', 'gold', 'white marble', 'red'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Ram Navami temple celebration',
    outputTypes: ['square', 'portrait', 'poster'],
    tags: ['ram navami', 'temple', 'celebration'],
    seasonal: true,
    seasonMonths: [3, 4],
  },
  {
    id: 'festival.ganesh_chaturthi',
    version: 2,
    name: 'Ganesh Chaturthi',
    nameHindi: 'गणेश चतुर्थी',
    icon: '🐘',
    category: 'festival',
    description: 'Ganpati festival decoration',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Ganesh Chaturthi decoration scene, elaborate mandap with fresh flowers, 
      modak sweets arranged on silver plate, red and gold fabric draping, 
      marigold garlands and rose petals, brass aarti thali with diya, 
      festive lights bokeh in background, photorealistic flower textures, 
      warm golden lighting, DSLR quality, cinematic shallow depth of field`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['flower mandap', 'modak plate', 'marigold garlands', 'aarti thali', 'festive lights'],
    lighting: 'Festive warm lights with aarti glow',
    colorPalette: ['red', 'gold', 'orange', 'green', 'marigold yellow'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Ganesh Chaturthi festival decoration',
    outputTypes: ['square', 'portrait', 'poster'],
    tags: ['ganesh chaturthi', 'decoration', 'modak', 'festival'],
    popular: true,
    seasonal: true,
    seasonMonths: [8, 9],
  },
  {
    id: 'festival.lohri',
    version: 2,
    name: 'Lohri',
    nameHindi: 'लोहड़ी',
    icon: '🔥',
    category: 'festival',
    description: 'Punjabi bonfire celebration',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Lohri celebration scene, massive roaring bonfire with detailed flame textures, 
      traditional Punjabi dhol drum with decorative patterns, rewri and gachak sweets in basket, 
      winter night sky with visible stars, warm fire glow on surrounding faces, 
      photorealistic fire and ember particles, DSLR night photography, 
      dramatic fire lighting against dark sky, cozy winter atmosphere`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['bonfire flames', 'dhol drum', 'rewri basket', 'starry sky', 'embers'],
    lighting: 'Warm roaring bonfire glow against winter night',
    colorPalette: ['orange', 'red', 'gold', 'dark blue', 'flame yellow'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Punjabi harvest festival',
    outputTypes: ['square', 'landscape', 'poster', 'wide'],
    tags: ['lohri', 'punjabi', 'bonfire', 'winter', 'fire'],
    seasonal: true,
    seasonMonths: [1],
  },
  {
    id: 'festival.universal',
    version: 2,
    name: 'Festive Celebration',
    nameHindi: 'त्योहार',
    icon: '🎉',
    category: 'festival',
    description: 'Universal festive celebration',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic festive celebration scene, beautifully decorated home interior, 
      warm fairy lights creating soft bokeh, elegant gift boxes with ribbons, 
      traditional sweets arranged on serving plates, family gathering atmosphere, 
      warm golden interior lighting, photorealistic textures, 
      cozy welcoming ambiance, DSLR indoor photography quality, 
      shallow depth of field, happiness and togetherness mood`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['fairy lights', 'gift boxes', 'sweets plate', 'decorated interior'],
    lighting: 'Warm festive indoor lighting with soft bokeh',
    colorPalette: ['gold', 'red', 'green', 'warm white', 'cream'],
    forbiddenElements: FESTIVAL_FORBIDDEN,
    culturalNotes: 'Universal celebration',
    outputTypes: ['square', 'landscape', 'poster'],
    tags: ['eid', 'christmas', 'celebration', 'family', 'festive'],
    seasonal: true,
    seasonMonths: [12, 1],
  },
];

// ==========================================
// OCCASION PRESETS (6) - ULTRA REALISTIC
// ==========================================

export const OCCASION_PRESETS: ImagePreset[] = [
  {
    id: 'occasion.birthday',
    version: 2,
    name: 'Birthday Wish',
    nameHindi: 'जन्मदिन',
    icon: '🎂',
    category: 'occasion',
    description: 'Birthday celebration card',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic birthday celebration scene, beautifully decorated multi-tier cake with lit candles, 
      real flame candlelight glow, colorful helium balloons with glossy reflections, 
      metallic confetti scattered on table, wrapped gift boxes with satin ribbons, 
      warm party lighting with bokeh, photorealistic cake frosting textures, 
      DSLR quality, shallow depth of field, joyful celebration atmosphere`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['tiered cake', 'lit candles', 'glossy balloons', 'gift boxes', 'confetti'],
    lighting: 'Warm party lighting with candle glow and bokeh',
    colorPalette: ['pink', 'blue', 'gold', 'purple', 'silver'],
    forbiddenElements: GENERAL_FORBIDDEN,
    outputTypes: ['square', 'portrait', 'card', 'banner'],
    tags: ['birthday', 'celebration', 'cake', 'party'],
    popular: true,
  },
  {
    id: 'occasion.wedding',
    version: 2,
    name: 'Wedding Invitation',
    nameHindi: 'विवाह',
    icon: '💍',
    category: 'occasion',
    description: 'Indian wedding invitation',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic Indian wedding invitation design scene, elaborate mandap decoration with fresh flowers, 
      vibrant orange marigold garlands, intricate paisley and mehendi patterns on fabric, 
      rich golden and maroon color scheme, ornate traditional border design, 
      photorealistic flower textures and fabric detail, 
      studio product photography quality, elegant composition, space for text overlay`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['mandap flowers', 'marigold garlands', 'paisley patterns', 'ornate border'],
    lighting: 'Rich golden studio lighting',
    colorPalette: ['red', 'gold', 'maroon', 'cream', 'orange'],
    forbiddenElements: GENERAL_FORBIDDEN,
    culturalNotes: 'Traditional Indian wedding',
    outputTypes: ['portrait', 'card', 'poster'],
    tags: ['wedding', 'shaadi', 'invitation', 'indian'],
    popular: true,
  },
  {
    id: 'occasion.anniversary',
    version: 2,
    name: 'Anniversary Wish',
    nameHindi: 'सालगिरह',
    icon: '💕',
    category: 'occasion',
    description: 'Wedding anniversary',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic anniversary celebration scene, heart-shaped arrangement of fresh red roses, 
      scattered rose petals on white satin fabric, elegant white candles with soft flame glow, 
      romantic intimate setting with soft bokeh lights, champagne glasses with bubbles, 
      photorealistic rose textures and petal details, DSLR quality, 
      soft romantic candlelight, shallow depth of field, love and elegance mood`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['red roses', 'rose petals', 'candles', 'champagne', 'satin fabric'],
    lighting: 'Soft romantic candlelight with warm bokeh',
    colorPalette: ['red', 'pink', 'gold', 'white', 'cream'],
    forbiddenElements: GENERAL_FORBIDDEN,
    outputTypes: ['square', 'landscape', 'card'],
    tags: ['anniversary', 'love', 'couple', 'romantic'],
  },
  {
    id: 'occasion.thank_you',
    version: 2,
    name: 'Thank You Card',
    nameHindi: 'धन्यवाद',
    icon: '🙏',
    category: 'occasion',
    description: 'Gratitude message',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic thank you card scene, elegant floral arrangement with soft pastel flowers, 
      fresh eucalyptus leaves and baby's breath, soft cream and blush pink tones, 
      minimalist clean background, natural soft window lighting, 
      photorealistic flower textures and leaf details, studio photography quality, 
      shallow depth of field, elegant and grateful mood, space for message text`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['pastel flowers', 'eucalyptus', 'baby breath', 'soft background'],
    lighting: 'Soft natural window light',
    colorPalette: ['soft pink', 'sage green', 'cream', 'gold', 'blush'],
    forbiddenElements: GENERAL_FORBIDDEN,
    outputTypes: ['square', 'card', 'portrait'],
    tags: ['thank you', 'gratitude', 'appreciation'],
  },
  {
    id: 'occasion.congratulations',
    version: 2,
    name: 'Congratulations',
    nameHindi: 'बधाई',
    icon: '🎊',
    category: 'occasion',
    description: 'Celebration and success',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic congratulations celebration scene, golden metallic confetti falling in air, 
      elegant streamers and ribbons, shiny golden trophy with reflections, 
      luxurious black and gold theme, champagne spray frozen mid-air, 
      photorealistic metallic textures and reflections, high-speed photography style, 
      dramatic celebratory lighting, DSLR quality, triumphant achievement atmosphere`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['gold confetti', 'trophy', 'streamers', 'champagne', 'ribbons'],
    lighting: 'Bright celebratory spotlight with golden accents',
    colorPalette: ['gold', 'black', 'white', 'silver', 'champagne'],
    forbiddenElements: GENERAL_FORBIDDEN,
    outputTypes: ['square', 'landscape', 'poster', 'banner'],
    tags: ['congratulations', 'success', 'achievement'],
  },
  {
    id: 'occasion.new_year',
    version: 2,
    name: 'New Year Wish',
    nameHindi: 'नव वर्ष',
    icon: '🎆',
    category: 'occasion',
    description: 'New Year celebration',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic New Year celebration scene, spectacular fireworks bursting against midnight sky, 
      elegant clock showing midnight, champagne bottle with cork popping and bubbles, 
      golden decorations and sparklers, metallic confetti in air, 
      photorealistic firework trails and light streaks, long exposure night photography style, 
      dramatic midnight lighting, DSLR quality, festive celebration energy`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['fireworks', 'midnight clock', 'champagne', 'confetti', 'sparklers'],
    lighting: 'Night fireworks glow with sparkler light',
    colorPalette: ['gold', 'silver', 'black', 'purple', 'midnight blue'],
    forbiddenElements: GENERAL_FORBIDDEN,
    seasonal: true,
    seasonMonths: [12, 1],
    outputTypes: ['square', 'landscape', 'poster', 'banner'],
    tags: ['new year', 'fireworks', 'celebration', 'midnight'],
    popular: true,
  },
];

// ==========================================
// BUSINESS PRESETS (4) - ULTRA REALISTIC
// ==========================================

export const BUSINESS_PRESETS: ImagePreset[] = [
  {
    id: 'business.logo',
    version: 2,
    name: 'Logo Design',
    nameHindi: 'लोगो',
    icon: '💼',
    category: 'business',
    description: 'Professional logo',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-clean professional logo design, modern minimalist geometric shapes, 
      bold clean typography space, vector-style crisp edges, 
      versatile for light and dark backgrounds, negative space design, 
      scalable icon mark, professional brand identity style, 
      flat design aesthetic, high contrast, clean sharp lines`,
    baseStyle: 'ultra-clean, minimal, professional, vector style, crisp edges',
    elements: ['geometric shapes', 'clean lines', 'icon mark', 'negative space'],
    lighting: 'Clean flat design lighting',
    colorPalette: ['custom brand colors', 'professional', 'high contrast'],
    forbiddenElements: ['cluttered', 'too detailed', 'gradients', 'realistic textures'],
    outputTypes: ['square'],
    tags: ['logo', 'brand', 'business', 'corporate'],
  },
  {
    id: 'business.visiting_card',
    version: 2,
    name: 'Business Card',
    nameHindi: 'विजिटिंग कार्ड',
    icon: '🪪',
    category: 'business',
    description: 'Professional business card',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic professional business card mockup, modern minimalist layout design, 
      premium thick cardstock with subtle texture, clean typography space for name and details, 
      elegant embossed or foil accent detail, studio product photography style, 
      soft shadow on neutral background, photorealistic paper texture, 
      DSLR macro quality, professional corporate aesthetic`,
    baseStyle: 'professional, minimal, clean, premium quality',
    elements: ['card layout', 'contact space', 'logo space', 'texture detail'],
    lighting: 'Clean studio product lighting with soft shadows',
    colorPalette: ['white', 'navy', 'gold foil', 'black', 'silver'],
    forbiddenElements: GENERAL_FORBIDDEN,
    outputTypes: ['landscape', 'card'],
    tags: ['business card', 'visiting card', 'corporate'],
  },
  {
    id: 'business.poster',
    version: 2,
    name: 'Promotional Poster',
    nameHindi: 'पोस्टर',
    icon: '📢',
    category: 'business',
    description: 'Marketing poster',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic promotional poster design, bold eye-catching headline space, 
      dynamic modern composition with visual hierarchy, clear call-to-action area, 
      vibrant attention-grabbing colors, contemporary marketing aesthetic, 
      professional graphic design quality, product showcase space, 
      clean layout with balanced elements, high impact visual`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['headline space', 'CTA area', 'product space', 'visual hierarchy'],
    lighting: 'Bright attention-grabbing studio lighting',
    colorPalette: ['vibrant', 'brand colors', 'high contrast'],
    forbiddenElements: GENERAL_FORBIDDEN,
    outputTypes: ['portrait', 'poster', 'story', 'banner'],
    tags: ['poster', 'marketing', 'promotion', 'ad'],
  },
  {
    id: 'business.social_media',
    version: 2,
    name: 'Social Media Post',
    nameHindi: 'सोशल मीडिया',
    icon: '📱',
    category: 'business',
    description: 'Social media content',
    provider: ImageProvider.GPT_LOW,
    promptTemplate: `Ultra-realistic social media post design, trendy modern aesthetic for Instagram, 
      attention-grabbing scroll-stopping visual, clean text overlay space, 
      vibrant contemporary color palette, photorealistic product or lifestyle scene, 
      professional content creator quality, engaging composition, 
      DSLR quality image with graphic design elements, shareable viral potential`,
    baseStyle: SORIVA_BASE_STYLE,
    elements: ['trendy design', 'text space', 'engaging visual', 'modern aesthetic'],
    lighting: 'Bright social media friendly lighting',
    colorPalette: ['trendy', 'vibrant', 'pastel', 'contemporary'],
    forbiddenElements: GENERAL_FORBIDDEN,
    outputTypes: ['square', 'portrait', 'story'],
    tags: ['social media', 'instagram', 'facebook', 'post'],
  },
];

// ==========================================
// COMBINED EXPORTS (NO DEITY)
// ==========================================

export const ALL_PRESETS: ImagePreset[] = [
  ...FESTIVAL_PRESETS,
  ...OCCASION_PRESETS,
  ...BUSINESS_PRESETS,
];

export const PRESETS_BY_CATEGORY = {
  festival: FESTIVAL_PRESETS,
  occasion: OCCASION_PRESETS,
  business: BUSINESS_PRESETS,
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get preset by ID
 */
export function getPresetById(presetId: string): ImagePreset | undefined {
  return ALL_PRESETS.find(p => p.id === presetId);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: PresetCategory): ImagePreset[] {
  return ALL_PRESETS.filter(p => p.category === category);
}

/**
 * Get popular presets
 */
export function getPopularPresets(): ImagePreset[] {
  return ALL_PRESETS.filter(p => p.popular);
}

/**
 * Get seasonal presets for current month
 */
export function getSeasonalPresets(): ImagePreset[] {
  const currentMonth = new Date().getMonth() + 1;
  return ALL_PRESETS.filter(p => 
    p.seasonal && p.seasonMonths?.includes(currentMonth)
  );
}

/**
 * Build final prompt with preset + base style + user customization
 */
export function buildPresetPrompt(
  preset: ImagePreset, 
  userCustomization?: string
): string {
  let finalPrompt = preset.promptTemplate.trim();
  
  // Add base style
  if (preset.baseStyle) {
    finalPrompt = `${finalPrompt}, ${preset.baseStyle}`;
  }
  
  // Add quality suffix
  finalPrompt = `${finalPrompt}, ${SORIVA_QUALITY_SUFFIX}`;
  
  // Add user customization
  if (userCustomization?.trim()) {
    finalPrompt = `${finalPrompt}. Additional: ${userCustomization.trim()}`;
  }
  
  // Add forbidden elements as negative prompt hint
  if (preset.forbiddenElements?.length) {
    finalPrompt = `${finalPrompt}. Avoid: ${preset.forbiddenElements.slice(0, 5).join(', ')}`;
  }
  
  return finalPrompt;
}

/**
 * Get preset summary for frontend
 */
export function getPresetSummary(preset: ImagePreset) {
  return {
    id: preset.id,
    version: preset.version,
    name: preset.name,
    nameHindi: preset.nameHindi,
    icon: preset.icon,
    category: preset.category,
    description: preset.description,
    popular: preset.popular,
    seasonal: preset.seasonal,
    outputTypes: preset.outputTypes,
  };
}

/**
 * Get all presets summary for frontend
 */
export function getAllPresetsSummary() {
  return ALL_PRESETS.map(getPresetSummary);
}