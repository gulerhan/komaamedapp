import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { toLocale } from '@/lib/locale';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Hero' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: '#080706',
          color: '#f3eee6',
          padding: 72,
        }}
      >
        <div style={{ color: '#c9a45c', fontSize: 22, letterSpacing: 8, textTransform: 'uppercase' }}>
          {t('kicker')}
        </div>
        <div style={{ fontSize: 120, lineHeight: 0.9, marginTop: 24 }}>KOMA AMED</div>
        <div style={{ fontSize: 28, color: '#9a9184', marginTop: 24, maxWidth: 760 }}>
          {t('subtitle')}
        </div>
      </div>
    ),
    size,
  );
}
