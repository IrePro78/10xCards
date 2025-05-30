import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Heading
export interface HeadingProps {
	children: ReactNode;
	level?: 'h1' | 'h2' | 'h3' | 'h4';
	className?: string;
}

const headingStyles = {
	h1: 'text-4xl font-bold tracking-tight',
	h2: 'text-2xl font-semibold',
	h3: 'text-xl font-semibold',
	h4: 'text-lg font-medium',
};

export function Heading({
	children,
	level = 'h1',
	className,
}: HeadingProps) {
	const Component = level;
	return (
		<Component
			className={cn(
				'text-[#222222]',
				headingStyles[level],
				className,
			)}
		>
			{children}
		</Component>
	);
}

// Text
export interface TextProps {
	children: ReactNode;
	variant?: 'primary' | 'secondary';
	size?: 'xs' | 'sm' | 'base' | 'lg';
	className?: string;
}

const textStyles = {
	primary: 'text-[#222222]',
	secondary: 'text-[#717171]',
};

const textSizes = {
	xs: 'text-xs',
	sm: 'text-sm',
	base: 'text-base',
	lg: 'text-lg',
};

export function Text({
	children,
	variant = 'primary',
	size = 'base',
	className,
}: TextProps) {
	return (
		<p
			className={cn(textStyles[variant], textSizes[size], className)}
		>
			{children}
		</p>
	);
}
