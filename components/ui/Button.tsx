import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs tracking-[0.22em] uppercase transition-colors duration-300 focus-visible:outline-none disabled:opacity-50',
  {
    variants: {
      variant: {
        gold: 'bg-gold text-bg hover:bg-gold-bright',
        outline: 'border border-gold/50 text-gold hover:bg-gold hover:text-bg',
        ghost: 'text-fg-muted hover:text-gold',
      },
    },
    defaultVariants: {
      variant: 'gold',
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonStyles({ variant }), className)} {...props} />;
}

export { buttonStyles };
