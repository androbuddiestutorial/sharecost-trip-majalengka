import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/api',
        '/api/*',
        '/login',
        '/cek-pesanan',
        '/pembayaran',
        '/booking',
        '/booking/*',
      ],
    },
    sitemap: 'https://sharecosttripmajalengka.biz.id/sitemap.xml',
  };
}
