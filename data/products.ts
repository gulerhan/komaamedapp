import type { Product } from '@/data/types';

export const products: Product[] = [
  {
    slug: 'dergus-vinyl',
    category: 'vinyl',
    price: 900,
    image: '/albums/dergus.jpg',
    featured: true,
  },
  {
    slug: 'koma-tee',
    category: 'apparel',
    price: 800,
    image: '/koma/band.jpg',
    featured: true,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}
