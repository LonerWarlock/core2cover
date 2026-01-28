import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin', 
        '/seller/dashboard', 
        '/designer/dashboard',
        '/api' 
      ],
    },
    sitemap: 'https://core2cover.vercel.app/sitemap.xml',
  }
}