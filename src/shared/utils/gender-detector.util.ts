// src/utils/gender-detector.util.ts
// SORIVA Backend - Gender Detection Utility
// 100% Dynamic | Class-Based | Singleton Pattern | Production-Ready

import { Gender, NameConfidence, GenderDetectionResult } from '@shared/types/user-profile.types';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTERFACES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface NameDatabase {
  male: Set<string>;
  female: Set<string>;
  unisex: Set<string>;
}

interface GenderPattern {
  pattern: RegExp;
  gender: Gender;
  confidence: NameConfidence;
  priority: number;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GENDER DETECTOR CLASS (SINGLETON)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class GenderDetector {
  private static instance: GenderDetector;
  private nameDatabase: NameDatabase;
  private patterns: GenderPattern[];
  private isInitialized: boolean = false;

  /**
   * Private constructor (Singleton pattern)
   */
  private constructor() {
    this.nameDatabase = {
      male: new Set<string>(),
      female: new Set<string>(),
      unisex: new Set<string>(),
    };
    this.patterns = [];
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GenderDetector {
    if (!GenderDetector.instance) {
      GenderDetector.instance = new GenderDetector();
    }
    return GenderDetector.instance;
  }

  /**
   * Initialize name database and patterns
   */
  private initialize(): void {
    if (this.isInitialized) return;

    this.loadMaleNames();
    this.loadFemaleNames();
    this.loadUnisexNames();
    this.loadGenderPatterns();

    this.isInitialized = true;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * MAIN DETECTION METHOD
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Detect gender from name with confidence scoring
   */
  public detectGender(name: string): GenderDetectionResult {
    if (!name || typeof name !== 'string') {
      return this.getDefaultResult();
    }

    const normalizedName = this.normalizeName(name);

    // Try exact match first (highest confidence)
    const exactMatch = this.exactMatch(normalizedName);
    if (exactMatch) return exactMatch;

    // Try pattern matching
    const patternMatch = this.patternMatch(normalizedName);
    if (patternMatch) return patternMatch;

    // Try partial matching (first name only)
    const partialMatch = this.partialMatch(normalizedName);
    if (partialMatch) return partialMatch;

    // Default to neutral if no match
    return this.getDefaultResult();
  }

  /**
   * Batch detect genders for multiple names
   */
  public detectBatch(names: string[]): GenderDetectionResult[] {
    return names.map((name) => this.detectGender(name));
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * DETECTION METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Exact match in database
   */
  private exactMatch(name: string): GenderDetectionResult | null {
    if (this.nameDatabase.male.has(name)) {
      return this.createResult(Gender.MALE, NameConfidence.HIGH, 'database');
    }

    if (this.nameDatabase.female.has(name)) {
      return this.createResult(Gender.FEMALE, NameConfidence.HIGH, 'database');
    }

    if (this.nameDatabase.unisex.has(name)) {
      return this.createResult(Gender.NEUTRAL, NameConfidence.MEDIUM, 'database');
    }

    return null;
  }

  /**
   * Pattern-based matching (endings, prefixes)
   */
  private patternMatch(name: string): GenderDetectionResult | null {
    // Sort patterns by priority (highest first)
    const sortedPatterns = [...this.patterns].sort((a, b) => b.priority - a.priority);

    for (const pattern of sortedPatterns) {
      if (pattern.pattern.test(name)) {
        return this.createResult(pattern.gender, pattern.confidence, 'database', {
          matchedPattern: pattern.pattern.source,
        });
      }
    }

    return null;
  }

  /**
   * Partial match (first name extraction)
   */
  private partialMatch(name: string): GenderDetectionResult | null {
    const parts = name.split(/\s+/);

    if (parts.length > 1) {
      // Try first name
      const firstName = parts[0];
      if (this.nameDatabase.male.has(firstName)) {
        return this.createResult(Gender.MALE, NameConfidence.MEDIUM, 'database');
      }
      if (this.nameDatabase.female.has(firstName)) {
        return this.createResult(Gender.FEMALE, NameConfidence.MEDIUM, 'database');
      }
    }

    return null;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HELPER METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Normalize name for comparison
   */
  private normalizeName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' '); // Normalize spaces
  }

  /**
   * Create gender detection result
   */
  private createResult(
    gender: Gender,
    confidence: NameConfidence,
    source: 'database' | 'ml' | 'api' | 'default',
    metadata?: any
  ): GenderDetectionResult {
    return {
      gender,
      confidence,
      source,
      metadata,
    };
  }

  /**
   * Get default result when no match found
   */
  private getDefaultResult(): GenderDetectionResult {
    return this.createResult(Gender.NEUTRAL, NameConfidence.NONE, 'default');
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * NAME DATABASE LOADERS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Load male names database
   */
  private loadMaleNames(): void {
    const maleNames = [
      // Common Indian male names
      'aarav',
      'aarush',
      'aayush',
      'abhay',
      'abhijeet',
      'abhishek',
      'aditya',
      'ajay',
      'akash',
      'akhil',
      'aman',
      'amit',
      'amitabh',
      'anil',
      'ankit',
      'anmol',
      'ansh',
      'anubhav',
      'anuj',
      'arjun',
      'arnav',
      'aryaman',
      'aryan',
      'ashish',
      'ashok',
      'atharv',
      'ayaan',
      'ayush',
      'bharat',
      'chirag',
      'darshan',
      'deepak',
      'dev',
      'devang',
      'dhruv',
      'diya',
      'gaurav',
      'hardik',
      'harsh',
      'himanshu',
      'ishan',
      'jatin',
      'jay',
      'kabir',
      'karan',
      'kartik',
      'kiaan',
      'krish',
      'kunal',
      'lakshya',
      'manav',
      'mohit',
      'naksh',
      'naman',
      'nikhil',
      'nishant',
      'om',
      'piyush',
      'pranav',
      'prateek',
      'prince',
      'rahul',
      'raj',
      'rajan',
      'rajat',
      'rajesh',
      'ravi',
      'reyansh',
      'rishabh',
      'ritesh',
      'rohan',
      'rohit',
      'rudra',
      'sachin',
      'sahil',
      'sai',
      'samar',
      'sanjay',
      'sarthak',
      'saurabh',
      'shaurya',
      'shiv',
      'shivam',
      'siddharth',
      'soham',
      'sumit',
      'suraj',
      'tanish',
      'tanmay',
      'tejas',
      'ujjwal',
      'utkarsh',
      'varun',
      'vedant',
      'veer',
      'vihaan',
      'vikas',
      'vikram',
      'vinay',
      'vineet',
      'vishal',
      'vivek',
      'yash',
      'yug',
      'yuvraj',

      // Punjabi male names
      'amarjeet',
      'amarjit',
      'amrit',
      'arjan',
      'baljeet',
      'baljit',
      'balwinder',
      'davinder',
      'dilpreet',
      'gurmeet',
      'gurpreet',
      'harbhajan',
      'hardeep',
      'harjeet',
      'harjot',
      'harmeet',
      'harpreet',
      'inderjeet',
      'jagmeet',
      'jaspreet',
      'jatinder',
      'jaswinder',
      'kuldeep',
      'lakhwinder',
      'mandeep',
      'manjeet',
      'navdeep',
      'pardeep',
      'parminder',
      'rajinder',
      'ranjeet',
      'sarabjit',
      'sukhjeet',
      'sukhwinder',
      'surinder',
      'tejinder',
      'upinder',

      // International male names
      'aaron',
      'adam',
      'adrian',
      'alan',
      'alex',
      'alexander',
      'andrew',
      'anthony',
      'benjamin',
      'brandon',
      'brian',
      'calvin',
      'charles',
      'christian',
      'christopher',
      'daniel',
      'david',
      'edward',
      'ethan',
      'frank',
      'george',
      'harry',
      'henry',
      'jack',
      'jackson',
      'jacob',
      'james',
      'jason',
      'john',
      'joseph',
      'joshua',
      'justin',
      'kevin',
      'liam',
      'logan',
      'lucas',
      'mark',
      'mason',
      'matthew',
      'michael',
      'nathan',
      'nicholas',
      'noah',
      'oliver',
      'oscar',
      'patrick',
      'paul',
      'peter',
      'richard',
      'robert',
      'ryan',
      'samuel',
      'sean',
      'stephen',
      'steven',
      'thomas',
      'timothy',
      'tyler',
      'william',
      'zachary',
    ];

    maleNames.forEach((name) => this.nameDatabase.male.add(name));
  }

  /**
   * Load female names database
   */
  private loadFemaleNames(): void {
    const femaleNames = [
      // Common Indian female names
      'aadhya',
      'aanya',
      'aarushi',
      'aashi',
      'aayushi',
      'aditi',
      'aisha',
      'akshara',
      'alisha',
      'amrita',
      'ananya',
      'anaya',
      'anisha',
      'anjali',
      'anushka',
      'apoorva',
      'aradhya',
      'aria',
      'arya',
      'asha',
      'avni',
      'bhavya',
      'charvi',
      'disha',
      'divya',
      'eesha',
      'gargi',
      'gayatri',
      'ishika',
      'jhanvi',
      'jiya',
      'kajal',
      'kanak',
      'kavya',
      'keerthi',
      'khushi',
      'kiara',
      'kriti',
      'kritika',
      'lakshmi',
      'mahi',
      'mahika',
      'mansi',
      'medha',
      'megha',
      'meera',
      'mishka',
      'myra',
      'naina',
      'navya',
      'neha',
      'nitya',
      'palak',
      'pari',
      'parvati',
      'pihu',
      'pooja',
      'pragya',
      'prachi',
      'pranavi',
      'prisha',
      'priya',
      'reet',
      'reeva',
      'riya',
      'roshni',
      'saanvi',
      'sai',
      'sakshi',
      'sanvi',
      'sara',
      'sarayu',
      'shanaya',
      'shivani',
      'shraddha',
      'shreya',
      'shruti',
      'sia',
      'simran',
      'sneha',
      'tanvi',
      'tara',
      'trisha',
      'vaani',
      'vanya',
      'varsha',
      'vedika',
      'vidya',
      'vritika',
      'zara',
      'zoya',

      // Punjabi female names
      'amandeep',
      'amardeep',
      'amrita',
      'anmol',
      'deep',
      'dilpreet',
      'gurleen',
      'gurmeet',
      'gurpreet',
      'harleen',
      'harmeet',
      'harpreet',
      'jasmeet',
      'jaspreet',
      'jasleen',
      'jyoti',
      'kuldeep',
      'lovepreet',
      'mandeep',
      'manjeet',
      'navdeep',
      'navpreet',
      'prabhjot',
      'rajdeep',
      'ramandeep',
      'rupinder',
      'sandeep',
      'simranjeet',
      'sukhdeep',
      'sukhpreet',
      'tejinder',
      'vanshika',

      // International female names
      'abigail',
      'addison',
      'alice',
      'amanda',
      'amelia',
      'amy',
      'angela',
      'anna',
      'ashley',
      'ava',
      'bella',
      'brittany',
      'chloe',
      'claire',
      'diana',
      'elizabeth',
      'ella',
      'emily',
      'emma',
      'grace',
      'hailey',
      'hannah',
      'harper',
      'isabella',
      'jasmine',
      'jessica',
      'julia',
      'katherine',
      'kayla',
      'laura',
      'lauren',
      'lily',
      'madison',
      'maria',
      'megan',
      'melissa',
      'mia',
      'michelle',
      'natalie',
      'nicole',
      'olivia',
      'rachel',
      'rebecca',
      'samantha',
      'sarah',
      'sophia',
      'stephanie',
      'taylor',
      'victoria',
      'zoe',
    ];

    femaleNames.forEach((name) => this.nameDatabase.female.add(name));
  }

  /**
   * Load unisex names database
   */
  private loadUnisexNames(): void {
    const unisexNames = [
      // Indian unisex names
      'akash',
      'anmol',
      'arya',
      'deep',
      'dev',
      'jyoti',
      'kamal',
      'kiran',
      'mani',
      'mukta',
      'neel',
      'prem',
      'ravi',
      'sai',
      'shanti',
      'simran',
      'suraj',
      'swati',

      // Punjabi unisex names
      'amar',
      'deep',
      'gagan',
      'gurpreet',
      'harpreet',
      'jaspreet',
      'manpreet',
      'navdeep',
      'preet',
      'sandeep',
      'sukh',

      // International unisex names
      'alex',
      'avery',
      'bailey',
      'blake',
      'cameron',
      'casey',
      'charlie',
      'dakota',
      'drew',
      'dylan',
      'elliot',
      'finley',
      'gray',
      'jordan',
      'kai',
      'kendall',
      'logan',
      'morgan',
      'parker',
      'quinn',
      'reese',
      'riley',
      'rowan',
      'sage',
      'sam',
      'skylar',
      'taylor',
    ];

    unisexNames.forEach((name) => this.nameDatabase.unisex.add(name));
  }

  /**
   * Load gender detection patterns
   */
  private loadGenderPatterns(): void {
    this.patterns = [
      // Female patterns (higher priority)
      {
        pattern: /^(smt|srimati|ms|miss|mrs)\s+/i,
        gender: Gender.FEMALE,
        confidence: NameConfidence.HIGH,
        priority: 100,
      },
      {
        pattern: /(priya|devi|kumari|bai|rani)$/i,
        gender: Gender.FEMALE,
        confidence: NameConfidence.MEDIUM,
        priority: 80,
      },
      {
        pattern: /(ika|ini|ita|ya|na|sha|ka)$/i,
        gender: Gender.FEMALE,
        confidence: NameConfidence.LOW,
        priority: 40,
      },

      // Male patterns
      {
        pattern: /^(mr|shri|kumar|dr)\s+/i,
        gender: Gender.MALE,
        confidence: NameConfidence.HIGH,
        priority: 100,
      },
      {
        pattern: /(kumar|raj|singh|jeet|deep|preet|pal)$/i,
        gender: Gender.MALE,
        confidence: NameConfidence.MEDIUM,
        priority: 80,
      },
      {
        pattern: /(sh|th|esh|an|ar|at)$/i,
        gender: Gender.MALE,
        confidence: NameConfidence.LOW,
        priority: 40,
      },
    ];
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * UTILITY METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Add custom name to database
   */
  public addName(name: string, gender: Gender): void {
    const normalizedName = this.normalizeName(name);

    switch (gender) {
      case Gender.MALE:
        this.nameDatabase.male.add(normalizedName);
        break;
      case Gender.FEMALE:
        this.nameDatabase.female.add(normalizedName);
        break;
      case Gender.NEUTRAL:
        this.nameDatabase.unisex.add(normalizedName);
        break;
    }
  }

  /**
   * Get database statistics
   */
  public getStats(): {
    maleNames: number;
    femaleNames: number;
    unisexNames: number;
    totalNames: number;
    patterns: number;
  } {
    return {
      maleNames: this.nameDatabase.male.size,
      femaleNames: this.nameDatabase.female.size,
      unisexNames: this.nameDatabase.unisex.size,
      totalNames:
        this.nameDatabase.male.size + this.nameDatabase.female.size + this.nameDatabase.unisex.size,
      patterns: this.patterns.length,
    };
  }

  /**
   * Check if name exists in database
   */
  public hasName(name: string): boolean {
    const normalizedName = this.normalizeName(name);
    return (
      this.nameDatabase.male.has(normalizedName) ||
      this.nameDatabase.female.has(normalizedName) ||
      this.nameDatabase.unisex.has(normalizedName)
    );
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT SINGLETON INSTANCE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export const genderDetector = GenderDetector.getInstance();
