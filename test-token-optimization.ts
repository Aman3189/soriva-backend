import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

async function testTokenOptimization() {
  console.log('🧪 Testing Google Gemini API...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  
  // Test multiple model names
  const modelsToTest = [
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  for (const modelName of modelsToTest) {
    console.log(`\n🔧 Testing model: ${modelName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const systemPrompt = `You are Soriva, a helpful AI assistant. Be concise and natural.`;
      const userMessage = "What is AI in one sentence?";
      
      const prompt = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;

      console.log('🤖 Generating Response...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      console.log(`✅ SUCCESS with ${modelName}!`);
      console.log(`Response: ${response}`);
      
      // Estimate tokens
      const promptLength = prompt.length;
      const responseLength = response.length;
      const estimatedPromptTokens = Math.ceil(promptLength / 4);
      const estimatedResponseTokens = Math.ceil(responseLength / 4);
      const estimatedTotal = estimatedPromptTokens + estimatedResponseTokens;
      
      console.log(`\n📊 Estimated Tokens:`);
      console.log(`   Prompt: ~${estimatedPromptTokens} tokens`);
      console.log(`   Response: ~${estimatedResponseTokens} tokens`);
      console.log(`   Total: ~${estimatedTotal} tokens`);
      console.log(`   OLD (Groq): 1646 tokens`);
      console.log(`   🎯 Reduction: ~${Math.round((1 - estimatedTotal/1646) * 100)}%`);
      
      console.log(`\n✨ ${modelName} is WORKING! Use this model.`);
      break; // Stop after first successful model
      
    } catch (error: any) {
      console.log(`❌ ${modelName} failed: ${error.message}`);
      continue;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testTokenOptimization();