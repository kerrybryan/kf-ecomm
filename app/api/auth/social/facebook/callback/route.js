import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, AUTH_COOKIE_CONFIG } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/social/facebook/callback
 * Handles the OAuth2 code exchange with Facebook, upserts User, issues JWT session.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=facebook_denied`);
  }

  let redirectAfter = '/account';
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
    redirectAfter = decoded.redirect || '/account';
    if (!redirectAfter.startsWith('/')) redirectAfter = '/account';
  } catch (_) {}

  try {
    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      redirect_uri: `${baseUrl}/api/auth/social/facebook/callback`,
      code,
    });

    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`);
    if (!tokenRes.ok) {
      console.error('Facebook token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=facebook_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch profile from Facebook Graph API
    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    if (!profileRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=facebook_profile_failed`);
    }

    const profile = await profileRes.json();
    const userEmail = profile.email ? profile.email.toLowerCase() : `fb_${profile.id}@kbfurniture.user`;
    const avatarUrl = profile.picture?.data?.url || null;

    // 3. Upsert user in MongoDB
    await connectDB();

    let user = await User.findOne({ email: userEmail });

    if (user) {
      if (!user.providerId || user.provider === 'email') {
        user.provider = 'facebook';
        user.providerId = profile.id;
        user.avatar = user.avatar || avatarUrl;
        user.lastLogin = new Date();
        await user.save();
      } else {
        user.lastLogin = new Date();
        await user.save();
      }
    } else {
      user = await User.create({
        name: profile.name || 'Facebook User',
        email: userEmail,
        passwordHash: null,
        provider: 'facebook',
        providerId: profile.id,
        avatar: avatarUrl,
        role: 'customer',
        status: 'active',
        addresses: [],
        wishlist: [],
      });
    }

    // 4. Issue JWT session cookie
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.redirect(`${baseUrl}${redirectAfter}`);
    response.cookies.set(AUTH_COOKIE_CONFIG.name, token, AUTH_COOKIE_CONFIG.options);
    return response;
  } catch (err) {
    console.error('Facebook OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=facebook_server_error`);
  }
}
