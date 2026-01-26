/**
 * SORIVA QUERY ROUTER v2.0 - Main Export
 */
export * from './types';
export { QueryClassifier, queryClassifier, classifyQuery } from './classifier';
export { DirectResponder, directResponder } from './direct-responder';
export {
  GITA_CHAPTERS, FAMOUS_SHLOKAS, TOPIC_TO_SHLOKAS,
  getChapterInfo, getShlok, getShlokasByTopic, getRandomFamousShlok,
  formatShlokResponse, formatChapterResponse,
} from './gita-data';

import type { ClassificationResult, DirectResponse, UserContext, RouterResult } from './types';
import { queryClassifier } from './classifier';
import { directResponder } from './direct-responder';

export async function routeQuery(query: string, context?: UserContext): Promise<RouterResult> {
  const classification = queryClassifier.classify(query, context);
  
  console.log(`[QueryRouter] Classified: ${classification.queryType} (${classification.responseMode}) in ${classification.processingTimeMs}ms`);
  
  if (classification.responseMode === 'DIRECT') {
    const directResponse = await directResponder.respond(classification, query, context);
    
    if (directResponse.success) {
      console.log(`[QueryRouter] ✅ Direct response (0 tokens) - ${directResponse.source}`);
      return { handledDirectly: true, directResponse, classification };
    }
    
    console.log(`[QueryRouter] ⚠️ Direct failed: ${directResponse.error}`);
  }
  
  return {
    handledDirectly: false,
    classification,
    llmContext: {
      maxTokens: classification.responseMode === 'LLM_MINIMAL' ? 500 : 2000,
    },
  };
}