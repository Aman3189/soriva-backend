import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = 'test@soriva.com';
  const password = 'Test@123';
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with ONLY valid fields
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Test User',
        planType: 'STARTER',
        // emailVerified doesn't exist - removed!
        authProvider: 'email',
        subscriptionPlan: 'starter',
        planStatus: 'ACTIVE',
      },
    });

    console.log('✅ Test user created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Plan:', user.planType);
    console.log('User ID:', user.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  User already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email: test@soriva.com');
      console.log('Password: Test@123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();