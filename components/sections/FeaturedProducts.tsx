'use client';

import { SharpImage } from '@/components/ui/SharpImage';
import { useTranslations } from 'next-intl';
import { getFeaturedProducts } from '@/data/products';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { buttonStyles } from '@/components/ui/Button';

export function FeaturedProducts() {
  const t = useTranslations('FeaturedProducts');
  const productsT = useTranslations('ProductsContent');
  const featured = getFeaturedProducts();

  return (
    <section className="py-24 md:py-32">
      <Container>
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('eyebrow')}</p>
              <h2 className="font-display mt-3 text-4xl md:text-6xl">{t('title')}</h2>
            </div>
            <Link href="/products" className={buttonStyles({ variant: 'outline' })}>
              {t('cta')}
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2">
          {featured.map((product, index) => (
            <Reveal key={product.slug} delay={index * 0.08}>
              <Link href="/products" className="group block">
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-bg-surface">
                  <SharpImage
                    src={product.image}
                    alt={productsT(`${product.slug}.name`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="font-display text-2xl">{productsT(`${product.slug}.name`)}</h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
