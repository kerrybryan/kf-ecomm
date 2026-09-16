export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kbfurniture.et';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
