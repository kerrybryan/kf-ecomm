import { NextResponse } from 'next/server';

/**
 * GET /api/auth/social/google
 * Redirects the user to Google's OAuth 2.0 consent screen.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const redirectAfter = searchParams.get('redirect') || '/account';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    // Graceful error page when credentials aren't set up yet
    return new NextResponse(
      `<html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:24px">
        <h2>Google Login Not Configured</h2>
        <p>Add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to your <code>.env.local</code> file, then restart the dev server.</p>
        <a href="/login">← Back to Login</a>
      </body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/social/google/callback`;

  // State encodes the post-login redirect destination — prevents CSRF
  const state = Buffer.from(JSON.stringify({ redirect: redirectAfter })).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    state,
    prompt: 'select_account',
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
