export const siteConfig = {
  name: 'Koma Amed',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://komaamed.com',
  email: 'hello@komaamed.com',
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID ?? '',
  whatsapp: '905383535677',
} as const;

export function whatsappUrl(text?: string) {
  const base = `https://wa.me/${siteConfig.whatsapp}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export const socialLinks = [
  {
    id: 'instagram',
    href: 'https://www.instagram.com/komaamedofficial',
  },
  {
    id: 'spotify',
    href: 'https://open.spotify.com/artist/7JSWeBX8NSPIy0bbNnp9Gc',
  },
] as const;

export const musicEmbeds = {
  spotify:
    'https://open.spotify.com/embed/artist/7JSWeBX8NSPIy0bbNnp9Gc?utm_source=generator',
  youtube: '',
} as const;
