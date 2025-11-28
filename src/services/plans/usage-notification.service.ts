/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📊 USAGE NOTIFICATION SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Handles chat usage notifications at different thresholds:
 * - 80%: Extension loading animation (fake, just UX)
 * - 95%: Booster warning + cooldown timer
 * - 100%: Limit reached, show booster purchase
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📌 INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type NotificationType = 
    | 'EXTENSION_LOADING' 
    | 'EXTENSION_DONE' 
    | 'BOOSTER_WARNING' 
    | 'LIMIT_REACHED';

export interface UsageNotification {
    show: boolean;
    type?: NotificationType;
    message?: string;
    subMessage?: string;
    blocked?: boolean;
    loadingDuration?: number;
    cooldownRemaining?: number;
    showBooster?: boolean;
    usagePercent?: number;
}

export interface UserUsageData {
    userId: string;
    tokensUsed: number;
    tokensLimit: number;
    extensionShownToday: boolean;
    cooldownEndsAt: Date | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 USAGE NOTIFICATION SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class UsageNotificationService {
    
    // Thresholds
    private readonly EXTENSION_THRESHOLD = 80;
    private readonly BOOSTER_WARNING_THRESHOLD = 95;
    private readonly LIMIT_THRESHOLD = 100;
    
    // Loading animation duration (seconds)
    private readonly EXTENSION_LOADING_DURATION = 15;
    
    // Messages
    private readonly MESSAGES = {
        EXTENSION_LOADING: {
            message: "Please wait...",
            subMessage: "We're extending your conversation limit"
        },
        EXTENSION_DONE: {
            message: "🎉 Great news!",
            subMessage: "Your limit has been extended. Keep the conversation going!"
        },
        BOOSTER_WARNING: {
            message: "⚡ Almost at your limit!",
            subMessage: "Get a booster or wait for cooldown to reset"
        },
        LIMIT_REACHED: {
            message: "You've reached your limit",
            subMessage: "Grab a booster to continue the conversation!"
        }
    };
    
    private prisma: PrismaClient;
    
    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔍 MAIN CHECK METHOD
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    public async checkUsage(userId: string): Promise<UsageNotification> {
        try {
            const usageData = await this.getUserUsage(userId);
            const percent = this.calculatePercentage(usageData.tokensUsed, usageData.tokensLimit);
            
            // 100% - Limit reached
            if (percent >= this.LIMIT_THRESHOLD) {
                return this.getLimitReachedNotification(usageData, percent);
            }
            
            // 95% - Booster warning
            if (percent >= this.BOOSTER_WARNING_THRESHOLD) {
                return this.getBoosterWarningNotification(usageData, percent);
            }
            
            // 80% - Extension loading (only once per day)
            if (percent >= this.EXTENSION_THRESHOLD && !usageData.extensionShownToday) {
                await this.markExtensionShown(userId);
                return this.getExtensionLoadingNotification(percent);
            }
            
            // Below thresholds - no notification
            return { show: false };
            
        } catch (error) {
            console.error('[UsageNotificationService] Error checking usage:', error);
            return { show: false };
        }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 GET USER USAGE - Matches your Prisma Schema
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private async getUserUsage(userId: string): Promise<UserUsageData> {
        // Fetch user with subscriptions and usage
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                usage: true  // UserUsage relation
            }
        });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Get active subscription
        const activeSubscription = user.subscriptions[0];
        
        // Token limits from subscription or defaults
        const tokensLimit = activeSubscription?.monthlyTokens ?? 50000; // Default 50K
        const tokensUsed = activeSubscription?.tokensUsed ?? 0;
        
        // Check if extension was shown today (from DB)
        const extensionShownToday = user.usage?.extensionShownAt 
            ? this.isToday(user.usage.extensionShownAt)
            : false;
        
        // Cooldown from user model
        const cooldownEndsAt = user.cooldownResetDate ?? null;
        
        return {
            userId,
            tokensUsed,
            tokensLimit,
            extensionShownToday,
            cooldownEndsAt
        };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔔 NOTIFICATION GENERATORS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private getExtensionLoadingNotification(percent: number): UsageNotification {
        return {
            show: true,
            type: 'EXTENSION_LOADING',
            message: this.MESSAGES.EXTENSION_LOADING.message,
            subMessage: this.MESSAGES.EXTENSION_LOADING.subMessage,
            blocked: true,
            loadingDuration: this.EXTENSION_LOADING_DURATION,
            usagePercent: percent
        };
    }
    
    public getExtensionDoneNotification(): UsageNotification {
        return {
            show: true,
            type: 'EXTENSION_DONE',
            message: this.MESSAGES.EXTENSION_DONE.message,
            subMessage: this.MESSAGES.EXTENSION_DONE.subMessage,
            blocked: false
        };
    }
    
    private getBoosterWarningNotification(usageData: UserUsageData, percent: number): UsageNotification {
        const cooldownRemaining = this.getCooldownSeconds(usageData.cooldownEndsAt);
        
        return {
            show: true,
            type: 'BOOSTER_WARNING',
            message: this.MESSAGES.BOOSTER_WARNING.message,
            subMessage: this.MESSAGES.BOOSTER_WARNING.subMessage,
            blocked: false,
            cooldownRemaining,
            showBooster: true,
            usagePercent: percent
        };
    }
    
    private getLimitReachedNotification(usageData: UserUsageData, percent: number): UsageNotification {
        const cooldownRemaining = this.getCooldownSeconds(usageData.cooldownEndsAt);
        
        return {
            show: true,
            type: 'LIMIT_REACHED',
            message: this.MESSAGES.LIMIT_REACHED.message,
            subMessage: this.MESSAGES.LIMIT_REACHED.subMessage,
            blocked: true,
            cooldownRemaining,
            showBooster: true,
            usagePercent: percent
        };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛠️ HELPER METHODS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private calculatePercentage(used: number, limit: number): number {
        if (limit <= 0) return 100;
        return Math.round((used / limit) * 100);
    }
    
    private getCooldownSeconds(cooldownEndsAt: Date | null): number {
        if (!cooldownEndsAt) return 0;
        
        const now = new Date();
        const diff = cooldownEndsAt.getTime() - now.getTime();
        
        return diff > 0 ? Math.ceil(diff / 1000) : 0;
    }
    
    private isToday(date: Date): boolean {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }
    
    private async markExtensionShown(userId: string): Promise<void> {
        // Store in database (persistent across server restarts)
        await this.prisma.userUsage.upsert({
            where: { userId },
            update: { 
                extensionShownAt: new Date() 
            },
            create: { 
                userId,
                extensionShownAt: new Date(),
                monthlyResetAt: new Date(),
                dailyResetAt: new Date(),
                minuteResetAt: new Date(),
                hourResetAt: new Date()
            }
        });
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 UTILITY: Format cooldown for display
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    public formatCooldown(seconds: number): string {
        if (seconds <= 0) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Usage:
// import { usageNotificationService } from './usage-notification.service';
// const notification = await usageNotificationService.checkUsage(userId);

export default UsageNotificationService;