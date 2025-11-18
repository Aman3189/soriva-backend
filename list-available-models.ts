import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

async function listAvailableModels() {
  console.log('🔍 Fetching available models from Gemini API...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const apis = ['v1beta', 'v1'];

  for (const api of apis) {
    console.log(`Testing API version: ${api}`);
    const url = `https://generativelanguage.googleapis.com/${api}/models?key=${GOOGLE_API_KEY}`;

    try {
      const response = await axios.get(url);
      
      console.log(`✅ Success with ${api}!\n`);
      console.log('Available Models:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (response.data.models && response.data.models.length > 0) {
        response.data.models.forEach((model: any) => {
          console.log(`\n📦 ${model.name}`);
          console.log(`   Display Name: ${model.displayName || 'N/A'}`);
          console.log(`   Description: ${model.description || 'N/A'}`);
          if (model.supportedGenerationMethods) {
            console.log(`   Methods: ${model.supportedGenerationMethods.join(', ')}`);
          }
        });
      } else {
        console.log('No models found!');
      }
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
      
    } catch (error: any) {
      if (error.response) {
        console.log(`❌ ${api} failed: ${error.response.status} - ${error.response.data.error?.message || error.message}\n`);
      } else {
        console.log(`❌ ${api} failed: ${error.message}\n`);
      }
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  Could not fetch models from any API version!');
  console.log('\n💡 Possible Issues:');
  console.log('1. API key might be invalid or expired');
  console.log('2. API key might have restrictions (check AI Studio)');
  console.log('3. Generative Language API might not be properly enabled');
  console.log('\n📌 Next Steps:');
  console.log('1. Go to: https://aistudio.google.com/app/apikey');
  console.log('2. Check if key is still valid');
  console.log('3. Try creating a NEW API key');
  console.log('4. Make sure NO restrictions are set on the key');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

listAvailableModels();