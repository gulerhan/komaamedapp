'use client';

import { useMemo, useState } from 'react';
import { SharpImage } from '@/components/ui/SharpImage';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { products } from '@/data/products';
import {
  productCategories,
  type Product,
  type ProductCategory,
  type ProductColor,
} from '@/data/types';
import { cn } from '@/lib/utils';
import { buttonStyles } from '@/components/ui/Button';
import { whatsappUrl } from '@/lib/site';

type Filter = 'all' | ProductCategory;

export function ProductsCatalog() {
  const t = useTranslations('ProductsPage');
  const cats = useTranslations('Categories');
  const content = useTranslations('ProductsContent');
  const [filter, setFilter] = useState<Filter>('all');
  const [active, setActive] = useState<Product | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<ProductColor | null>(null);

  function openProduct(product: Product | null) {
    setActive(product);
    setSize(null);
    setColor(product?.colors?.[0] ?? null);
  }

  function inquiryText(product: Product) {
    const name = content(`${product.slug}.name`);
    if (color) {
      const colorName = t(`colors.${color.id}`);
      const details = size ? `${colorName}, ${t('sizeDetail', { size })}` : colorName;
      return t('inquireMessageVariant', { name, details });
    }
    if (size) return t('inquireMessageSize', { name, size });
    return t('inquireMessage', { name });
  }

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
              onClick={() => openProduct(product)}
              className="group text-left"
            >
              <div className="product-stage relative aspect-square overflow-hidden rounded-[1.6rem]">
                <SharpImage
                  src={product.image}
                  alt={content(`${product.slug}.name`)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={product.category === 'apparel' ? 'object-contain p-6' : 'object-cover'}
                />
              </div>
              <div className="mt-4">
                <p className="text-[10px] tracking-[0.2em] text-gold uppercase">
                  {cats(product.category)}
                </p>
                <h2 className="font-display mt-1 text-2xl">{content(`${product.slug}.name`)}</h2>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <Dialog.Root open={Boolean(active)} onOpenChange={(open) => !open && openProduct(null)}>
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
                <div className="product-stage relative mt-8 aspect-square overflow-hidden rounded-[1.5rem]">
                  <SharpImage
                    src={color?.image ?? active.image}
                    alt={content(`${active.slug}.name`)}
                    fill
                    className={active.category === 'apparel' ? 'object-contain p-6' : 'object-cover'}
                  />
                </div>
                {active.colors ? (
                  <div className="mt-8">
                    <p className="text-[11px] tracking-[0.2em] text-fg-muted uppercase">
                      {t('color')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {active.colors.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setColor(item)}
                          aria-pressed={color?.id === item.id}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs tracking-[0.14em] transition-colors',
                            color?.id === item.id
                              ? 'border-gold bg-gold text-bg'
                              : 'border-border text-fg hover:border-gold hover:text-gold',
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              'size-3 rounded-full border border-fg/40',
                              item.id === 'black' ? 'bg-black' : 'bg-white',
                            )}
                          />
                          {t(`colors.${item.id}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                {active.sizes ? (
                  <div className="mt-8">
                    <p className="mb-6 text-xs leading-relaxed text-fg-muted">{t('sizeNote')}</p>
                    <p className="text-[11px] tracking-[0.2em] text-fg-muted uppercase">
                      {t('size')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {active.sizes.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setSize(item)}
                          aria-pressed={size === item}
                          className={cn(
                            'min-w-12 rounded-full border px-4 py-2 text-xs tracking-[0.14em] transition-colors',
                            size === item
                              ? 'border-gold bg-gold text-bg'
                              : 'border-border text-fg hover:border-gold hover:text-gold',
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-8 flex gap-3">
                  <a
                    href={whatsappUrl(inquiryText(active))}
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
