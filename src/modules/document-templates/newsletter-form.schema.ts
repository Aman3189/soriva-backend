/**
 * SORIVA - Newsletter Form Schema (LEAN)
 * Category: newsletter
 * Pattern: Reusable field arrays + minimal step definitions
 */

// ============================================================================
// ENUM
// ============================================================================

export enum NewsletterType {
  COMPANY = 'company',
  PRODUCT_UPDATE = 'product-update',
  EVENT = 'event',
  DIGEST = 'digest',
  PROMOTIONAL = 'promotional',
}

// ============================================================================
// REUSABLE FIELD ARRAYS
// ============================================================================

const F = {
  // Basic
  basic: ['templateType', 'issueNumber', 'issueDate', 'subject', 'preheader'],
  basicSimple: ['templateType', 'issueDate', 'subject'],

  // Brand
  brand: ['brand.name', 'brand.logo', 'brand.tagline', 'brand.website', 'brand.email', 'brand.address'],
  brandSimple: ['brand.name', 'brand.logo', 'brand.website'],

  // Header
  header: ['headerImage', 'headerTitle', 'headerSubtitle'],

  // Greeting
  greeting: ['greeting', 'personalMessage'],

  // Hero
  hero: ['heroTitle', 'heroSubtitle', 'heroImage', 'heroCTA'],
  heroSimple: ['heroTitle', 'heroSubtitle', 'heroImage'],

  // Articles
  articles: ['featuredArticle', 'articles'],
  articlesSimple: ['articles'],

  // Sections
  sections: ['sections'],

  // Events
  events: ['upcomingEvents'],

  // Products
  products: ['featuredProduct', 'products'],
  productsSimple: ['products'],

  // Links
  links: ['quickLinks', 'resources'],
  linksSimple: ['quickLinks'],

  // Highlights
  highlights: ['highlights'],

  // Quote
  quote: ['quote'],

  // Digest
  digest: ['digestItems'],

  // Promotional
  offer: ['offerTitle', 'offerDescription', 'offerCode', 'offerExpiry', 'discountPercent'],

  // Footer
  footer: ['footerMessage', 'socialLinks', 'unsubscribeUrl'],
  footerSimple: ['socialLinks', 'unsubscribeUrl'],

  // Styling
  styling: ['accentColor', 'backgroundColor', 'showLogo', 'showSocialLinks', 'showUnsubscribe'],
  stylingSimple: ['accentColor', 'showLogo', 'showSocialLinks'],
};

// ============================================================================
// FORM SCHEMAS
// ============================================================================

export const newsletterFormSchemas = {
  // --------------------------------------------------------------------------
  // Company Newsletter
  // --------------------------------------------------------------------------
  [NewsletterType.COMPANY]: {
    id: 'company',
    title: 'Company Newsletter',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basic },
      { id: 'brand', title: 'Brand', fields: F.brandSimple },
      { id: 'greeting', title: 'Greeting', fields: F.greeting },
      { id: 'featured', title: 'Featured Article', fields: ['featuredArticle'] },
      { id: 'articles', title: 'More Articles', fields: ['articles'] },
      { id: 'highlights', title: 'Highlights', fields: F.highlights },
      { id: 'events', title: 'Upcoming Events', fields: F.events },
      { id: 'footer', title: 'Footer', fields: F.footer },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Product Update
  // --------------------------------------------------------------------------
  [NewsletterType.PRODUCT_UPDATE]: {
    id: 'product-update',
    title: 'Product Update',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'brand', title: 'Brand', fields: F.brandSimple },
      { id: 'hero', title: 'Hero Section', fields: F.hero },
      { id: 'features', title: 'New Features', fields: F.sections },
      { id: 'highlights', title: 'Stats', fields: F.highlights },
      { id: 'links', title: 'Resources', fields: F.linksSimple },
      { id: 'footer', title: 'Footer', fields: F.footerSimple },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Event Newsletter
  // --------------------------------------------------------------------------
  [NewsletterType.EVENT]: {
    id: 'event',
    title: 'Event Newsletter',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'brand', title: 'Organizer', fields: F.brandSimple },
      { id: 'hero', title: 'Event Hero', fields: F.hero },
      { id: 'event', title: 'Event Details', fields: F.events },
      { id: 'agenda', title: 'Agenda/Sections', fields: F.sections },
      { id: 'highlights', title: 'Stats', fields: F.highlights },
      { id: 'footer', title: 'Footer', fields: F.footerSimple },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Digest / Roundup
  // --------------------------------------------------------------------------
  [NewsletterType.DIGEST]: {
    id: 'digest',
    title: 'Digest / Roundup',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basic },
      { id: 'brand', title: 'Brand', fields: F.brandSimple },
      { id: 'greeting', title: 'Greeting', fields: F.greeting },
      { id: 'digest', title: 'Digest Categories', fields: F.digest },
      { id: 'quote', title: 'Quote', fields: F.quote },
      { id: 'footer', title: 'Footer', fields: F.footer },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Promotional
  // --------------------------------------------------------------------------
  [NewsletterType.PROMOTIONAL]: {
    id: 'promotional',
    title: 'Promotional',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'brand', title: 'Brand', fields: F.brandSimple },
      { id: 'hero', title: 'Hero Banner', fields: F.hero },
      { id: 'offer', title: 'Offer Details', fields: F.offer },
      { id: 'products', title: 'Products', fields: F.productsSimple },
      { id: 'highlights', title: 'Trust Badges', fields: F.highlights },
      { id: 'footer', title: 'Footer', fields: F.footerSimple },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getNewsletterForm(type: NewsletterType) {
  return newsletterFormSchemas[type];
}

export function getNewsletterStep(type: NewsletterType, stepId: string) {
  const form = newsletterFormSchemas[type];
  return form?.steps.find((s) => s.id === stepId);
}

export function getNewsletterFields(type: NewsletterType): string[] {
  const form = newsletterFormSchemas[type];
  if (!form) return [];
  return form.steps.flatMap((step) => step.fields);
}

export function getNewsletterStepCount(type: NewsletterType): number {
  return newsletterFormSchemas[type]?.steps.length || 0;
}

export function getNewsletterTypes(): { value: NewsletterType; label: string }[] {
  return [
    { value: NewsletterType.COMPANY, label: 'Company Newsletter' },
    { value: NewsletterType.PRODUCT_UPDATE, label: 'Product Update' },
    { value: NewsletterType.EVENT, label: 'Event Newsletter' },
    { value: NewsletterType.DIGEST, label: 'Digest / Roundup' },
    { value: NewsletterType.PROMOTIONAL, label: 'Promotional' },
  ];
}

// ============================================================================
// AUTO-SUGGEST
// ============================================================================

export function suggestNewsletterType(context: {
  isInternal?: boolean;
  isProduct?: boolean;
  isEvent?: boolean;
  isCurated?: boolean;
  isSales?: boolean;
  keywords?: string[];
}): NewsletterType {
  const { isInternal, isProduct, isEvent, isCurated, isSales, keywords = [] } = context;
  const kw = keywords.map((k) => k.toLowerCase()).join(' ');

  if (isProduct || kw.includes('release') || kw.includes('feature') || kw.includes('update') || kw.includes('launch')) {
    return NewsletterType.PRODUCT_UPDATE;
  }

  if (isEvent || kw.includes('event') || kw.includes('webinar') || kw.includes('conference') || kw.includes('meetup')) {
    return NewsletterType.EVENT;
  }

  if (isCurated || kw.includes('digest') || kw.includes('roundup') || kw.includes('weekly') || kw.includes('links')) {
    return NewsletterType.DIGEST;
  }

  if (isSales || kw.includes('sale') || kw.includes('offer') || kw.includes('discount') || kw.includes('promo')) {
    return NewsletterType.PROMOTIONAL;
  }

  return NewsletterType.COMPANY;
}

// ============================================================================
// FIELD ARRAYS EXPORT
// ============================================================================

export const newsletterFieldArrays = F;