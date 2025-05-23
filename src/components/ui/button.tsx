import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
				destructive:
					'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
				secondary:
					'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				ghost:
					'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
				link: 'text-primary underline-offset-4 hover:underline',
				success:
					'bg-green-600 text-white shadow-xs hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
				info: 'bg-blue-600 text-white shadow-xs hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
				warning:
					'bg-amber-500 text-white shadow-xs hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600',
				neutral:
					'bg-gray-600 text-white shadow-xs hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600',
				'outline-success':
					'border-[1.5px] border-green-600 text-green-600 font-medium bg-transparent hover:bg-green-50 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950/20',
				'outline-info':
					'border-[1.5px] border-blue-600 text-blue-600 font-medium bg-transparent hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-950/20',
				'outline-warning':
					'border-[1.5px] border-amber-500 text-amber-500 font-medium bg-transparent hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-950/20',
				'outline-neutral':
					'border-[1.5px] border-gray-600 text-gray-600 font-medium bg-transparent hover:bg-gray-50 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-950/20',
				'outline-destructive':
					'border-[1.5px] border-red-600 text-red-600 font-medium bg-transparent hover:bg-red-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-950/20',
				'outline-primary':
					'border-[1.5px] border-indigo-600 text-indigo-600 font-medium bg-transparent hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-500 dark:hover:bg-indigo-950/20',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
