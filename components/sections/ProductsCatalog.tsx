'use client';

import { useMemo, useState } from 'react';
import { SharpImage } from '@/components/ui/SharpImage';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { products } from '@/data/products';
import { productCategories, type Product, type ProductCategory } from '@/data/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { buttonStyles } from '@/components/ui/Button';
import { whatsappUrl } from '@/lib/site';

type Filter = 'all' | ProductCategory;

export function ProductsCatalog() {
  const t = useTranslations('ProductsPage');
  const cats = useTranslations('Categories');
  const content = useTranslations('ProductsContent');
  const locale = useLocale();
  const [filter, setFilter] = useState<Filter>('all');
  const [active, setActive] = useState<Product | null>(null);

  const filters: Filter[] = ['all', ...productCategories];
  const visible = useMemo(
    () => (filter === 'all' ? products : products.filter((item) => item.category === filter)),
    [filter],
  );

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              'rounded-full border px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition-colors',
              filter === item
                ? 'border-gold bg-gold text-bg'
                : 'border-border text-fg-muted hover:border-gold hover:text-gold',
            )}
          >
            {item === 'all' ? t('all') : cats(item)}
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((product) => (
            <motion.button
              layout
              type="button"
              key={product.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              onClick={() => setActive(product)}
              className="group text-left"
            >
              <div className="relative aspect-square overflow-hidden rounded-[1.6rem] bg-bg-surface">
                <SharpImage
                  src={product.image}
                  alt={content(`${product.slug}.name`)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-gold uppercase">
                    {cats(product.category)}
                  </p>
                  <h2 className="font-display mt-1 text-2xl">{content(`${product.slug}.name`)}</h2>
                </div>
                <p className="text-sm text-fg-muted">{formatPrice(product.price, locale)}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <Dialog.Root open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-[70] w-full max-w-lg overflow-y-auto border-l border-border bg-bg-elevated p-8 shadow-2xl">
            {active ? (
              <>
                <Dialog.Title className="font-display text-4xl">
                  {content(`${active.slug}.name`)}
                </Dialog.Title>
                <Dialog.Description className="mt-3 text-fg-muted">
                  {content(`${active.slug}.description`)}
                </Dialog.Description>
                <div className="relative mt-8 aspect-square overflow-hidden rounded-[1.5rem] bg-bg-surface">
                  <SharpImage
                    src={active.image}
                    alt={content(`${active.slug}.name`)}
                    fill
                  />
                </div>
                <p className="mt-6 text-2xl text-gold">{formatPrice(active.price, locale)}</p>
                <p className="mt-1 text-xs tracking-[0.16em] text-fg-muted uppercase">
                  {t('priceNote')}
                </p>
                <div className="mt-8 flex gap-3">
                  <a
                    href={whatsappUrl(
                      t('inquireMessage', { name: content(`${active.slug}.name`) }),
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles({ variant: 'gold' })}
                  >
                    {t('inquire')}
                  </a>
                  <Dialog.Close className={buttonStyles({ variant: 'outline' })}>
                    {t('close')}
                  </Dialog.Close>
                </div>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
