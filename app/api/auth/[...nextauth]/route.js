import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, AUTH_COOKIE_CONFIG } from '@/lib/auth';
import { cookies } from 'next/headers';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret',
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'dummy_facebook_client_id',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy_facebook_client_secret',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'kb_furniture_nextauth_secret_key_2026',
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        await connectDB();
        const userEmail = user.email.toLowerCase().trim();
        let dbUser = await User.findOne({ email: userEmail });

        if (dbUser) {
          // Link social profile to existing account if not yet linked
          const providerName = account?.provider || 'social';
          const providerId = account?.providerAccountId || profile?.id || null;

          if (!dbUser.providerId || dbUser.provider === 'email') {
            dbUser.provider = providerName;
            dbUser.providerId = providerId;
          }
          if (!dbUser.avatar && user.image) {
            dbUser.avatar = user.image;
          }
          dbUser.lastLogin = new Date();
          await dbUser.save();
        } else {
          // Auto-create new customer account with verified email
          dbUser = await User.create({
            name: user.name || 'Valued Customer',
            email: userEmail,
            passwordHash: null,
            provider: account?.provider || 'social',
            providerId: account?.providerAccountId || profile?.id || null,
            avatar: user.image || null,
            role: 'customer',
            status: 'active',
            addresses: [],
            wishlist: [],
          });
        }

        // Set our app's custom JWT cookie for unified API access
        const customToken = signToken({
          userId: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        });

        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_CONFIG.name, customToken, AUTH_COOKIE_CONFIG.options);

        return true;
      } catch (err) {
        console.error('NextAuth signIn callback error:', err);
        return true; // Still allow sign in if DB linking has temporary issue
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
