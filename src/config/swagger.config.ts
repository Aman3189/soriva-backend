// src/config/swagger.config.ts
import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerOptions } from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Soriva Lumos API',
    version: '1.0.0',
    description: `
      **Soriva Lumos Backend API Documentation**
      
      A comprehensive AI-powered backend system with modular architecture.
      
      ## Features:
      - 🤖 AI Chat & Personality Engine
      - 📄 Document Processing & RAG System
      - 🎯 Orbit Analytics
      - 💳 Billing & Subscription Management
      - 🔐 Authentication & Authorization
      - 📊 Admin & Security Controls
    `,
    contact: {
      name: 'Soriva Team',
      email: 'support@soriva.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
    {
      url: 'https://api.soriva.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          error: {
            type: 'string',
            example: 'Error details',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Auth',
      description: 'Authentication & Authorization',
    },
    {
      name: 'AI',
      description: 'AI Chat & Processing',
    },
    {
      name: 'Chat',
      description: 'Chat Management',
    },
    {
      name: 'Document',
      description: 'Document Processing & Management',
    },
    {
      name: 'RAG',
      description: 'Retrieval Augmented Generation',
    },
    {
      name: 'Orbit',
      description: 'Orbit Analytics & Insights',
    },
    {
      name: 'Billing',
      description: 'Billing & Subscription Management',
    },
    {
      name: 'Admin',
      description: 'Admin & Security Controls',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  // Path to the API routes files
  apis: [
    'src/routes/*.ts',
    'src/modules/*/*.routes.ts',
    'src/core/*/*.routes.ts',
    'src/rag/*.routes.ts',
    'src/modules/*/*.controller.ts',
    'src/core/*/*.controller.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { font-size: 2.5em }
  `,
  customSiteTitle: 'Soriva Lumos API Docs',
  customfavIcon: '/favicon.ico',
};
