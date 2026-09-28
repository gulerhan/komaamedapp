'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/lib/site';
import { Button } from '@/components/ui/Button';

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export function ContactForm() {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(form: FormData) {
    const next: FieldErrors = {};
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const message = String(form.get('message') ?? '').trim();

    if (name.length < 2) next.name = t('errorName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('errorEmail');
    if (message.length < 10) next.message = t('errorMessage');

    return { next, name, email, message };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { next, name, email, message } = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('sending');

    if (siteConfig.formspreeId) {
      await fetch(`https://formspree.io/f/${siteConfig.formspreeId}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      setStatus('success');
      event.currentTarget.reset();
      return;
    }

    const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(t('mailtoSubject'))}&body=${encodeURIComponent(`${name} <${email}>\n\n${message}`)}`;
    window.location.href = mailto;
    setStatus('success');
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-6" noValidate>
      <div>
        <label htmlFor="name" className="text-[11px] tracking-[0.2em] text-fg-muted uppercase">
          {t('name')}
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          className="mt-2 w-full border-b border-border bg-transparent py-3 text-fg outline-none focus:border-gold"
        />
        {errors.name ? <p className="mt-2 text-sm text-terracotta">{errors.name}</p> : null}
      </div>
      <div>
        <label htmlFor="email" className="text-[11px] tracking-[0.2em] text-fg-muted uppercase">
          {t('email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="mt-2 w-full border-b border-border bg-transparent py-3 text-fg outline-none focus:border-gold"
        />
        {errors.email ? <p className="mt-2 text-sm text-terracotta">{errors.email}</p> : null}
      </div>
      <div>
        <label htmlFor="message" className="text-[11px] tracking-[0.2em] text-fg-muted uppercase">
          {t('message')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="mt-2 w-full resize-none border-b border-border bg-transparent py-3 text-fg outline-none focus:border-gold"
        />
        {errors.message ? <p className="mt-2 text-sm text-terracotta">{errors.message}</p> : null}
      </div>
      <Button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? t('sending') : t('send')}
      </Button>
      {status === 'success' ? <p className="text-gold">{t('success')}</p> : null}
    </form>
  );
}
