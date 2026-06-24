import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target active:scale-95 hover:shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground hover:shadow-lg hover:shadow-primary/20 hover:brightness-110 border border-primary/20',
        destructive: 'bg-gradient-to-r from-destructive to-red-500 text-destructive-foreground hover:shadow-lg hover:brightness-110',
        outline: 'border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary',
        ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline hover:shadow-none active:scale-100',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-md px-8',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };