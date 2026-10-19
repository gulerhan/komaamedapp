export const productCategories = ['vinyl', 'apparel'] as const;

export type ProductCategory = (typeof productCategories)[number];

export type MemberSlug =
  | 'serhat-karakas'
  | 'memo-gul'
  | 'serap-sonmez'
  | 'suleyman-gultekin'
  | 'fikri-kutlay'
  | 'ahmet-kaya'
  | 'evdilmelik-sexbekir';

export type ProductSlug = 'dergus-vinyl' | 'koma-tee';

export type Member = {
  slug: MemberSlug;
  displayName: string;
  gallery: readonly [string, string];
  featured: boolean;
};

export type Product = {
  slug: ProductSlug;
  category: ProductCategory;
  image: string;
  featured: boolean;
  sizes?: readonly string[];
  colors?: readonly ProductColor[];
};

export type ProductColor = {
  id: 'black' | 'white';
  image: string;
};

export type TimelineItem = {
  year: string;
  title: string;
  text: string;
};
