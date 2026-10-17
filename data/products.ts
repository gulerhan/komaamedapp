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
    image: '/clothing_imgs/koma_amed_tshirt1.png',
    featured: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'black', image: '/clothing_imgs/koma_amed_tshirt1.png' },
      { id: 'white', image: '/clothing_imgs/koma_amed_tshirt2.png' },
    ],
  },
];

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}
