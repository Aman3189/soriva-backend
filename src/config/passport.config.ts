import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient, Region, Currency } from '@prisma/client';
import { detectRegionFromHeaders } from './utils/region-detector';
import { Request } from 'express';

const prisma = new PrismaClient();

/**
 * ✅ Detect region for OAuth users
 */
function detectOAuthRegion(req: Request): { region: Region; currency: Currency } {
  try {
    const detected = detectRegionFromHeaders(req);
    console.log(`🌍 OAuth Region Detection: ${detected.region} (${detected.currency})`);
    return detected;
  } catch (error) {
    console.warn('⚠️ Region detection failed, defaulting to India:', error);
    return { region: Region.IN, currency: Currency.INR };  // ✅ IN not INDIA
  }
}

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const googleEmail = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleAvatar = profile.photos?.[0]?.value;

        if (!googleEmail) {
          console.error('❌ No email from Google');
          return done(new Error('No email found from Google'), undefined);
        }

        console.log(`📧 OAuth attempt: ${googleEmail}`);

        const { region, currency } = detectOAuthRegion(req);

        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        if (!user) {
          const existingUser = await prisma.user.findUnique({
            where: { email: googleEmail },
          });

          if (existingUser) {
            console.log(`🔗 Linking Google to: ${googleEmail}`);
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
            console.log(`🆕 Creating new OAuth user: ${googleEmail}`);
            user = await prisma.user.create({
              data: {
                email: googleEmail,
                googleId,
                googleEmail,
                name: name || 'User',
                googleAvatar,
                authProvider: 'google',
                subscriptionPlan: 'starter',
                planStatus: 'ACTIVE',
                region,
                currency,
              },
            });
            console.log(`✅ User created with region: ${region}`);
          }
        } else {
          console.log(`✅ Existing OAuth user: ${user.email}`);
        }

        return done(null, user);
      } catch (error) {
        console.error('❌ OAuth error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

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