import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastMod = new Date();

  return [
    { url: `${base}/`, lastModified: lastMod, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/guide`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/formazione-finanziaria`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/analisi-tecnica`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/gestione-del-rischio`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/psicologia-del-trading`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/disclaimer`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cookie`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/termini`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
