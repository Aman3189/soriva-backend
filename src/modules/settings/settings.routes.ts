import { Router } from 'express';
import { SettingsController } from './settings.controller';

const router = Router();
const settingsController = new SettingsController();

/**
 * Settings Routes
 * Base path: /api/settings
 */

/**
 * @route   GET /api/settings/public
 * @desc    Get all public settings
 * @access  Public
 */
router.get('/public', settingsController.getPublicSettings.bind(settingsController));

/**
 * @route   GET /api/settings/category/:category
 * @desc    Get settings by category
 * @access  Private (Admin)
 */
router.get('/category/:category', settingsController.getSettingsByCategory.bind(settingsController));

/**
 * @route   GET /api/settings/key/:key
 * @desc    Get setting by key
 * @access  Private (Admin)
 */
router.get('/key/:key', settingsController.getSettingByKey.bind(settingsController));

/**
 * @route   GET /api/settings/:id
 * @desc    Get setting by ID
 * @access  Private (Admin)
 */
router.get('/:id', settingsController.getSettingById.bind(settingsController));

/**
 * @route   GET /api/settings
 * @desc    Get all settings with optional filtering
 * @access  Private (Admin)
 */
router.get('/', settingsController.getAllSettings.bind(settingsController));

/**
 * @route   POST /api/settings
 * @desc    Create new setting
 * @access  Private (Admin)
 */
router.post('/', settingsController.createSetting.bind(settingsController));

/**
 * @route   PUT /api/settings/bulk
 * @desc    Bulk update settings
 * @access  Private (Admin)
 */
router.put('/bulk', settingsController.bulkUpdateSettings.bind(settingsController));

/**
 * @route   PUT /api/settings/key/:key
 * @desc    Update setting by key
 * @access  Private (Admin)
 */
router.put('/key/:key', settingsController.updateSetting.bind(settingsController));

/**
 * @route   DELETE /api/settings/key/:key
 * @desc    Delete setting by key
 * @access  Private (Admin)
 */
router.delete('/key/:key', settingsController.deleteSetting.bind(settingsController));

export default router;