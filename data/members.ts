import type { Member, MemberSlug } from '@/data/types';

const gallery: readonly [string, string, string] = [
  '/koma/band.jpg',
  '/albums/dergus.jpg',
  '/albums/kulilka-azadi.jpg',
];

export const members: Member[] = [
  {
    slug: 'serhat-karakas',
    displayName: 'Serhat Karakaş',
    initials: 'SK',
    image: '/members/serhat-karakas.jpg',
    gallery,
    featured: true,
  },
  {
    slug: 'memo-gul',
    displayName: 'Memo Gül',
    initials: 'MG',
    image: '/members/memo-gul.jpg',
    gallery,
    featured: true,
  },
  {
    slug: 'serap-sonmez',
    displayName: 'Serap Sönmez',
    initials: 'SS',
    image: '/members/serap-sonmez.jpg',
    gallery,
    featured: true,
  },
  {
    slug: 'suleyman-gultekin',
    displayName: 'Süleyman Gültekin',
    initials: 'SG',
    image: '/members/suleyman-gultekin.jpg',
    gallery,
    featured: true,
  },
  {
    slug: 'fikri-kutlay',
    displayName: 'Fikri Kutlay',
    initials: 'FK',
    image: '/members/fikri-kutlay.jpg',
    gallery,
    featured: true,
  },
  {
    slug: 'ahmet-kaya',
    displayName: 'Ahmet Kaya',
    initials: 'AK',
    image: '/members/ahmet-kaya.jpg',
    gallery,
    featured: true,
  },
  {
    slug: 'evdilmelik-sexbekir',
    displayName: 'Evdılmelik Şexbekir',
    initials: 'EŞ',
    image: '/members/evdilmelik-sexbekir.jpg',
    gallery: [
      '/albums/kulilka-azadi.jpg',
      '/albums/dergus.jpg',
      '/koma/band.jpg',
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
