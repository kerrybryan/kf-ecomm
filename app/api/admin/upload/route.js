import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const { url, base64 } = await request.json();

      if (url) {
        return NextResponse.json({ success: true, url, message: 'Image URL registered' });
      }

      if (base64) {
        // If Cloudinary credentials are set up, we could stream upload to Cloudinary
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

        if (cloudName && uploadPreset) {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64,
              upload_preset: uploadPreset,
              folder: 'nordika_catalog',
            }),
          });
          const data = await res.json();
          if (data.secure_url) {
            return NextResponse.json({ success: true, url: data.secure_url });
          }
        }

        // Fallback: return data URI for immediate preview
        return NextResponse.json({ success: true, url: base64 });
      }
    }

    return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
