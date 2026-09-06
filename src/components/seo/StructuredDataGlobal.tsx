import { siteConfig } from '@/config/siteConfig';

export default function StructuredDataGlobal() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.contactEmail,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/icon.png`,
    },
    sameAs: [siteConfig.social.linkedin, siteConfig.social.instagram],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: 'it-IT',
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Andrea Vivace',
    jobTitle: 'Fondatore',
    worksFor: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    sameAs: [siteConfig.social.linkedin],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
    </>
  );
}
