// src/controllers/workspace.routes.ts

import { Router } from 'express';
import { workspaceController } from './workspace.controller';
import { authMiddleware } from '../modules/auth/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ============================================
// 📦 TOOLS & CONFIG
// ============================================
router.get('/tools', workspaceController.getTools.bind(workspaceController));

// ============================================
// 📊 USER STATUS
// ============================================
router.get('/status', workspaceController.getStatus.bind(workspaceController));

// ============================================
// 🚀 GENERATE
// ============================================
router.post('/generate', workspaceController.generate.bind(workspaceController));

// ============================================
// ✏️ EDIT
// ============================================
router.post('/edit/:generationId', workspaceController.edit.bind(workspaceController));

// ============================================
// 👁️ PREVIEW (HTML)
// ============================================
router.get('/preview/:generationId', workspaceController.preview.bind(workspaceController));

// ============================================
// 📥 DOWNLOAD (PDF/DOCX/PNG)
// ============================================
router.get('/download/:generationId', workspaceController.download.bind(workspaceController));

// ============================================
// 📄 GET GENERATION
// ============================================
router.get('/generation/:generationId', workspaceController.getGeneration.bind(workspaceController));

// ============================================
// 📋 LIST GENERATIONS
// ============================================
router.get('/generations', workspaceController.listGenerations.bind(workspaceController));

export default router;