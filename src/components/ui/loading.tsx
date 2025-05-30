import { cn } from '@/lib/utils';

export interface LoadingProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const sizeStyles = {
	sm: 'h-4 w-4 border-2',
	md: 'h-8 w-8 border-3',
	lg: 'h-12 w-12 border-4',
};

export function Loading({ size = 'md', className }: LoadingProps) {
	return (
		<div
			className={cn(
				'animate-spin rounded-full border-[#FF385C] border-t-transparent',
				sizeStyles[size],
				className,
			)}
			role="status"
			aria-label="Ładowanie"
		/>
	);
}

Loading.displayName = 'Loading';
