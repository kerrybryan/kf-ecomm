import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, AUTH_COOKIE_CONFIG } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/social/google/callback
 * Handles the OAuth2 code exchange with Google, upserts User, issues JWT session.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // User denied access or Google returned an error
  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_denied`);
  }

  // Decode state to get post-login redirect destination
  let redirectAfter = '/account';
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
    redirectAfter = decoded.redirect || '/account';
    // Safety: only allow relative paths
    if (!redirectAfter.startsWith('/')) redirectAfter = '/account';
  } catch (_) {}

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/auth/social/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=google_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_profile_failed`);
    }

    const profile = await profileRes.json();
    // profile: { id, email, name, picture, verified_email }

    if (!profile.email || !profile.verified_email) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_unverified_email`);
    }

    // 3. Upsert user in MongoDB
    await connectDB();

    let user = await User.findOne({ email: profile.email.toLowerCase() });

    if (user) {
      // Link Google to existing account (email-based or previous social)
      if (!user.providerId || user.provider === 'email') {
        user.provider = 'google';
        user.providerId = profile.id;
        user.avatar = user.avatar || profile.picture;
        user.lastLogin = new Date();
        await user.save();
      } else {
        user.lastLogin = new Date();
        await user.save();
      }
    } else {
      // Create new user from Google profile
      user = await User.create({
        name: profile.name,
        email: profile.email.toLowerCase(),
        passwordHash: null,
        provider: 'google',
        providerId: profile.id,
        avatar: profile.picture || null,
        role: 'customer',
        status: 'active',
        addresses: [],
        wishlist: [],
      });
    }

    // 4. Issue JWT session cookie (same as email login)
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
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_server_error`);
  }
}
