// src/studio/providers/TalkingPhotoProviderFactory.ts
// ✅ Factory Pattern for Talking Photo Providers
// Switch between Replicate and HeyGen with 1 line change!

import { ITalkingPhotoProvider } from './ITalkingPhotoProvider';
import { ReplicateLivePortraitProvider } from './ReplicateLivePortraitProvider';
import { HeyGenProvider } from './HeyGenProvider';
import { STUDIO_CONFIG } from '../config/studio.config';

/**
 * Factory class to get the appropriate talking photo provider
 * Based on studio.config.ts settings
 */
export class TalkingPhotoProviderFactory {
  private static providers: Map<string, ITalkingPhotoProvider> = new Map();

  /**
   * Initialize providers (singleton pattern)
   */
  private static initializeProviders() {
    if (this.providers.size === 0) {
      this.providers.set('replicate', new ReplicateLivePortraitProvider());
      this.providers.set('heygen', new HeyGenProvider());
    }
  }

  /**
   * Get the current active provider based on config
   */
  static getProvider(): ITalkingPhotoProvider {
    this.initializeProviders();

    const currentProvider = STUDIO_CONFIG.talkingPhotos.currentProvider;
    const provider = this.providers.get(currentProvider);

    if (!provider) {
      throw new Error(`Provider '${currentProvider}' not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(
        `Provider '${currentProvider}' is not available. Check API keys in .env`
      );
    }

    return provider;
  }

  /**
   * Get a specific provider by name (for testing/fallback)
   */
  static getProviderByName(providerName: 'replicate' | 'heygen'): ITalkingPhotoProvider {
    this.initializeProviders();

    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(
        `Provider '${providerName}' is not available. Check API keys in .env`
      );
    }

    return provider;
  }

  /**
   * Get all available providers
   */
  static getAllProviders(): ITalkingPhotoProvider[] {
    this.initializeProviders();
    return Array.from(this.providers.values());
  }

  /**
   * Get provider info for all providers
   */
  static getProvidersInfo() {
    this.initializeProviders();

    const providersInfo = Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      available: provider.isAvailable(),
      info: provider.getProviderInfo(),
    }));

    return {
      currentProvider: STUDIO_CONFIG.talkingPhotos.currentProvider,
      providers: providersInfo,
    };
  }

  /**
   * Check if current provider is available
   */
  static isCurrentProviderAvailable(): boolean {
    this.initializeProviders();

    const currentProvider = STUDIO_CONFIG.talkingPhotos.currentProvider;
    const provider = this.providers.get(currentProvider);

    return provider ? provider.isAvailable() : false;
  }

  /**
   * Get fallback provider if current fails
   */
  static getFallbackProvider(): ITalkingPhotoProvider | null {
    this.initializeProviders();

    const currentProvider = STUDIO_CONFIG.talkingPhotos.currentProvider;
    const allProviders = Array.from(this.providers.entries());

    // Find first available provider that's not the current one
    for (const [name, provider] of allProviders) {
      if (name !== currentProvider && provider.isAvailable()) {
        return provider;
      }
    }

    return null;
  }

  /**
   * Switch provider at runtime (for admin panel)
   */
  static switchProvider(newProvider: 'replicate' | 'heygen'): void {
    this.initializeProviders();

    const provider = this.providers.get(newProvider);

    if (!provider) {
      throw new Error(`Provider '${newProvider}' not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider '${newProvider}' is not available`);
    }

    // Update config (in production, this should update database)
    (STUDIO_CONFIG.talkingPhotos as any).currentProvider = newProvider;

    console.log(`✅ Switched to provider: ${newProvider}`);
  }

  /**
   * Get cost comparison for all providers
   */
  static getCostComparison(duration: number) {
    this.initializeProviders();

    const comparison = Array.from(this.providers.entries()).map(([name, provider]) => ({
      provider: name,
      cost: provider.getEstimatedCost(duration),
      quality: provider.getProviderInfo().quality,
      available: provider.isAvailable(),
    }));

    return comparison;
  }
}