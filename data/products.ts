import type { Product } from '@/data/types';

export const products: Product[] = [
  {
    slug: 'dergus-vinyl',
    category: 'vinyl',
    image: '/albums/dergus.jpg',
    featured: true,
  },
  {
    slug: 'koma-tee',
    category: 'apparel',
    image: '/koma/band.jpg',
    featured: true,
  },
];

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}
