import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';
import { CreateSettingDTO, UpdateSettingDTO } from './dto/settings.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

const settingsService = new SettingsService();

/**
 * SettingsController - Handles HTTP requests for settings operations
 */
export class SettingsController {
  /**
   * Get all settings with optional filtering
   * GET /api/settings?category=...&isPublic=...
   */
  async getAllSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, isPublic } = req.query;
      
      const isPublicBool = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;

      const settings = await settingsService.getAllSettings(
        category as string,
        isPublicBool
      );

      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      console.error('Get all settings error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch settings'
      });
    }
  }

  /**
   * Get setting by key
   * GET /api/settings/key/:key
   */
  async getSettingByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'Setting key is required'
        });
      }

      const setting = await settingsService.getSettingByKey(key);

      return res.status(200).json({
        success: true,
        data: setting
      });
    } catch (error: any) {
      console.error('Get setting by key error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch setting'
      });
    }
  }

  /**
   * Get setting by ID
   * GET /api/settings/:id
   */
  async getSettingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Setting ID is required'
        });
      }

      const setting = await settingsService.getSettingById(id);

      return res.status(200).json({
        success: true,
        data: setting
      });
    } catch (error: any) {
      console.error('Get setting by ID error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch setting'
      });
    }
  }

  /**
   * Create new setting
   * POST /api/settings
   */
  async createSetting(req: Request, res: Response, next: NextFunction) {
    try {
      // Transform and validate DTO
      const createData = plainToClass(CreateSettingDTO, req.body);
      const errors = await validate(createData);

      if (errors.length > 0) {
        const formattedErrors = errors.map(error => ({
          field: error.property,
          messages: Object.values(error.constraints || {})
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }

      const setting = await settingsService.createSetting(createData);

      return res.status(201).json({
        success: true,
        message: 'Setting created successfully',
        data: setting
      });
    } catch (error: any) {
      console.error('Create setting error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create setting'
      });
    }
  }

  /**
   * Update setting by key
   * PUT /api/settings/key/:key
   */
  async updateSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'Setting key is required'
        });
      }

      // Transform and validate DTO
      const updateData = plainToClass(UpdateSettingDTO, req.body);
      const errors = await validate(updateData);

      if (errors.length > 0) {
        const formattedErrors = errors.map(error => ({
          field: error.property,
          messages: Object.values(error.constraints || {})
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }

      const setting = await settingsService.updateSetting(key, updateData);

      return res.status(200).json({
        success: true,
        message: 'Setting updated successfully',
        data: setting
      });
    } catch (error: any) {
      console.error('Update setting error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update setting'
      });
    }
  }

  /**
   * Delete setting by key
   * DELETE /api/settings/key/:key
   */
  async deleteSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'Setting key is required'
        });
      }

      await settingsService.deleteSetting(key);

      return res.status(200).json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete setting error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete setting'
      });
    }
  }

  /**
   * Get settings by category
   * GET /api/settings/category/:category
   */
  async getSettingsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category is required'
        });
      }

      const settings = await settingsService.getSettingsByCategory(category);

      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      console.error('Get settings by category error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch settings'
      });
    }
  }

  /**
   * Get public settings only
   * GET /api/settings/public
   */
  async getPublicSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getPublicSettings();

      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      console.error('Get public settings error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch public settings'
      });
    }
  }

  /**
   * Bulk update settings
   * PUT /api/settings/bulk
   */
  async bulkUpdateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
      }

      const updatedCount = await settingsService.bulkUpdateSettings(updates);

      return res.status(200).json({
        success: true,
        message: `${updatedCount} settings updated successfully`,
        updatedCount
      });
    } catch (error: any) {
      console.error('Bulk update settings error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to bulk update settings'
      });
    }
  }
}