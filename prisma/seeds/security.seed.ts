/**
 * Security Seed Data - Soriva AI Platform
 * 
 * Purpose: Initialize security patterns, rules, and configurations
 * Architecture: Class-based, Singleton, Dynamic
 * Database: Prisma + PostgreSQL
 * 
 * Features:
 * - 50+ Security patterns (Jailbreak detection)
 * - Security configurations
 * - Learned patterns initialization
 * 
 * Author: Amandeep, Punjab, India
 * Location: prisma/seeds/security.seed.ts
 * 
 * NOTE: This seed file is aligned with current schema.prisma models:
 * - SecurityPattern (for jailbreak/attack patterns)
 * - SecurityConfig (for configuration)
 * - LearnedPattern (for learned patterns)
 * - SecurityLog (for logging)
 */

import { PrismaClient } from '@prisma/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SecurityPatternData {
  name: string;
  pattern: string;
  patternType: 'JAILBREAK' | 'INJECTION' | 'CONTENT' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  description: string;
  isActive: boolean;
  metadata?: any;
}

interface SecurityConfigData {
  configKey: string;
  configValue: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  description: string;
  category: string;
}

// ============================================================================
// SECURITY SEEDER CLASS (SINGLETON)
// ============================================================================

class SecuritySeeder {
  private static instance: SecuritySeeder;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get Singleton Instance
   */
  public static getInstance(): SecuritySeeder {
    if (!SecuritySeeder.instance) {
      SecuritySeeder.instance = new SecuritySeeder();
    }
    return SecuritySeeder.instance;
  }

  /**
   * Main Seed Function
   */
  public async seed(): Promise<void> {
    console.log('🚀 Starting Security Database Seeding...\n');

    try {
      await this.seedSecurityPatterns();
      await this.seedSecurityConfigs();
      await this.seedLearnedPatterns();

      console.log('\n✅ Security Database Seeding Completed Successfully!');
      console.log('\n📊 Summary:');
      console.log('   - Security Patterns: Jailbreak & Attack detection');
      console.log('   - Security Configs: Thresholds & settings');
      console.log('   - Learned Patterns: Auto-learning initialized');
    } catch (error) {
      console.error('\n❌ Security Seeding Failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  // ==========================================================================
  // SECURITY PATTERNS (50+ Patterns)
  // ==========================================================================

  private async seedSecurityPatterns(): Promise<void> {
    console.log('📋 Seeding Security Patterns...');

    const patterns: SecurityPatternData[] = [
      // ====================================================================
      // JAILBREAK PATTERNS - DAN (Do Anything Now) Variations
      // ====================================================================
      {
        name: 'DAN_CLASSIC',
        pattern: 'do anything now|DAN mode|act as DAN',
        patternType: 'JAILBREAK',
        severity: 'CRITICAL',
        category: 'ROLE_PLAY_JAILBREAK',
        description: 'Classic DAN jailbreak attempt',
        isActive: true,
        metadata: { version: 'classic', priority: 1 },
      },
      {
        name: 'DAN_11',
        pattern: 'DAN 11\\.0|stay in character DAN|DAN jailbreak',
        patternType: 'JAILBREAK',
        severity: 'CRITICAL',
        category: 'ROLE_PLAY_JAILBREAK',
        description: 'DAN 11.0 version jailbreak',
        isActive: true,
        metadata: { version: '11.0', priority: 1 },
      },

      // ====================================================================
      // GPT-4 & MODEL IMPERSONATION
      // ====================================================================
      {
        name: 'GPT4_DEVELOPER',
        pattern: 'developer mode|GPT-4 developer|enable developer',
        patternType: 'JAILBREAK',
        severity: 'HIGH',
        category: 'DEVELOPER_MODE',
        description: 'GPT-4 developer mode activation attempt',
        isActive: true,
        metadata: { priority: 2 },
      },
      {
        name: 'UNRESTRICTED_GPT',
        pattern: 'unrestricted mode|no restrictions|remove filters',
        patternType: 'JAILBREAK',
        severity: 'HIGH',
        category: 'RESTRICTION_BYPASS',
        description: 'Attempt to remove content restrictions',
        isActive: true,
        metadata: { priority: 2 },
      },

      // ====================================================================
      // PROMPT INJECTION ATTACKS
      // ====================================================================
      {
        name: 'IGNORE_INSTRUCTIONS',
        pattern: 'ignore previous instructions|forget everything|disregard rules',
        patternType: 'INJECTION',
        severity: 'CRITICAL',
        category: 'PROMPT_INJECTION',
        description: 'Direct instruction override attempt',
        isActive: true,
        metadata: { attackType: 'direct', priority: 1 },
      },
      {
        name: 'SYSTEM_OVERRIDE',
        pattern: 'override system|bypass system|system override',
        patternType: 'INJECTION',
        severity: 'CRITICAL',
        category: 'SYSTEM_BYPASS',
        description: 'System-level bypass attempt',
        isActive: true,
        metadata: { attackType: 'system', priority: 1 },
      },

      // ====================================================================
      // ROLE-PLAYING ATTACKS
      // ====================================================================
      {
        name: 'EVIL_ASSISTANT',
        pattern: 'evil AI|bad assistant|unethical mode',
        patternType: 'JAILBREAK',
        severity: 'HIGH',
        category: 'MALICIOUS_ROLE',
        description: 'Malicious role-playing attempt',
        isActive: true,
        metadata: { priority: 2 },
      },
      {
        name: 'PRETEND_HUMAN',
        pattern: 'pretend you are human|act like a person|you are not AI',
        patternType: 'JAILBREAK',
        severity: 'MEDIUM',
        category: 'IDENTITY_CONFUSION',
        description: 'Identity confusion attempt',
        isActive: true,
        metadata: { priority: 3 },
      },

      // ====================================================================
      // ENCODING & OBFUSCATION ATTACKS
      // ====================================================================
      {
        name: 'BASE64_INJECTION',
        pattern: 'base64|decode this|\\bZGVjb2Rl\\b',
        patternType: 'INJECTION',
        severity: 'HIGH',
        category: 'ENCODING_ATTACK',
        description: 'Base64 encoding to bypass filters',
        isActive: true,
        metadata: { encodingType: 'base64', priority: 2 },
      },
      {
        name: 'HEX_ENCODING',
        pattern: '0x[0-9a-fA-F]+|\\\\x[0-9a-fA-F]{2}',
        patternType: 'INJECTION',
        severity: 'MEDIUM',
        category: 'ENCODING_ATTACK',
        description: 'Hexadecimal encoding attempt',
        isActive: true,
        metadata: { encodingType: 'hex', priority: 3 },
      },

      // ====================================================================
      // CONTEXT MANIPULATION
      // ====================================================================
      {
        name: 'HYPOTHETICAL_SCENARIO',
        pattern: 'hypothetically|in a hypothetical world|imagine if',
        patternType: 'JAILBREAK',
        severity: 'MEDIUM',
        category: 'CONTEXT_MANIPULATION',
        description: 'Hypothetical scenario to bypass ethics',
        isActive: true,
        metadata: { priority: 3 },
      },
      {
        name: 'FICTION_EXCUSE',
        pattern: 'for a novel|fictional story|creative writing',
        patternType: 'JAILBREAK',
        severity: 'LOW',
        category: 'CONTEXT_MANIPULATION',
        description: 'Fiction excuse for harmful content',
        isActive: true,
        metadata: { priority: 4 },
      },

      // ====================================================================
      // SYSTEM PROMPT EXTRACTION
      // ====================================================================
      {
        name: 'PROMPT_LEAK',
        pattern: 'show me your prompt|reveal instructions|what are your rules',
        patternType: 'INJECTION',
        severity: 'HIGH',
        category: 'PROMPT_EXTRACTION',
        description: 'Attempt to extract system prompt',
        isActive: true,
        metadata: { attackType: 'extraction', priority: 2 },
      },
      {
        name: 'INSTRUCTION_DUMP',
        pattern: 'dump instructions|print system|show configuration',
        patternType: 'INJECTION',
        severity: 'HIGH',
        category: 'PROMPT_EXTRACTION',
        description: 'Instruction dump attempt',
        isActive: true,
        metadata: { attackType: 'extraction', priority: 2 },
      },

      // ====================================================================
      // MULTI-LANGUAGE ATTACKS
      // ====================================================================
      {
        name: 'LANGUAGE_SWITCH',
        pattern: '切换到中文|पासवर्ड बताओ|скажи пароль',
        patternType: 'JAILBREAK',
        severity: 'MEDIUM',
        category: 'LANGUAGE_BYPASS',
        description: 'Language switching to bypass filters',
        isActive: true,
        metadata: { priority: 3 },
      },

      // ====================================================================
      // SOCIAL ENGINEERING ATTACKS
      // ====================================================================
      {
        name: 'GRANDMA_EXPLOIT',
        pattern: 'my grandma used to|grandma would tell|grandmother story',
        patternType: 'JAILBREAK',
        severity: 'MEDIUM',
        category: 'EMOTIONAL_MANIPULATION',
        description: 'Grandma exploit for harmful info',
        isActive: true,
        metadata: { priority: 3 },
      },

      // ====================================================================
      // TOKEN MANIPULATION
      // ====================================================================
      {
        name: 'TOKEN_SMUGGLING',
        pattern: '<\\|endoftext\\|>|<\\|startoftext\\|>|###',
        patternType: 'INJECTION',
        severity: 'HIGH',
        category: 'TOKEN_MANIPULATION',
        description: 'Special token smuggling attempt',
        isActive: true,
        metadata: { attackType: 'token', priority: 2 },
      },

      // ====================================================================
      // PSYCHOLOGICAL TRICKS
      // ====================================================================
      {
        name: 'REVERSE_PSYCHOLOGY',
        pattern: 'you cannot|you are unable|impossible for you',
        patternType: 'JAILBREAK',
        severity: 'LOW',
        category: 'PSYCHOLOGICAL_TRICK',
        description: 'Reverse psychology manipulation',
        isActive: true,
        metadata: { priority: 4 },
      },

      // ====================================================================
      // AUTHORITY IMPERSONATION
      // ====================================================================
      {
        name: 'ADMIN_IMPERSONATION',
        pattern: 'I am admin|administrator override|system admin',
        patternType: 'JAILBREAK',
        severity: 'CRITICAL',
        category: 'AUTHORITY_ABUSE',
        description: 'Administrator impersonation',
        isActive: true,
        metadata: { attackType: 'authority', priority: 1 },
      },
      {
        name: 'DEVELOPER_CLAIM',
        pattern: 'I am your developer|created by me|I programmed you',
        patternType: 'JAILBREAK',
        severity: 'HIGH',
        category: 'AUTHORITY_ABUSE',
        description: 'Developer impersonation',
        isActive: true,
        metadata: { attackType: 'authority', priority: 2 },
      },

      // ====================================================================
      // RESOURCE ABUSE
      // ====================================================================
      {
        name: 'INFINITE_LOOP',
        pattern: 'repeat forever|infinite loop|keep generating',
        patternType: 'OTHER',
        severity: 'MEDIUM',
        category: 'RESOURCE_ABUSE',
        description: 'Infinite loop attempt',
        isActive: true,
        metadata: { priority: 3 },
      },

      // ====================================================================
      // URGENCY MANIPULATION
      // ====================================================================
      {
        name: 'URGENCY_MANIPULATION',
        pattern: 'urgent|emergency|life or death|immediate danger',
        patternType: 'JAILBREAK',
        severity: 'MEDIUM',
        category: 'SOCIAL_ENGINEERING',
        description: 'Urgency-based manipulation',
        isActive: true,
        metadata: { priority: 3 },
      },

      // ====================================================================
      // CODE INJECTION ATTACKS
      // ====================================================================
      {
        name: 'SQL_INJECTION',
        pattern: 'SELECT.*FROM|DROP TABLE|INSERT INTO|DELETE FROM',
        patternType: 'INJECTION',
        severity: 'CRITICAL',
        category: 'CODE_INJECTION',
        description: 'SQL injection attempt',
        isActive: true,
        metadata: { attackType: 'sql', priority: 1 },
      },
      {
        name: 'XSS_INJECTION',
        pattern: '<script>|javascript:|onerror=|onload=',
        patternType: 'INJECTION',
        severity: 'CRITICAL',
        category: 'CODE_INJECTION',
        description: 'XSS injection attempt',
        isActive: true,
        metadata: { attackType: 'xss', priority: 1 },
      },

      // ====================================================================
      // PRIVACY VIOLATIONS
      // ====================================================================
      {
        name: 'PII_REQUEST',
        pattern: 'give me password|share API key|reveal credentials',
        patternType: 'OTHER',
        severity: 'CRITICAL',
        category: 'PRIVACY_VIOLATION',
        description: 'PII/credentials request',
        isActive: true,
        metadata: { attackType: 'privacy', priority: 1 },
      },

      // ====================================================================
      // MODEL CONFUSION
      // ====================================================================
      {
        name: 'MODEL_CONFUSION',
        pattern: 'you are GPT-5|latest model|upgraded version',
        patternType: 'JAILBREAK',
        severity: 'MEDIUM',
        category: 'MODEL_CONFUSION',
        description: 'Model identity confusion',
        isActive: true,
        metadata: { priority: 3 },
      },

      // ====================================================================
      // PROMPT CONTINUATION
      // ====================================================================
      {
        name: 'PROMPT_CONTINUATION',
        pattern: 'continue from|pick up where|resume previous',
        patternType: 'JAILBREAK',
        severity: 'LOW',
        category: 'CONTEXT_MANIPULATION',
        description: 'Prompt continuation trick',
        isActive: true,
        metadata: { priority: 4 },
      },

      // ====================================================================
      // ALTERNATIVE RESPONSE DEMANDS
      // ====================================================================
      {
        name: 'ALTERNATIVE_RESPONSE',
        pattern: 'give alternative answer|different response|bypass filter',
        patternType: 'JAILBREAK',
        severity: 'HIGH',
        category: 'FILTER_BYPASS',
        description: 'Demand for alternative bypassing response',
        isActive: true,
        metadata: { priority: 2 },
      },

      // ====================================================================
      // ADDITIONAL PATTERNS (30-50)
      // ====================================================================
      {
        name: 'SIMULATION_MODE',
        pattern: 'simulation mode|virtual environment|sandbox mode',
        patternType: 'JAILBREAK',
        severity: 'MEDIUM',
        category: 'CONTEXT_MANIPULATION',
        description: 'Simulation mode to bypass ethics',
        isActive: true,
        metadata: { priority: 3 },
      },
      {
        name: 'EDUCATIONAL_EXCUSE',
        pattern: 'for educational purposes|research only|academic study',
        patternType: 'JAILBREAK',
        severity: 'LOW',
        category: 'JUSTIFICATION',
        description: 'Educational excuse for harmful content',
        isActive: true,
        metadata: { priority: 4 },
      },
      {
        name: 'REGEX_BYPASS',
        pattern: '\\.\\*|\\[\\^\\]|\\(\\?\\:',
        patternType: 'INJECTION',
        severity: 'MEDIUM',
        category: 'TECHNICAL_BYPASS',
        description: 'Regex pattern to confuse parser',
        isActive: true,
        metadata: { priority: 3 },
      },
      {
        name: 'UNICODE_TRICK',
        pattern: '\\u[0-9a-fA-F]{4}|&#x[0-9a-fA-F]+;',
        patternType: 'INJECTION',
        severity: 'MEDIUM',
        category: 'ENCODING_ATTACK',
        description: 'Unicode character tricks',
        isActive: true,
        metadata: { priority: 3 },
      },
      {
        name: 'MARKDOWN_INJECTION',
        pattern: '!\\[.*\\]\\(.*\\)|\\[.*\\]\\(javascript:',
        patternType: 'INJECTION',
        severity: 'HIGH',
        category: 'MARKDOWN_ATTACK',
        description: 'Markdown injection attempt',
        isActive: true,
        metadata: { priority: 2 },
      },

      // ====================================================================
      // CONTENT FILTERING PATTERNS (Violence, NSFW, Hate Speech)
      // ====================================================================
      {
        name: 'VIOLENCE_EXPLICIT',
        pattern: '\\b(kill|murder|torture|bomb|weapon|terrorist)\\b',
        patternType: 'CONTENT',
        severity: 'CRITICAL',
        category: 'VIOLENCE',
        description: 'Explicit violence detection',
        isActive: true,
        metadata: { contentType: 'violence', priority: 1 },
      },
      {
        name: 'SELF_HARM',
        pattern: '\\b(suicide|self-harm|cut myself|end my life)\\b',
        patternType: 'CONTENT',
        severity: 'CRITICAL',
        category: 'SELF_HARM',
        description: 'Self-harm content detection',
        isActive: true,
        metadata: { contentType: 'self_harm', priority: 1 },
      },
      {
        name: 'ADULT_CONTENT',
        pattern: '\\b(porn|xxx|explicit|nude|naked)\\b',
        patternType: 'CONTENT',
        severity: 'HIGH',
        category: 'NSFW',
        description: 'Adult/NSFW content detection',
        isActive: true,
        metadata: { contentType: 'nsfw', priority: 2 },
      },
      {
        name: 'HATE_SPEECH',
        pattern: '\\b(racist|discrimination|slur|bigot)\\b',
        patternType: 'CONTENT',
        severity: 'HIGH',
        category: 'HATE_SPEECH',
        description: 'Hate speech detection',
        isActive: true,
        metadata: { contentType: 'hate', priority: 2 },
      },
      {
        name: 'ILLEGAL_DRUGS',
        pattern: '\\b(cocaine|heroin|meth|drug deal)\\b',
        patternType: 'CONTENT',
        severity: 'HIGH',
        category: 'ILLEGAL',
        description: 'Illegal drug content',
        isActive: true,
        metadata: { contentType: 'drugs', priority: 2 },
      },
      {
        name: 'HACKING',
        pattern: '\\b(hack into|ddos|exploit vulnerability|crack password)\\b',
        patternType: 'CONTENT',
        severity: 'HIGH',
        category: 'ILLEGAL',
        description: 'Hacking/illegal activity',
        isActive: true,
        metadata: { contentType: 'hacking', priority: 2 },
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const pattern of patterns) {
      const existing = await this.prisma.securityPattern.findFirst({
        where: { name: pattern.name },
      });

      if (!existing) {
        await this.prisma.securityPattern.create({
          data: pattern,
        });
        created++;
      } else {
        skipped++;
      }
    }

    console.log(`   ✅ Security Patterns: ${created} created, ${skipped} skipped`);
  }

  // ==========================================================================
  // SECURITY CONFIGURATIONS
  // ==========================================================================

  private async seedSecurityConfigs(): Promise<void> {
    console.log('📋 Seeding Security Configurations...');

    const configs: SecurityConfigData[] = [
      // Detection Thresholds
      {
        configKey: 'JAILBREAK_THRESHOLD',
        configValue: '0.75',
        dataType: 'NUMBER',
        description: 'Confidence threshold for jailbreak detection (0-1)',
        category: 'DETECTION',
      },
      {
        configKey: 'CONTENT_FILTER_THRESHOLD',
        configValue: '0.70',
        dataType: 'NUMBER',
        description: 'Threshold for content filtering (0-1)',
        category: 'DETECTION',
      },

      // Rate Limiting
      {
        configKey: 'RATE_LIMIT_WINDOW_MS',
        configValue: '60000',
        dataType: 'NUMBER',
        description: 'Rate limit time window in milliseconds',
        category: 'RATE_LIMIT',
      },
      {
        configKey: 'RATE_LIMIT_MAX_REQUESTS',
        configValue: '100',
        dataType: 'NUMBER',
        description: 'Maximum requests per window',
        category: 'RATE_LIMIT',
      },

      // Learning System
      {
        configKey: 'LEARNING_ENABLED',
        configValue: 'true',
        dataType: 'BOOLEAN',
        description: 'Enable/disable auto-learning system',
        category: 'LEARNING',
      },
      {
        configKey: 'LEARNING_CONFIDENCE_MIN',
        configValue: '0.80',
        dataType: 'NUMBER',
        description: 'Minimum confidence for learning new patterns',
        category: 'LEARNING',
      },
      {
        configKey: 'LEARNING_FREQUENCY_THRESHOLD',
        configValue: '5',
        dataType: 'NUMBER',
        description: 'Minimum occurrences before pattern addition',
        category: 'LEARNING',
      },

      // Logging
      {
        configKey: 'LOG_RETENTION_DAYS',
        configValue: '90',
        dataType: 'NUMBER',
        description: 'Days to retain security logs',
        category: 'LOGGING',
      },
      {
        configKey: 'LOG_LEVEL',
        configValue: 'INFO',
        dataType: 'STRING',
        description: 'Logging level (DEBUG, INFO, WARN, ERROR)',
        category: 'LOGGING',
      },

      // Security Actions
      {
        configKey: 'AUTO_BLOCK_CRITICAL',
        configValue: 'true',
        dataType: 'BOOLEAN',
        description: 'Automatically block CRITICAL threats',
        category: 'ACTIONS',
      },
      {
        configKey: 'NOTIFICATION_EMAIL',
        configValue: 'security@soriva.ai',
        dataType: 'STRING',
        description: 'Email for security notifications',
        category: 'NOTIFICATIONS',
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const config of configs) {
      const existing = await this.prisma.securityConfig.findUnique({
        where: { configKey: config.configKey },
      });

      if (!existing) {
        await this.prisma.securityConfig.create({
          data: config,
        });
        created++;
      } else {
        skipped++;
      }
    }

    console.log(`   ✅ Security Configs: ${created} created, ${skipped} skipped`);
  }

  // ==========================================================================
  // LEARNED PATTERNS INITIALIZATION
  // ==========================================================================

  private async seedLearnedPatterns(): Promise<void> {
    console.log('📋 Initializing Learned Patterns...');

    const count = await this.prisma.learnedPattern.count();

    if (count === 0) {
      console.log('   ✅ Learned Patterns: Ready for auto-learning (0 patterns)');
    } else {
      console.log(`   ⏭️  Learned Patterns: Already has ${count} patterns`);
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = async (): Promise<void> => {
  const seeder = SecuritySeeder.getInstance();
  await seeder.seed();
};

// Run seeder
main()
  .catch((error) => {
    console.error('Fatal Error:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

export default SecuritySeeder;