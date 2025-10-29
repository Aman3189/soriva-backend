import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user data from Google profile
        const googleId = profile.id;
        const googleEmail = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleAvatar = profile.photos?.[0]?.value;

        if (!googleEmail) {
          return done(new Error('No email found from Google'), undefined);
        }

        // Check if user exists with this Google ID
        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        if (!user) {
          // Check if user exists with same email (email/password user)
          const existingUser = await prisma.user.findUnique({
            where: { email: googleEmail },
          });

          if (existingUser) {
            // Link Google account to existing email/password account
            user = await prisma.user.update({
              where: { email: googleEmail },
              data: {
                googleId,
                googleEmail,
                googleAvatar,
                authProvider: 'google',
              },
            });
          } else {
            // Create new user with Google data
            user = await prisma.user.create({
              data: {
                email: googleEmail,
                googleId,
                googleEmail,
                name,
                googleAvatar,
                authProvider: 'google',
                subscriptionPlan: 'starter',
                planStatus: 'ACTIVE',
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user (save user ID to session)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user (retrieve user from DB using ID)
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
