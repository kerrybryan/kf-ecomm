import { NextResponse } from 'next/server';

/**
 * GET /api/auth/social/facebook
 * Redirects the user to Facebook's OAuth 2.0 consent dialog.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const redirectAfter = searchParams.get('redirect') || '/account';

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  if (!clientId) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:24px">
        <h2>Facebook Login Not Configured</h2>
        <p>Add <code>FACEBOOK_CLIENT_ID</code> and <code>FACEBOOK_CLIENT_SECRET</code> to your <code>.env.local</code> file, then restart the dev server.</p>
        <a href="/login">← Back to Login</a>
      </body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/social/facebook/callback`;

  // State encodes the post-login redirect destination
  const state = Buffer.from(JSON.stringify({ redirect: redirectAfter })).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email,public_profile',
    state,
  });

  return NextResponse.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
  );
}
