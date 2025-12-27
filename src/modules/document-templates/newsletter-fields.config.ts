/**
 * SORIVA - Newsletter Fields Configuration
 * Category: newsletter
 * Types: company, product-update, event, digest, promotional
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type NewsletterTemplateType =
  | 'company'
  | 'product-update'
  | 'event'
  | 'digest'
  | 'promotional';

export type NewsletterFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

// ============================================================================
// INTERFACES
// ============================================================================

export interface NewsletterBrand {
  name: string;
  logo?: string;
  tagline?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface NewsletterArticle {
  title: string;
  summary?: string;
  content?: string;
  image?: string;
  author?: string;
  date?: string;
  category?: string;
  readMoreUrl?: string;
}

export interface NewsletterEvent {
  title: string;
  date: string;
  time?: string;
  venue?: string;
  description?: string;
  registerUrl?: string;
  image?: string;
}

export interface NewsletterProduct {
  name: string;
  description?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  features?: string[];
  ctaText?: string;
  ctaUrl?: string;
  badge?: string;
}

export interface NewsletterLink {
  title: string;
  url: string;
  description?: string;
  source?: string;
}

export interface NewsletterSocial {
  platform: string;
  url: string;
  icon?: string;
}

export interface NewsletterCTA {
  text: string;
  url: string;
  style?: 'primary' | 'secondary' | 'outline';
}

export interface NewsletterData {
  // Template Type
  templateType: NewsletterTemplateType;

  // Basic Info
  issueNumber?: string;
  issueDate: string;
  subject: string;
  preheader?: string;

  // Brand Info
  brand: NewsletterBrand;

  // Header
  headerImage?: string;
  headerTitle?: string;
  headerSubtitle?: string;

  // Greeting
  greeting?: string;
  personalMessage?: string;

  // Main Content
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroCTA?: NewsletterCTA;

  // Articles/Stories
  featuredArticle?: NewsletterArticle;
  articles?: NewsletterArticle[];

  // Sections
  sections?: {
    title: string;
    content: string;
    image?: string;
  }[];

  // Events
  upcomingEvents?: NewsletterEvent[];

  // Products (for promotional/product-update)
  featuredProduct?: NewsletterProduct;
  products?: NewsletterProduct[];

  // Links/Resources
  quickLinks?: NewsletterLink[];
  resources?: NewsletterLink[];

  // Highlights/Stats
  highlights?: {
    label: string;
    value: string;
    icon?: string;
  }[];

  // Quote/Testimonial
  quote?: {
    text: string;
    author: string;
    role?: string;
    image?: string;
  };

  // Digest Items
  digestItems?: {
    category: string;
    items: NewsletterLink[];
  }[];

  // Promotional
  offerTitle?: string;
  offerDescription?: string;
  offerCode?: string;
  offerExpiry?: string;
  discountPercent?: number;

  // Footer
  footerMessage?: string;
  socialLinks?: NewsletterSocial[];
  unsubscribeUrl?: string;
  preferencesUrl?: string;

  // Styling
  accentColor?: string;
  backgroundColor?: string;
  showLogo?: boolean;
  showSocialLinks?: boolean;
  showUnsubscribe?: boolean;
}

// ============================================================================
// FIELD DEFINITIONS
// ============================================================================

export const newsletterFieldDefinitions = {
  // --------------------------------------------------------------------------
  // Basic Information
  // --------------------------------------------------------------------------
  templateType: {
    id: 'templateType',
    label: 'Newsletter Type',
    labelHindi: 'न्यूज़लेटर प्रकार',
    type: 'select',
    required: true,
    options: [
      { value: 'company', label: 'Company Newsletter' },
      { value: 'product-update', label: 'Product Update' },
      { value: 'event', label: 'Event Newsletter' },
      { value: 'digest', label: 'Digest / Roundup' },
      { value: 'promotional', label: 'Promotional' },
    ],
  },

  issueNumber: {
    id: 'issueNumber',
    label: 'Issue Number',
    labelHindi: 'अंक संख्या',
    type: 'text',
    required: false,
    placeholder: 'e.g., Issue #42',
  },

  issueDate: {
    id: 'issueDate',
    label: 'Issue Date',
    labelHindi: 'अंक तिथि',
    type: 'date',
    required: true,
  },

  subject: {
    id: 'subject',
    label: 'Subject Line',
    labelHindi: 'विषय',
    type: 'text',
    required: true,
    placeholder: 'Newsletter subject',
    maxLength: 100,
  },

  preheader: {
    id: 'preheader',
    label: 'Preheader Text',
    labelHindi: 'प्रीहेडर',
    type: 'text',
    required: false,
    placeholder: 'Preview text shown in inbox',
    maxLength: 150,
  },

  // --------------------------------------------------------------------------
  // Brand Information
  // --------------------------------------------------------------------------
  'brand.name': {
    id: 'brand.name',
    label: 'Brand/Company Name',
    labelHindi: 'ब्रांड/कंपनी का नाम',
    type: 'text',
    required: true,
  },

  'brand.logo': {
    id: 'brand.logo',
    label: 'Logo',
    labelHindi: 'लोगो',
    type: 'image',
    required: false,
  },

  'brand.tagline': {
    id: 'brand.tagline',
    label: 'Tagline',
    labelHindi: 'टैगलाइन',
    type: 'text',
    required: false,
  },

  'brand.website': {
    id: 'brand.website',
    label: 'Website',
    labelHindi: 'वेबसाइट',
    type: 'url',
    required: false,
  },

  'brand.email': {
    id: 'brand.email',
    label: 'Email',
    labelHindi: 'ईमेल',
    type: 'email',
    required: false,
  },

  'brand.address': {
    id: 'brand.address',
    label: 'Address',
    labelHindi: 'पता',
    type: 'textarea',
    required: false,
    rows: 2,
  },

  // --------------------------------------------------------------------------
  // Header
  // --------------------------------------------------------------------------
  headerImage: {
    id: 'headerImage',
    label: 'Header Image',
    labelHindi: 'हेडर इमेज',
    type: 'image',
    required: false,
  },

  headerTitle: {
    id: 'headerTitle',
    label: 'Header Title',
    labelHindi: 'हेडर शीर्षक',
    type: 'text',
    required: false,
  },

  headerSubtitle: {
    id: 'headerSubtitle',
    label: 'Header Subtitle',
    labelHindi: 'हेडर उपशीर्षक',
    type: 'text',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Greeting
  // --------------------------------------------------------------------------
  greeting: {
    id: 'greeting',
    label: 'Greeting',
    labelHindi: 'अभिवादन',
    type: 'text',
    required: false,
    placeholder: 'e.g., Hello Team!',
  },

  personalMessage: {
    id: 'personalMessage',
    label: 'Personal Message',
    labelHindi: 'व्यक्तिगत संदेश',
    type: 'richtext',
    required: false,
    rows: 4,
  },

  // --------------------------------------------------------------------------
  // Hero Section
  // --------------------------------------------------------------------------
  heroTitle: {
    id: 'heroTitle',
    label: 'Hero Title',
    labelHindi: 'मुख्य शीर्षक',
    type: 'text',
    required: false,
  },

  heroSubtitle: {
    id: 'heroSubtitle',
    label: 'Hero Subtitle',
    labelHindi: 'मुख्य उपशीर्षक',
    type: 'textarea',
    required: false,
    rows: 2,
  },

  heroImage: {
    id: 'heroImage',
    label: 'Hero Image',
    labelHindi: 'मुख्य इमेज',
    type: 'image',
    required: false,
  },

  heroCTA: {
    id: 'heroCTA',
    label: 'Hero CTA Button',
    labelHindi: 'मुख्य CTA बटन',
    type: 'object',
    required: false,
    fields: ['text', 'url'],
  },

  // --------------------------------------------------------------------------
  // Articles
  // --------------------------------------------------------------------------
  featuredArticle: {
    id: 'featuredArticle',
    label: 'Featured Article',
    labelHindi: 'फीचर्ड आर्टिकल',
    type: 'object',
    required: false,
    fields: ['title', 'summary', 'image', 'author', 'readMoreUrl'],
  },

  articles: {
    id: 'articles',
    label: 'Articles',
    labelHindi: 'आर्टिकल्स',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['title', 'summary', 'image', 'category', 'readMoreUrl'],
  },

  // --------------------------------------------------------------------------
  // Sections
  // --------------------------------------------------------------------------
  sections: {
    id: 'sections',
    label: 'Content Sections',
    labelHindi: 'कंटेंट सेक्शन',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['title', 'content', 'image'],
  },

  // --------------------------------------------------------------------------
  // Events
  // --------------------------------------------------------------------------
  upcomingEvents: {
    id: 'upcomingEvents',
    label: 'Upcoming Events',
    labelHindi: 'आगामी इवेंट',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['title', 'date', 'time', 'venue', 'description', 'registerUrl'],
  },

  // --------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------
  featuredProduct: {
    id: 'featuredProduct',
    label: 'Featured Product',
    labelHindi: 'फीचर्ड प्रोडक्ट',
    type: 'object',
    required: false,
    fields: ['name', 'description', 'image', 'price', 'features', 'ctaUrl'],
  },

  products: {
    id: 'products',
    label: 'Products',
    labelHindi: 'प्रोडक्ट्स',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['name', 'description', 'image', 'price', 'originalPrice', 'badge', 'ctaUrl'],
  },

  // --------------------------------------------------------------------------
  // Links/Resources
  // --------------------------------------------------------------------------
  quickLinks: {
    id: 'quickLinks',
    label: 'Quick Links',
    labelHindi: 'क्विक लिंक्स',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['title', 'url', 'description'],
  },

  resources: {
    id: 'resources',
    label: 'Resources',
    labelHindi: 'रिसोर्सेज',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['title', 'url', 'description', 'source'],
  },

  // --------------------------------------------------------------------------
  // Highlights
  // --------------------------------------------------------------------------
  highlights: {
    id: 'highlights',
    label: 'Highlights/Stats',
    labelHindi: 'हाइलाइट्स/स्टैट्स',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['label', 'value', 'icon'],
  },

  // --------------------------------------------------------------------------
  // Quote
  // --------------------------------------------------------------------------
  quote: {
    id: 'quote',
    label: 'Quote/Testimonial',
    labelHindi: 'कोट/प्रशंसापत्र',
    type: 'object',
    required: false,
    fields: ['text', 'author', 'role'],
  },

  // --------------------------------------------------------------------------
  // Digest Items
  // --------------------------------------------------------------------------
  digestItems: {
    id: 'digestItems',
    label: 'Digest Categories',
    labelHindi: 'डाइजेस्ट श्रेणियां',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['category', 'items'],
  },

  // --------------------------------------------------------------------------
  // Promotional
  // --------------------------------------------------------------------------
  offerTitle: {
    id: 'offerTitle',
    label: 'Offer Title',
    labelHindi: 'ऑफर शीर्षक',
    type: 'text',
    required: false,
  },

  offerDescription: {
    id: 'offerDescription',
    label: 'Offer Description',
    labelHindi: 'ऑफर विवरण',
    type: 'textarea',
    required: false,
    rows: 3,
  },

  offerCode: {
    id: 'offerCode',
    label: 'Offer Code',
    labelHindi: 'ऑफर कोड',
    type: 'text',
    required: false,
    placeholder: 'e.g., SAVE20',
  },

  offerExpiry: {
    id: 'offerExpiry',
    label: 'Offer Expiry',
    labelHindi: 'ऑफर समाप्ति',
    type: 'date',
    required: false,
  },

  discountPercent: {
    id: 'discountPercent',
    label: 'Discount %',
    labelHindi: 'छूट %',
    type: 'number',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Footer
  // --------------------------------------------------------------------------
  footerMessage: {
    id: 'footerMessage',
    label: 'Footer Message',
    labelHindi: 'फुटर संदेश',
    type: 'textarea',
    required: false,
    rows: 2,
  },

  socialLinks: {
    id: 'socialLinks',
    label: 'Social Links',
    labelHindi: 'सोशल लिंक्स',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['platform', 'url'],
  },

  unsubscribeUrl: {
    id: 'unsubscribeUrl',
    label: 'Unsubscribe URL',
    labelHindi: 'अनसब्सक्राइब URL',
    type: 'url',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Styling
  // --------------------------------------------------------------------------
  accentColor: {
    id: 'accentColor',
    label: 'Accent Color',
    labelHindi: 'एक्सेंट रंग',
    type: 'color',
    required: false,
    default: '#2563eb',
  },

  backgroundColor: {
    id: 'backgroundColor',
    label: 'Background Color',
    labelHindi: 'बैकग्राउंड रंग',
    type: 'color',
    required: false,
    default: '#f8fafc',
  },

  showLogo: {
    id: 'showLogo',
    label: 'Show Logo',
    labelHindi: 'लोगो दिखाएं',
    type: 'checkbox',
    required: false,
    default: true,
  },

  showSocialLinks: {
    id: 'showSocialLinks',
    label: 'Show Social Links',
    labelHindi: 'सोशल लिंक्स दिखाएं',
    type: 'checkbox',
    required: false,
    default: true,
  },

  showUnsubscribe: {
    id: 'showUnsubscribe',
    label: 'Show Unsubscribe',
    labelHindi: 'अनसब्सक्राइब दिखाएं',
    type: 'checkbox',
    required: false,
    default: true,
  },
};

// ============================================================================
// TEMPLATE CONFIGURATIONS
// ============================================================================

export const newsletterTemplateConfigs: Record<
  NewsletterTemplateType,
  {
    name: string;
    nameHindi: string;
    description: string;
    icon: string;
    sections: string[];
    recommendedFor: string[];
  }
> = {
  company: {
    name: 'Company Newsletter',
    nameHindi: 'कंपनी न्यूज़लेटर',
    description: 'Internal or external company updates and news',
    icon: '🏢',
    sections: ['header', 'greeting', 'featuredArticle', 'articles', 'highlights', 'events', 'footer'],
    recommendedFor: ['Monthly updates', 'Company news', 'Team announcements'],
  },

  'product-update': {
    name: 'Product Update',
    nameHindi: 'प्रोडक्ट अपडेट',
    description: 'New features, releases, and product announcements',
    icon: '🚀',
    sections: ['header', 'hero', 'features', 'changelog', 'cta', 'footer'],
    recommendedFor: ['Feature launches', 'Version releases', 'Product changelog'],
  },

  event: {
    name: 'Event Newsletter',
    nameHindi: 'इवेंट न्यूज़लेटर',
    description: 'Event announcements, invitations, and recaps',
    icon: '🎪',
    sections: ['header', 'hero', 'eventDetails', 'agenda', 'speakers', 'registration', 'footer'],
    recommendedFor: ['Webinars', 'Conferences', 'Meetups', 'Workshops'],
  },

  digest: {
    name: 'Digest / Roundup',
    nameHindi: 'डाइजेस्ट / राउंडअप',
    description: 'Curated links, articles, and resources',
    icon: '📰',
    sections: ['header', 'greeting', 'categories', 'links', 'quote', 'footer'],
    recommendedFor: ['Weekly digest', 'Industry news', 'Curated content'],
  },

  promotional: {
    name: 'Promotional',
    nameHindi: 'प्रमोशनल',
    description: 'Sales, offers, and marketing campaigns',
    icon: '🎁',
    sections: ['header', 'hero', 'offer', 'products', 'cta', 'footer'],
    recommendedFor: ['Sales', 'Discounts', 'Product launches', 'Seasonal offers'],
  },
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const newsletterSampleData: Record<NewsletterTemplateType, Partial<NewsletterData>> = {
  company: {
    templateType: 'company',
    issueNumber: 'Issue #24',
    issueDate: '2024-12-16',
    subject: 'TechVentures Monthly: December Updates & Year in Review',
    preheader: 'A look back at our achievements and what\'s coming next',
    brand: {
      name: 'TechVentures Solutions',
      tagline: 'Transforming Businesses Through Technology',
      website: 'www.techventures.in',
      email: 'hello@techventures.in',
    },
    greeting: 'Hello Team! 👋',
    personalMessage: 'As we wrap up an incredible year, I wanted to take a moment to thank each one of you for your dedication and hard work. Together, we\'ve achieved remarkable milestones that have positioned us for even greater success in the coming year.',
    featuredArticle: {
      title: 'TechVentures Wins Best Workplace Award 2024',
      summary: 'We are thrilled to announce that TechVentures has been recognized as one of the Best Workplaces in India by Great Place to Work Institute.',
      image: 'https://via.placeholder.com/600x300',
      author: 'HR Team',
      readMoreUrl: '#',
    },
    articles: [
      {
        title: 'New Bangalore Office Opening',
        summary: 'Expanding our footprint with a state-of-the-art facility in Whitefield.',
        category: 'Expansion',
        readMoreUrl: '#',
      },
      {
        title: 'Q4 Revenue Exceeds Targets',
        summary: 'Strong performance across all business units drives record quarterly results.',
        category: 'Finance',
        readMoreUrl: '#',
      },
      {
        title: 'Employee Wellness Program Launch',
        summary: 'Introducing comprehensive health and wellness benefits for all team members.',
        category: 'HR',
        readMoreUrl: '#',
      },
    ],
    highlights: [
      { label: 'Team Members', value: '500+', icon: '👥' },
      { label: 'Clients Served', value: '120', icon: '🤝' },
      { label: 'Projects Delivered', value: '85', icon: '✅' },
      { label: 'Revenue Growth', value: '45%', icon: '📈' },
    ],
    upcomingEvents: [
      {
        title: 'Annual Town Hall 2025',
        date: '2025-01-15',
        time: '10:00 AM',
        venue: 'Main Auditorium',
        description: 'Join us for the annual town hall to discuss 2025 goals and strategy.',
      },
    ],
    socialLinks: [
      { platform: 'LinkedIn', url: '#' },
      { platform: 'Twitter', url: '#' },
      { platform: 'Instagram', url: '#' },
    ],
    accentColor: '#2563eb',
    showLogo: true,
  },

  'product-update': {
    templateType: 'product-update',
    issueNumber: 'v2.5.0',
    issueDate: '2024-12-16',
    subject: '🚀 Soriva 2.5 is Here: AI Voice, Document Intelligence & More!',
    preheader: 'The biggest update yet with revolutionary AI features',
    brand: {
      name: 'Soriva',
      tagline: 'Your AI-Powered Assistant',
      website: 'www.soriva.in',
    },
    heroTitle: 'Introducing Soriva 2.5',
    heroSubtitle: 'The most intelligent, feature-packed update yet. Experience the future of AI assistance.',
    heroImage: 'https://via.placeholder.com/600x300',
    heroCTA: {
      text: 'Try It Now',
      url: '#',
    },
    sections: [
      {
        title: '🎙️ AI Voice Conversations',
        content: 'Talk to Soriva naturally with our new voice interface. Powered by advanced speech recognition, you can now have fluid conversations in Hindi and English.',
      },
      {
        title: '📄 Document Intelligence',
        content: 'Upload any document and let Soriva analyze, summarize, and answer questions about it. Supports PDF, Word, Excel, and more.',
      },
      {
        title: '🎨 Creative Studio',
        content: 'Generate stunning images, edit photos, and create visual content with our new AI-powered creative tools.',
      },
    ],
    highlights: [
      { label: 'New Features', value: '15+', icon: '✨' },
      { label: 'Performance', value: '2x Faster', icon: '⚡' },
      { label: 'Languages', value: '10+', icon: '🌐' },
    ],
    quickLinks: [
      { title: 'Release Notes', url: '#', description: 'Full changelog' },
      { title: 'Documentation', url: '#', description: 'Updated guides' },
      { title: 'Video Tutorial', url: '#', description: 'See it in action' },
    ],
    accentColor: '#8b5cf6',
    showLogo: true,
  },

  event: {
    templateType: 'event',
    issueDate: '2024-12-16',
    subject: '🎪 You\'re Invited: TechSummit India 2025',
    preheader: 'Join 5000+ tech leaders on March 15, 2025',
    brand: {
      name: 'TechSummit India',
      website: 'www.techsummitindia.com',
    },
    heroTitle: 'TechSummit India 2025',
    heroSubtitle: 'The premier technology conference bringing together innovators, leaders, and changemakers.',
    heroImage: 'https://via.placeholder.com/600x300',
    heroCTA: {
      text: 'Register Now - Early Bird ₹2,999',
      url: '#',
    },
    upcomingEvents: [
      {
        title: 'TechSummit India 2025',
        date: '15 March 2025',
        time: '9:00 AM - 6:00 PM',
        venue: 'Pragati Maidan, New Delhi',
        description: 'A full day of keynotes, workshops, networking, and innovation showcases.',
        registerUrl: '#',
      },
    ],
    sections: [
      {
        title: '🎤 World-Class Speakers',
        content: 'Learn from CTOs, founders, and tech leaders from top companies including Google, Microsoft, Flipkart, and more.',
      },
      {
        title: '🛠️ Hands-on Workshops',
        content: 'Deep-dive into AI, Cloud, DevOps, and emerging technologies with expert-led workshops.',
      },
      {
        title: '🤝 Networking',
        content: 'Connect with 5000+ attendees, potential partners, and industry peers.',
      },
    ],
    highlights: [
      { label: 'Speakers', value: '50+', icon: '🎤' },
      { label: 'Workshops', value: '20+', icon: '🛠️' },
      { label: 'Attendees', value: '5000+', icon: '👥' },
      { label: 'Companies', value: '200+', icon: '🏢' },
    ],
    accentColor: '#0891b2',
    showLogo: true,
  },

  digest: {
    templateType: 'digest',
    issueNumber: 'Week 50',
    issueDate: '2024-12-16',
    subject: '📰 Weekly Tech Digest: AI Breakthroughs, Startup News & More',
    preheader: 'Your curated dose of tech news and insights',
    brand: {
      name: 'Tech Insider Weekly',
      tagline: 'Curated Tech News for Busy Professionals',
    },
    greeting: 'Happy Monday! ☕',
    personalMessage: 'Here\'s your weekly roundup of the most important tech news, hand-picked by our editorial team. Grab your coffee and let\'s dive in!',
    digestItems: [
      {
        category: '🤖 AI & Machine Learning',
        items: [
          { title: 'OpenAI Announces GPT-5 Preview', url: '#', source: 'TechCrunch' },
          { title: 'Google DeepMind\'s New Climate Model', url: '#', source: 'Wired' },
          { title: 'India\'s AI Startup Ecosystem Grows 40%', url: '#', source: 'Economic Times' },
        ],
      },
      {
        category: '🚀 Startups & Funding',
        items: [
          { title: 'Zerodha Crosses ₹10,000 Cr Revenue', url: '#', source: 'Mint' },
          { title: 'New Unicorn: EdTech Startup Raises $200M', url: '#', source: 'Inc42' },
          { title: 'YC Winter 2025 Batch Announced', url: '#', source: 'YCombinator' },
        ],
      },
      {
        category: '💻 Development & Tools',
        items: [
          { title: 'React 19 Released with New Features', url: '#', source: 'React Blog' },
          { title: 'GitHub Copilot Gets Workspace Support', url: '#', source: 'GitHub' },
          { title: 'Bun 1.1: Even Faster JavaScript Runtime', url: '#', source: 'Bun Blog' },
        ],
      },
    ],
    quote: {
      text: 'The best way to predict the future is to invent it.',
      author: 'Alan Kay',
      role: 'Computer Scientist',
    },
    accentColor: '#f59e0b',
    showLogo: true,
  },

  promotional: {
    templateType: 'promotional',
    issueDate: '2024-12-16',
    subject: '🎁 Year-End Sale: Up to 50% Off on All Plans!',
    preheader: 'Limited time offer - Ends December 31st',
    brand: {
      name: 'CloudHost India',
      tagline: 'Reliable Cloud Hosting for India',
      website: 'www.cloudhost.in',
    },
    heroTitle: 'Year-End Mega Sale! 🎉',
    heroSubtitle: 'Upgrade your hosting and save big. Our biggest sale of the year ends soon!',
    heroImage: 'https://via.placeholder.com/600x300',
    heroCTA: {
      text: 'Shop Now →',
      url: '#',
    },
    offerTitle: 'Flat 50% Off',
    offerDescription: 'Use code YEAR50 at checkout to get 50% off on all annual plans. Valid on new purchases only.',
    offerCode: 'YEAR50',
    offerExpiry: '2024-12-31',
    discountPercent: 50,
    products: [
      {
        name: 'Starter Plan',
        description: 'Perfect for personal websites',
        price: 149,
        originalPrice: 299,
        features: ['5GB SSD Storage', '1 Website', 'Free SSL', '24/7 Support'],
        badge: '50% OFF',
        ctaUrl: '#',
      },
      {
        name: 'Business Plan',
        description: 'Ideal for growing businesses',
        price: 399,
        originalPrice: 799,
        features: ['50GB SSD Storage', '10 Websites', 'Free SSL', 'Daily Backups', 'Priority Support'],
        badge: 'BEST SELLER',
        ctaUrl: '#',
      },
      {
        name: 'Enterprise Plan',
        description: 'For high-traffic applications',
        price: 999,
        originalPrice: 1999,
        features: ['200GB SSD Storage', 'Unlimited Websites', 'Free SSL', 'Hourly Backups', 'Dedicated Support'],
        badge: '50% OFF',
        ctaUrl: '#',
      },
    ],
    highlights: [
      { label: 'Uptime', value: '99.99%', icon: '✅' },
      { label: 'Customers', value: '50,000+', icon: '👥' },
      { label: 'Data Centers', value: '3 India', icon: '🏢' },
    ],
    accentColor: '#dc2626',
    showLogo: true,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getFieldsForNewsletterType(type: NewsletterTemplateType): string[] {
  const commonFields = [
    'templateType', 'issueNumber', 'issueDate', 'subject', 'preheader',
    'brand.name', 'brand.logo', 'brand.website',
    'accentColor', 'showLogo', 'showSocialLinks',
  ];

  const typeSpecificFields: Record<NewsletterTemplateType, string[]> = {
    company: [...commonFields, 'greeting', 'personalMessage', 'featuredArticle', 'articles', 'highlights', 'upcomingEvents', 'socialLinks', 'footerMessage'],
    'product-update': [...commonFields, 'heroTitle', 'heroSubtitle', 'heroImage', 'heroCTA', 'sections', 'highlights', 'quickLinks'],
    event: [...commonFields, 'heroTitle', 'heroSubtitle', 'heroImage', 'heroCTA', 'upcomingEvents', 'sections', 'highlights'],
    digest: [...commonFields, 'greeting', 'personalMessage', 'digestItems', 'quote', 'socialLinks'],
    promotional: [...commonFields, 'heroTitle', 'heroSubtitle', 'heroImage', 'heroCTA', 'offerTitle', 'offerDescription', 'offerCode', 'offerExpiry', 'discountPercent', 'products', 'highlights'],
  };

  return typeSpecificFields[type] || commonFields;
}

export function getSampleData(type: NewsletterTemplateType): Partial<NewsletterData> {
  return newsletterSampleData[type];
}

export function getTemplateInfo(type: NewsletterTemplateType) {
  return newsletterTemplateConfigs[type];
}

export function generateIssueNumber(frequency: NewsletterFrequency, sequence: number = 1): string {
  const prefixMap: Record<NewsletterFrequency, string> = {
    daily: 'Day',
    weekly: 'Week',
    biweekly: 'Issue',
    monthly: 'Issue',
    quarterly: 'Q',
  };

  return `${prefixMap[frequency]} #${sequence}`;
}

export function validateNewsletterData(data: Partial<NewsletterData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.templateType) errors.push('Newsletter type is required');
  if (!data.subject) errors.push('Subject line is required');
  if (!data.issueDate) errors.push('Issue date is required');
  if (!data.brand?.name) errors.push('Brand name is required');

  return { valid: errors.length === 0, errors };
}