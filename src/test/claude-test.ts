import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

async function testClaude() {
  console.log('🧪 Testing Claude API...\n');

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Mujhe pizza recipe batao Hindi mein',
        },
      ],
    });

    console.log('✅ SUCCESS!\n');

    // Safe way to access content
    for (const block of message.content) {
      if (block.type === 'text') {
        console.log('Response:', block.text);
      }
    }

    console.log('\n📊 Token Usage:');
    console.log('  Input:', message.usage.input_tokens);
    console.log('  Output:', message.usage.output_tokens);
    console.log('  Total:', message.usage.input_tokens + message.usage.output_tokens);

    const cost = message.usage.input_tokens * 0.000003 + message.usage.output_tokens * 0.000015;
    console.log('\n💰 Cost: $' + cost.toFixed(6));
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);

    if (error.status === 401) {
      console.error('\n🔑 Authentication failed!');
      console.error('Check your API key in .env file');
    } else if (error.status === 429) {
      console.error('\n⏱️ Rate limit exceeded');
    } else {
      console.error('\nFull error:', error);
    }
  }
}

// Run the test
testClaude()
  .then(() => {
    console.log('\n✅ Test complete!');
  })
  .catch((err) => {
    console.error('\n❌ Test failed:', err);
  });
