import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    // Bypass Next.js image optimizer for external sources — prevents "upstream image
    // response failed" errors when Unsplash/picsum throttle server-side proxy requests.
    // Images still load directly from CDN at their native quality (which is fine for
    // photos already served from a fast CDN like Unsplash/images.pexels.com).
    unoptimized: true,

    // Keep remotePatterns for components still explicitly using next/image (optional
    // but harmless when unoptimized: true is set).
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },   // Google OAuth avatars
      { protocol: 'https', hostname: 'graph.facebook.com' },           // Facebook OAuth avatars
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' }, // Facebook CDN avatars
    ],
  },
};

export default nextConfig;
