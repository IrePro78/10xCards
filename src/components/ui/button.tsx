import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'outline'
	| 'ghost'
	| 'destructive'
	| 'action-primary'
	| 'action-success'
	| 'action-secondary';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants = {
	primary:
		'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	secondary:
		'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	outline:
		'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	ghost:
		'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	destructive:
		'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 disabled:pointer-events-none disabled:opacity-50',
	'action-primary':
		'rounded-lg border-[1.5px] border-[#222222] bg-[#FF385C] px-6 py-2 font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:border-black hover:bg-[#E31C5F] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-[#FF385C] dark:text-white dark:hover:border-[#222222] dark:hover:bg-[#E31C5F]',
	'action-success':
		'rounded-lg border-[1.5px] border-[#222222] bg-[#008489] px-6 py-2 font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#006C70] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-[#008489] dark:text-white dark:hover:bg-[#006C70]',
	'action-secondary':
		'rounded-lg border-[1.5px] bg-white px-6 py-2 font-medium text-[#222222] transition-all duration-200 hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white dark:text-[#222222] dark:hover:bg-[#F7F7F7]',
} as const;

const sizes = {
	sm: 'h-9 rounded-lg px-3 text-sm',
	md: 'h-10 rounded-lg px-4 py-2 text-sm',
	lg: 'h-11 rounded-lg px-8 text-base',
	icon: 'h-10 w-10 rounded-lg',
} as const;

export interface ButtonProps {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	className?: string;
	disabled?: boolean;
	onClick?: () => void;
}

export function Button({
	children,
	variant = 'primary',
	size = 'md',
	className,
	disabled,
	onClick,
}: ButtonProps) {
	return (
		<button
			className={cn(
				'ring-offset-background inline-flex items-center justify-center font-medium transition-colors',
				'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
				'disabled:pointer-events-none disabled:opacity-50',
				variants[variant],
				sizes[size],
				className,
			)}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

Button.displayName = 'Button';
