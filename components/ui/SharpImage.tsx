import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export function SharpImage({ className, alt, ...props }: ImageProps) {
  return (
    <Image
      alt={alt}
      quality={100}
      unoptimized
      className={cn('object-contain', className)}
      {...props}
    />
  );
}
