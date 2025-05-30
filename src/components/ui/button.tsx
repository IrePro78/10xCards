import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'outline'
	| 'ghost'
	| 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants = {
	primary:
		'bg-[#FF385C] text-white hover:bg-[#E31C5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C]/50 disabled:pointer-events-none disabled:opacity-50',
	secondary:
		'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	outline:
		'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	ghost:
		'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	destructive:
		'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 disabled:pointer-events-none disabled:opacity-50',
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
