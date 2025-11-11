import { PrismaClient } from '@prisma/client';
import { CreateSettingDTO, UpdateSettingDTO, SettingResponseDTO, SettingsListDTO } from './dto/settings.dto';

const prisma = new PrismaClient();

/**
 * Custom Error Class
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * SettingsService - Handles all settings-related business logic
 */
export class SettingsService {
  /**
   * Get all settings with optional filtering
   */
  async getAllSettings(category?: string, isPublic?: boolean): Promise<SettingsListDTO> {
    try {
      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (isPublic !== undefined) {
        where.isPublic = isPublic;
      }

      const settings = await prisma.systemSettings.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      return new SettingsListDTO(settings, settings.length);
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw new AppError('Failed to fetch settings', 500);
    }
  }

  /**
   * Get setting by key
   */
  async getSettingByKey(key: string): Promise<SettingResponseDTO> {
    try {
      const setting = await prisma.systemSettings.findUnique({
        where: { key }
      });

      if (!setting) {
        throw new AppError('Setting not found', 404);
      }

      return new SettingResponseDTO(setting);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error fetching setting by key:', error);
      throw new AppError('Failed to fetch setting', 500);
    }
  }

  /**
   * Get setting by ID
   */
  async getSettingById(id: string): Promise<SettingResponseDTO> {
    try {
      const setting = await prisma.systemSettings.findUnique({
        where: { id }
      });

      if (!setting) {
        throw new AppError('Setting not found', 404);
      }

      return new SettingResponseDTO(setting);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error fetching setting by ID:', error);
      throw new AppError('Failed to fetch setting', 500);
    }
  }

  /**
   * Create new setting
   */
  async createSetting(data: CreateSettingDTO): Promise<SettingResponseDTO> {
    try {
      // Check if key already exists
      const existingSetting = await prisma.systemSettings.findUnique({
        where: { key: data.key }
      });

      if (existingSetting) {
        throw new AppError('Setting with this key already exists', 409);
      }

      const setting = await prisma.systemSettings.create({
        data: {
          key: data.key,
          value: data.value,
          category: data.category,
          description: data.description || null,
          isPublic: data.isPublic ?? true
        }
      });

      return new SettingResponseDTO(setting);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error creating setting:', error);
      throw new AppError('Failed to create setting', 500);
    }
  }

  /**
   * Update setting by key
   */
  async updateSetting(key: string, data: UpdateSettingDTO): Promise<SettingResponseDTO> {
    try {
      // Check if setting exists
      const existingSetting = await prisma.systemSettings.findUnique({
        where: { key }
      });

      if (!existingSetting) {
        throw new AppError('Setting not found', 404);
      }

      const updatedSetting = await prisma.systemSettings.update({
        where: { key },
        data: {
          value: data.value,
          category: data.category,
          description: data.description,
          isPublic: data.isPublic,
          updatedAt: new Date()
        }
      });

      return new SettingResponseDTO(updatedSetting);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error updating setting:', error);
      throw new AppError('Failed to update setting', 500);
    }
  }

  /**
   * Delete setting by key
   */
  async deleteSetting(key: string): Promise<void> {
    try {
      const setting = await prisma.systemSettings.findUnique({
        where: { key }
      });

      if (!setting) {
        throw new AppError('Setting not found', 404);
      }

      await prisma.systemSettings.delete({
        where: { key }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error deleting setting:', error);
      throw new AppError('Failed to delete setting', 500);
    }
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<SettingsListDTO> {
    try {
      const settings = await prisma.systemSettings.findMany({
        where: { category },
        orderBy: { key: 'asc' }
      });

      return new SettingsListDTO(settings, settings.length);
    } catch (error) {
      console.error('Error fetching settings by category:', error);
      throw new AppError('Failed to fetch settings', 500);
    }
  }

  /**
   * Get public settings only
   */
  async getPublicSettings(): Promise<SettingsListDTO> {
    try {
      const settings = await prisma.systemSettings.findMany({
        where: { isPublic: true },
        orderBy: { category: 'asc' }
      });

      return new SettingsListDTO(settings, settings.length);
    } catch (error) {
      console.error('Error fetching public settings:', error);
      throw new AppError('Failed to fetch public settings', 500);
    }
  }

  /**
   * Bulk update settings
   */
  async bulkUpdateSettings(updates: { key: string; value: string }[]): Promise<number> {
    try {
      let updatedCount = 0;

      for (const update of updates) {
        const setting = await prisma.systemSettings.findUnique({
          where: { key: update.key }
        });

        if (setting) {
          await prisma.systemSettings.update({
            where: { key: update.key },
            data: { 
              value: update.value,
              updatedAt: new Date()
            }
          });
          updatedCount++;
        }
      }

      return updatedCount;
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new AppError('Failed to bulk update settings', 500);
    }
  }
}