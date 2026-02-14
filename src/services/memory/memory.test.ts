// src/services/memory/memory.test.ts
import { memoryService } from './memory.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMemorySystem() {
  console.log('🧪 Testing Memory System...\n');

  // First create a test user
  console.log('0. Creating test user...');
  const testUser = await prisma.user.upsert({
    where: { email: 'test@soriva.com' },
    update: {},
    create: {
      email: 'test@soriva.com',
      name: 'Test User',
      authProvider: 'email',
      planStartDate: new Date()
    }
  });
  console.log('✅ Test user ready:', testUser.id);

  const userId = testUser.id;
  const conversationId = 'test-conv-' + Date.now();

  // Test 1: Create memory
  console.log('\n1. Creating memory...');
  const memory = await memoryService.getOrCreateMemory(userId, conversationId);
  console.log('✅ Memory created:', memory.id);

  // Test 2: Add messages
  console.log('\n2. Adding messages...');
  await memoryService.addMessage({
    userId,
    conversationId,
    role: 'user',
    content: 'Mera naam Aman hai aur main Soriva bana raha hoon'
  });
  await memoryService.addMessage({
    userId,
    conversationId,
    role: 'assistant',
    content: 'Namaste Aman! Soriva ek AI platform hai jo tum build kar rahe ho.'
  });
  console.log('✅ Messages added');

  // Test 3: Get context
  console.log('\n3. Getting memory context...');
  const context = await memoryService.getMemoryContext(userId, conversationId);
  console.log('✅ Context:', JSON.stringify(context, null, 2));

  // Test 4: Update system memory
  console.log('\n4. Updating system memory...');
  await memoryService.updateSystemMemory(userId, conversationId, {
    facts: { name: 'Aman', project: 'Soriva' },
    preferences: { language: 'Hinglish' }
  });
  console.log('✅ System memory updated');

  // Test 5: Get stats
  console.log('\n5. Getting stats...');
  const stats = await memoryService.getStats(userId, conversationId);
  console.log('✅ Stats:', stats);

  // Test 6: Build prompt context
  console.log('\n6. Building prompt context...');
  const updatedContext = await memoryService.getMemoryContext(userId, conversationId);
  const promptContext = memoryService.buildPromptContext(updatedContext);
  console.log('✅ Prompt Context:\n', promptContext);

  // Cleanup
  console.log('\n7. Cleaning up...');
  await memoryService.clearMemory(userId, conversationId);
  console.log('✅ Memory cleared');

  console.log('\n🎉 All tests passed!');
  
  await prisma.$disconnect();
  process.exit(0);
}

testMemorySystem().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});