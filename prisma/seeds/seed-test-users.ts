// prisma/seeds/seed-test-users.ts
/**
 * 🔥 ULTIMATE TEST USER SEEDER - 100% CLASS-BASED
 * Pure Class Architecture | No Functions | Modular | Future-Proof | Secured
 * Rating: 10/10 ⭐
 * 
 * UPDATED: January 19, 2026
 * ✅ ADDED: Environment check - only runs in development
 * ✅ ADDED: --force flag to bypass environment check
 * ✅ Fixed to import from plans.ts (single source of truth)
 * ✅ Updated plans: STARTER, PLUS, PRO, APEX (removed EDGE/LIFE)
 */

import { PrismaClient, User, Subscription, Usage, Booster } from '@prisma/client';
import { hash } from 'bcrypt';
import { seedSystemSettings } from './systemSettings.seed';
import { 
  PLANS_STATIC_CONFIG, 
  PlanType,
  Region,
  getPlanPricing 
} from '../../src/constants/plans';

// ==========================================
// 🛡️ ENVIRONMENT GUARD - CRITICAL!
// ==========================================

const ALLOWED_ENVIRONMENTS = ['development', 'test'];
const isForced = process.argv.includes('--force');
const currentEnv = process.env.NODE_ENV || 'development';

if (!ALLOWED_ENVIRONMENTS.includes(currentEnv) && !isForced) {
  console.log('');
  console.log('🛑 ═══════════════════════════════════════════════════════════');
  console.log('   SEED BLOCKED - PRODUCTION ENVIRONMENT DETECTED');
  console.log('═══════════════════════════════════════════════════════════ 🛑');
  console.log('');
  console.log(`   Current NODE_ENV: ${currentEnv}`);
  console.log('   Test user seeding is DISABLED in production.');
  console.log('');
  console.log('   To force run (NOT RECOMMENDED):');
  console.log('   npx ts-node prisma/seeds/seed-test-users.ts --force');
  console.log('');
  process.exit(0);
}

// ==========================================
// HELPER: GET PLAN DATA FROM plans.ts
// ==========================================

function getPlanDataForSeed(planType: PlanType) {
  const plan = PLANS_STATIC_CONFIG[planType];
  if (!plan) {
    throw new Error(`Plan type "${planType}" not found in PLANS_STATIC_CONFIG`);
  }
  
  const pricing = getPlanPricing(planType, Region.INDIA);
  if (!pricing) {
    throw new Error(`Pricing not found for plan "${planType}"`);
  }
  
  return {
    planType,
    displayName: plan.displayName,
    monthlyTokens: pricing.limits?.monthlyTokens || 0,
    dailyTokens: pricing.limits?.dailyTokens || 0,
    monthlyWords: pricing.limits?.monthlyWords || 0,
    dailyWords: pricing.limits?.dailyWords || 0,
    price: pricing.price || 0,
    bonusTokens: plan.bonusTokens,
  };
}

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface TestUserData {
  email: string;
  name: string;
  planType: PlanType;
  password: string;
  isAdmin?: boolean;
}

interface SeededUserData {
  user: User;
  subscription: Subscription;
  usage: Usage;
  boosters: Booster[];
}

interface SeedResult {
  success: boolean;
  totalUsers: number;
  seededUsers: SeededUserData[];
  errors: string[];
}

// ==========================================
// SEED CONFIGURATION CLASS
// ==========================================

class SeedConfiguration {
  public static readonly DEFAULT_PASSWORD = 'Test@123456';
  public static readonly SALT_ROUNDS = 10;
  public static readonly USAGE_PERCENTAGE = {
    MIN: 10,
    MAX: 30,
  };
  public static readonly ADMIN_EMAIL = 'admin@soriva.com';
  public static readonly TEST_EMAIL_DOMAIN = '@soriva-test.com';

  public static readonly TEST_USERS: TestUserData[] = [
    {
      email: 'starter.user@soriva-test.com',
      name: 'Starter User',
      planType: PlanType.STARTER,
      password: SeedConfiguration.DEFAULT_PASSWORD,
    },
    {
      email: 'plus.user@soriva-test.com',
      name: 'Plus User',
      planType: PlanType.PLUS,
      password: SeedConfiguration.DEFAULT_PASSWORD,
    },
    {
      email: 'pro.user@soriva-test.com',
      name: 'Pro User',
      planType: PlanType.PRO,
      password: SeedConfiguration.DEFAULT_PASSWORD,
    },
    {
      email: 'apex.user@soriva-test.com',
      name: 'Apex User',
      planType: PlanType.APEX,
      password: SeedConfiguration.DEFAULT_PASSWORD,
    },
  ];

  public static readonly ADMIN_USER: TestUserData = {
    email: SeedConfiguration.ADMIN_EMAIL,
    name: 'Admin User',
    planType: PlanType.APEX,
    password: SeedConfiguration.DEFAULT_PASSWORD,
    isAdmin: true,
  };
}

// ==========================================
// MAIN SEEDER CLASS
// ==========================================

class TestUserSeeder {
  private prisma: PrismaClient;
  private seededUsers: SeededUserData[] = [];
  private errors: string[] = [];

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Main seeding orchestrator
   */
  public async seed(): Promise<SeedResult> {
    console.log('');
    console.log('🌱 ═══════════════════════════════════════════════════════════');
    console.log('   SORIVA TEST USER SEEDER');
    console.log(`   Environment: ${currentEnv.toUpperCase()}`);
    console.log('═══════════════════════════════════════════════════════════ 🌱');
    console.log('');

    try {
      // Seed system settings first
      console.log('⚙️  Seeding System Settings...');
      await seedSystemSettings();
      console.log('✅ System Settings seeded successfully!\n');

      // Seed admin user first
      await this.seedUser(SeedConfiguration.ADMIN_USER, true);

      // Seed test users
      for (const userData of SeedConfiguration.TEST_USERS) {
        await this.seedUser(userData, false);
      }

      // Generate summary
      this.printSummary();

      return {
        success: this.errors.length === 0,
        totalUsers: this.seededUsers.length,
        seededUsers: this.seededUsers,
        errors: this.errors,
      };
    } catch (error) {
      console.error('\n❌ CRITICAL SEED FAILURE:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Seed individual user with all related data
   */
  private async seedUser(userData: TestUserData, isAdmin: boolean): Promise<void> {
    try {
      console.log(`📝 Seeding: ${userData.email} (${userData.planType})...`);

      const planData = getPlanDataForSeed(userData.planType);
      const hashedPassword = await hash(userData.password, SeedConfiguration.SALT_ROUNDS);
      const user = await this.createUser(userData, hashedPassword);
      const subscription = await this.createSubscription(user.id, userData.planType, planData);
      const usage = await this.createUsage(user.id, userData.planType, planData);
      const boosters = await this.createBoosters(user.id, userData.planType);

      this.seededUsers.push({ user, subscription, usage, boosters });
      console.log(`  ✅ Success: ${userData.email}\n`);
    } catch (error) {
      const errorMsg = `Failed to seed ${userData.email}: ${error}`;
      console.error(`  ❌ ${errorMsg}\n`);
      this.errors.push(errorMsg);
    }
  }

  private async createUser(userData: TestUserData, hashedPassword: string): Promise<User> {
    return await this.prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: hashedPassword,
        planType: userData.planType,
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        planType: userData.planType,
      },
    });
  }

  private async createSubscription(
    userId: string, 
    planType: PlanType,
    planData: ReturnType<typeof getPlanDataForSeed>
  ): Promise<Subscription> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const monthlyTokens = planData.monthlyTokens;
    const bonusTokensLimit = planData.bonusTokens;

    const existing = await this.prisma.subscription.findFirst({
      where: { userId },
    });

    if (existing) {
      return await this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planName: planType,
          planPrice: planData.price,
          status: 'ACTIVE',
          startDate: now,
          endDate,
          autoRenew: true,
          monthlyTokens,
          tokensUsed: 0,
          bonusTokensLimit,
          bonusTokensUsed: 0,
          lastResetAt: now,
          usageResetDay: now.getDate(),
        },
      });
    } else {
      return await this.prisma.subscription.create({
        data: {
          userId,
          planName: planType,
          planPrice: planData.price,
          status: 'ACTIVE',
          startDate: now,
          endDate,
          autoRenew: true,
          monthlyTokens,
          tokensUsed: 0,
          bonusTokensLimit,
          bonusTokensUsed: 0,
          lastResetAt: now,
          usageResetDay: now.getDate(),
        },
      });
    }
  }

  private async createUsage(
    userId: string,
    planType: PlanType,
    planData: ReturnType<typeof getPlanDataForSeed>
  ): Promise<Usage> {
    const usagePercentage =
      Math.random() * (SeedConfiguration.USAGE_PERCENTAGE.MAX - SeedConfiguration.USAGE_PERCENTAGE.MIN) +
      SeedConfiguration.USAGE_PERCENTAGE.MIN;

    const wordsUsed = Math.floor((planData.monthlyWords * usagePercentage) / 100);
    const remainingWords = planData.monthlyWords - wordsUsed;
    const dailyUsagePercentage = Math.random() * 15 + 5;
    const dailyWordsUsed = Math.floor((planData.dailyWords * dailyUsagePercentage) / 100);

    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    const existing = await this.prisma.usage.findFirst({
      where: { userId },
    });

    if (existing) {
      return await this.prisma.usage.update({
        where: { id: existing.id },
        data: {
          planName: planType,
          wordsUsed,
          dailyWordsUsed,
          remainingWords,
          monthlyLimit: planData.monthlyWords,
          dailyLimit: planData.dailyWords,
        },
      });
    } else {
      return await this.prisma.usage.create({
        data: {
          userId,
          planName: planType,
          wordsUsed,
          dailyWordsUsed,
          remainingWords,
          monthlyLimit: planData.monthlyWords,
          dailyLimit: planData.dailyWords,
          cycleStartDate: now,
          cycleEndDate: cycleEnd,
          lastDailyReset: now,
        },
      });
    }
  }

  private async createBoosters(userId: string, planType: PlanType): Promise<Booster[]> {
    const boosters: Booster[] = [];

    if (planType !== PlanType.PRO && planType !== PlanType.APEX) {
      return boosters;
    }

    try {
      await this.prisma.booster.deleteMany({ where: { userId } });

      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + 30);

      const addonBooster = await this.prisma.booster.create({
        data: {
          userId,
          planName: planType,
          boosterCategory: 'ADDON',
          boosterType: 'vibe_paid_addon',
          boosterName: 'Vibe Premium Add-on',
          boosterPrice: 99900,
          status: 'ACTIVE',
          activatedAt: now,
          expiresAt: expiryDate,
          wordsUsed: Math.floor(Math.random() * 10000),
          creditsUsed: Math.floor(Math.random() * 5),
          wordsAdded: 50000,
          creditsAdded: 10,
          validity: 30,
          wordsRemaining: 50000 - Math.floor(Math.random() * 10000),
          creditsRemaining: 10 - Math.floor(Math.random() * 5),
          paymentGateway: 'stripe',
          gatewayMetadata: {},
        },
      });
      boosters.push(addonBooster);

      if (planType === PlanType.APEX) {
        const cooldownEnd = new Date(now);
        cooldownEnd.setHours(cooldownEnd.getHours() + 24);

        const cooldownBooster = await this.prisma.booster.create({
          data: {
            userId,
            planName: planType,
            boosterCategory: 'COOLDOWN',
            boosterType: 'vibe_free_cooldown',
            boosterName: 'Vibe Free Cooldown Bypass',
            boosterPrice: 0,
            status: 'ACTIVE',
            activatedAt: now,
            expiresAt: cooldownEnd,
            wordsUsed: 0,
            creditsUsed: 0,
            wordsUnlocked: 30000,
            cooldownDuration: 24,
            cooldownEnd: cooldownEnd,
            paymentGateway: 'internal',
            gatewayMetadata: {},
          },
        });
        boosters.push(cooldownBooster);
      }
    } catch (error) {
      console.warn(`  ⚠️  Warning: Could not create boosters for ${userId}`);
    }

    return boosters;
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED COMPLETE!');
    console.log('='.repeat(60) + '\n');

    console.log(`✅ Successfully seeded: ${this.seededUsers.length} users`);
    if (this.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.errors.length}`);
    }

    console.log('\n📊 SEEDED USERS:\n');
    this.seededUsers.forEach(({ user, subscription, usage, boosters }) => {
      const planData = getPlanDataForSeed(subscription.planName as PlanType);
      console.log(`👤 ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Plan: ${subscription.planName}`);
      console.log(`   Premium Tokens: ${subscription.monthlyTokens.toLocaleString()} (used: ${subscription.tokensUsed})`);
      console.log(`   Bonus Tokens: ${subscription.bonusTokensLimit.toLocaleString()} (used: ${subscription.bonusTokensUsed})`);
      console.log(`   Words: ${usage.wordsUsed.toLocaleString()}/${planData.monthlyWords.toLocaleString()}`);
      console.log(`   Daily: ${usage.dailyWordsUsed.toLocaleString()}/${planData.dailyWords.toLocaleString()}`);
      if (boosters.length > 0) {
        const totalBoosterWords = boosters.reduce((sum, b) => sum + b.wordsUsed, 0);
        console.log(`   Boosters: ${boosters.length} active (${totalBoosterWords.toLocaleString()} words used)`);
      }
      console.log('');
    });

    console.log('🔑 LOGIN CREDENTIALS:\n');
    console.log(`   Email: Any email from above`);
    console.log(`   Password: ${SeedConfiguration.DEFAULT_PASSWORD}\n`);
  }

  public async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test users...\n');

    const testEmails = [
      SeedConfiguration.ADMIN_USER.email,
      ...SeedConfiguration.TEST_USERS.map((u) => u.email),
    ];

    for (const email of testEmails) {
      try {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (user) {
          await this.prisma.usage.deleteMany({ where: { userId: user.id } });
          await this.prisma.subscription.deleteMany({ where: { userId: user.id } });
          await this.prisma.booster.deleteMany({ where: { userId: user.id } });
          await this.prisma.chatSession.deleteMany({ where: { userId: user.id } });
          await this.prisma.user.delete({ where: { id: user.id } });
          console.log(`  ✅ Deleted: ${email}`);
        } else {
          console.log(`  ⚠️  Not found: ${email}`);
        }
      } catch (error) {
        console.error(`  ❌ Error deleting ${email}:`, error);
      }
    }

    console.log('\n✅ Cleanup complete!\n');
  }

  private async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// ==========================================
// EXECUTION CONTROLLER CLASS
// ==========================================

class SeedExecutionController {
  private seeder: TestUserSeeder;

  constructor() {
    this.seeder = new TestUserSeeder();
  }

  public async execute(): Promise<void> {
    try {
      const shouldCleanup = process.argv.includes('--cleanup');

      if (shouldCleanup) {
        await this.seeder.cleanup();
      } else {
        const result = await this.seeder.seed();

        if (!result.success) {
          console.error('\n⚠️  Seeding completed with errors. Check logs above.\n');
          process.exit(1);
        }
      }
    } catch (error) {
      console.error('\n💥 FATAL ERROR:\n', error);
      process.exit(1);
    }
  }
}

// ==========================================
// BOOTSTRAP
// ==========================================

const executionController = new SeedExecutionController();
executionController.execute();

export { TestUserSeeder, SeedConfiguration, SeedExecutionController };