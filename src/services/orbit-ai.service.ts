/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ORBIT AI SERVICE
 * AI-powered orbit suggestions and learning system
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  OrbitSuggestion,
  OrbitWithKeywords,
  OrbitSuggestionStats,
} from '../types/orbit-ai.types';

const prisma = new PrismaClient();

export class OrbitAIService {
  /**
   * Suggest orbits based on conversation title
   */
  async suggestOrbit(
    userId: string,
    conversationTitle: string,
  ): Promise<OrbitSuggestion[]> {
    // Get user's orbits with learned keywords
    const userOrbits = await this.getOrbitsWithKeywords(userId);

    if (userOrbits.length === 0) {
      return []; // No orbits to suggest
    }

    // Calculate match scores
    const suggestions: OrbitSuggestion[] = [];

    for (const orbit of userOrbits) {
      const score = this.calculateMatchScore(conversationTitle, orbit.keywords);

      if (score > 0.3) {
        // Minimum 30% confidence
        suggestions.push({
          orbitId: orbit.id,
          orbitName: orbit.name,
          confidence: score,
          reason: this.getMatchReason(conversationTitle, orbit.keywords),
        });
      }
    }

    // Sort by confidence (highest first) and return top 3
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  /**
   * Track user feedback on suggestions
   */
  async trackFeedback(
    userId: string,
    conversationId: string,
    suggestedOrbitId: string,
    userChoice: 'accepted' | 'rejected' | 'different',
    selectedOrbitId?: string,
  ): Promise<void> {
    // Save feedback to database
    await prisma.$executeRaw`
      INSERT INTO orbit_suggestions (
        id, user_id, conversation_id, suggested_orbit_id, 
        user_choice, selected_orbit_id, confidence
      ) VALUES (
        ${uuidv4()}, ${userId}, ${conversationId}, ${suggestedOrbitId},
        ${userChoice}, ${selectedOrbitId || null}, 0.0
      )
    `;

    // Learn from user's choice
    if (userChoice === 'accepted') {
      await this.strengthenKeywords(userId, suggestedOrbitId, conversationId);
    } else if (userChoice === 'different' && selectedOrbitId) {
      await this.learnFromCorrection(userId, selectedOrbitId, conversationId);
    }
  }

  /**
   * Get suggestion accuracy stats
   */
  async getStats(userId: string): Promise<OrbitSuggestionStats> {
    const suggestions = await prisma.$queryRaw<any[]>`
      SELECT user_choice, COUNT(*) as count
      FROM orbit_suggestions
      WHERE user_id = ${userId}
      GROUP BY user_choice
    `;

    const stats = {
      totalSuggestions: 0,
      accepted: 0,
      rejected: 0,
      different: 0,
      accuracy: 0,
    };

    suggestions.forEach((row) => {
      const count = Number(row.count);
      stats.totalSuggestions += count;

      if (row.user_choice === 'accepted') stats.accepted = count;
      else if (row.user_choice === 'rejected') stats.rejected = count;
      else if (row.user_choice === 'different') stats.different = count;
    });

    // Calculate accuracy (accepted / total)
    stats.accuracy =
      stats.totalSuggestions > 0
        ? Math.round((stats.accepted / stats.totalSuggestions) * 100)
        : 0;

    return stats;
  }

  /**
   * Get user's orbits with learned keywords
   */
  private async getOrbitsWithKeywords(
    userId: string,
  ): Promise<OrbitWithKeywords[]> {
    const orbits = await prisma.$queryRaw<any[]>`
      SELECT 
        o.id,
        o.name,
        GROUP_CONCAT(ok.keyword SEPARATOR ',') as keywords
      FROM orbits o
      LEFT JOIN orbit_keywords ok ON o.id = ok.orbit_id
      WHERE o.user_id = ${userId}
      GROUP BY o.id, o.name
    `;

    return orbits.map((orbit) => ({
      id: orbit.id,
      name: orbit.name,
      keywords: orbit.keywords ? orbit.keywords.split(',') : [],
    }));
  }

  /**
   * Calculate match score between title and keywords
   */
  private calculateMatchScore(title: string, keywords: string[]): number {
    if (keywords.length === 0) return 0;

    const titleLower = title.toLowerCase();
    let matchCount = 0;

    for (const keyword of keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // Score = matched keywords / total keywords
    return Number((matchCount / keywords.length).toFixed(2));
  }

  /**
   * Get human-readable match reason
   */
  private getMatchReason(title: string, keywords: string[]): string {
    const titleLower = title.toLowerCase();
    const matched = keywords.filter((k) =>
      titleLower.includes(k.toLowerCase()),
    );

    if (matched.length === 0) return 'Similar content';
    if (matched.length === 1) return `Contains "${matched[0]}"`;
    if (matched.length === 2)
      return `Contains "${matched[0]}" and "${matched[1]}"`;
    return `Contains ${matched.length} matching keywords`;
  }

  /**
   * Strengthen keywords when user accepts suggestion
   */
  private async strengthenKeywords(
    userId: string,
    orbitId: string,
    conversationId: string,
  ): Promise<void> {
    // Get conversation title
    const conversation = await prisma.$queryRaw<any[]>`
      SELECT title FROM conversations WHERE id = ${conversationId} LIMIT 1
    `;

    if (conversation.length === 0) return;

    const title = conversation[0].title;
    const keywords = this.extractKeywords(title);

    // Add/update keywords
    for (const keyword of keywords) {
      await prisma.$executeRaw`
        INSERT INTO orbit_keywords (id, user_id, orbit_id, keyword, weight)
        VALUES (${uuidv4()}, ${userId}, ${orbitId}, ${keyword}, 1.0)
        ON DUPLICATE KEY UPDATE weight = weight + 0.1
      `;
    }
  }

  /**
   * Learn from user correction (chose different orbit)
   */
  private async learnFromCorrection(
    userId: string,
    correctOrbitId: string,
    conversationId: string,
  ): Promise<void> {
    // Get conversation title
    const conversation = await prisma.$queryRaw<any[]>`
      SELECT title FROM conversations WHERE id = ${conversationId} LIMIT 1
    `;

    if (conversation.length === 0) return;

    const title = conversation[0].title;
    const keywords = this.extractKeywords(title);

    // Add keywords to correct orbit
    for (const keyword of keywords) {
      await prisma.$executeRaw`
        INSERT INTO orbit_keywords (id, user_id, orbit_id, keyword, weight)
        VALUES (${uuidv4()}, ${userId}, ${correctOrbitId}, ${keyword}, 1.0)
        ON DUPLICATE KEY UPDATE weight = weight + 0.2
      `;
    }
  }

  /**
   * Extract keywords from title (simple algorithm)
   */
  private extractKeywords(title: string): string[] {
    // Stop words to ignore
    const stopWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'can',
      'may',
      'might',
      'must',
      'this',
      'that',
      'these',
      'those',
      'i',
      'you',
      'he',
      'she',
      'it',
      'we',
      'they',
      'what',
      'which',
      'who',
      'when',
      'where',
      'why',
      'how',
    ];

    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split by spaces
      .filter((word) => word.length > 3) // Min 4 characters
      .filter((word) => !stopWords.includes(word)) // Remove stop words
      .slice(0, 5); // Max 5 keywords
  }
}

export default new OrbitAIService();