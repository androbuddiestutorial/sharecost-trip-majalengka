import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 86400; // 1 hari

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sharecosttripmajalengka.biz.id';

  // Halaman Statis Publik
  const staticPages = [
    { url: '', priority: 1.0 },
    { url: '/tentang-kami', priority: 0.8 },
    { url: '/destinasi', priority: 0.9 },
    { url: '/trip', priority: 0.9 },
    { url: '/gallery', priority: 0.7 },
    { url: '/faq', priority: 0.6 },
    { url: '/kontak', priority: 0.8 },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route.priority,
  }));

  try {
    // Tarik data dinamis dari Destinasi
    const { data: destinations } = await supabase
      .from('destinations')
      .select('id, updated_at');

    const destinationPages = (destinations || []).map((dest) => ({
      url: `${baseUrl}/trip?dest=${dest.id}`,
      lastModified: new Date(dest.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...destinationPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
