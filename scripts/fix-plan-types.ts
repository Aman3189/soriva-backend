import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPlanType() {
  try {
    const user = await prisma.user.update({
      where: { email: 'test@soriva.com' },
      data: { 
        planType: 'STARTER',  // Uppercase - matches enum!
      }
    });
    
    console.log('✅ Fixed plan type to:', user.planType);
    console.log('\n🔄 Now login again to get fresh token!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixPlanType();