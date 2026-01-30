// src/rag/index.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA Backend - RAG Module Exports
// Pattern: BARREL EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Routes
export { default as ragRoutes } from './rag.routes';

// Controllers
export { RAGController, requestContextMiddleware } from './controllers/rag.controller';

// Services - Classes
export { RAGService } from './services/rag.service';
export { EmbeddingService } from './services/embedding.service';
export { RetrieverService } from './services/retriever.service';
export { VectorStoreService } from './services/vector-store.service';
export { RAGSecurityService } from './services/rag-security.service';
export { DocumentProcessorService } from './services/document-processor';

// Services - Singleton Instances (default exports)
export { default as ragService } from './services/rag.service';
export { default as embeddingService } from './services/embedding.service';
export { default as retrieverService } from './services/retriever.service';
export { default as vectorStoreService } from './services/vector-store.service';
export { default as ragSecurityService } from './services/rag-security.service';
export { default as documentProcessor } from './services/document-processor';

// Config
export { getControllerConfig, reloadControllerConfig } from './config/rag-controller.config';
export type { ControllerConfiguration } from './config/rag-controller.config';

// Error Classes
export {
  RAGError,
  DocumentValidationError,
  DocumentProcessingError,
  QueryValidationError,
  SecurityValidationError,
} from './services/rag.service';