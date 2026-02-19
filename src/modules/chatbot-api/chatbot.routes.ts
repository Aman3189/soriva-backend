// src/modules/chatbot-api/chatbot.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import { ChatbotController } from './chatbot.controller';
import { ChatbotClientService } from './client/chatbot-client.service';

const router = Router();
const controller = new ChatbotController();
const clientService = new ChatbotClientService();

// ============================================
// AUTH MIDDLEWARE
// ============================================

async function authenticateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const apiKey = req.headers['x-client-key'] as string;
    const { slug } = req.params;

    if (!apiKey) {
      res.status(401).json({ error: 'Missing x-client-key header' });
      return;
    }

    const client = await clientService.authenticateByApiKey(apiKey);

    if (!client) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // Verify slug matches
    if (client.slug !== slug) {
      res.status(403).json({ error: 'API key does not match client slug' });
      return;
    }

    req.authenticatedClient = client;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// ============================================
// ROUTES
// ============================================

// Send message
router.post(
  '/:slug/message',
  authenticateClient,
  (req: Request, res: Response) => controller.sendMessage(req, res)
);

// Get session info
router.get(
  '/:slug/session',
  authenticateClient,
  (req: Request, res: Response) => controller.getSession(req, res)
);

// Capture lead
router.post(
  '/:slug/lead',
  authenticateClient,
  (req: Request, res: Response) => controller.captureLead(req, res)
);

// Get widget config
router.get(
  '/:slug/config',
  authenticateClient,
  (req: Request, res: Response) => controller.getConfig(req, res)
);

export default router;