import type { Member, MemberSlug } from '@/data/types';

const gallery: readonly [string, string] = [
  '/albums/dergus.jpg',
  '/albums/kulilka-azadi.jpg',
];

export const members: Member[] = [
  {
    slug: 'serhat-karakas',
    displayName: 'Serhat Karakaş',
    gallery,
    featured: true,
  },
  {
    slug: 'memo-gul',
    displayName: 'Memo Gül',
    gallery,
    featured: true,
  },
  {
    slug: 'serap-sonmez',
    displayName: 'Serap Sönmez',
    gallery,
    featured: true,
  },
  {
    slug: 'suleyman-gultekin',
    displayName: 'Süleyman Gültekin',
    gallery,
    featured: true,
  },
  {
    slug: 'fikri-kutlay',
    displayName: 'Fikri Kutlay',
    gallery,
    featured: true,
  },
  {
    slug: 'ahmet-kaya',
    displayName: 'Ahmet Kaya',
    gallery,
    featured: true,
  },
  {
    slug: 'evdilmelik-sexbekir',
    displayName: 'Evdılmelik Şexbekir',
    gallery: [
      '/albums/kulilka-azadi.jpg',
      '/albums/dergus.jpg',
    ],
    featured: false,
  },
];

export function getMember(slug: string) {
  return members.find((member) => member.slug === slug);
}

export function getAdjacentMembers(slug: MemberSlug) {
  const index = members.findIndex((member) => member.slug === slug);
  const prev = members[(index - 1 + members.length) % members.length];
  const next = members[(index + 1) % members.length];
  return { prev, next };
}
