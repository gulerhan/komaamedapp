import { members } from '@/data/members';
import { siteConfig, socialLinks } from '@/lib/site';

export function musicGroupJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    genre: ['Kurdish folk', 'Anatolian folk', 'World'],
    foundingDate: '1988',
    foundingLocation: {
      '@type': 'Place',
      name: 'Ankara',
    },
    member: members.map((member) => ({
      '@type': 'Person',
      name: member.displayName,
      url: `${siteConfig.url}/ku/members/${member.slug}`,
    })),
    sameAs: socialLinks.map((link) => link.href),
  };
}
