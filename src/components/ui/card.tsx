import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Card
export interface CardProps {
	children: ReactNode;
	className?: string;
}

export function Card({ children, className }: CardProps) {
	return (
		<div
			className={cn(
				'bg-secondary border-border rounded-xl border-2 p-6 shadow-lg dark:border-[#505050] dark:shadow-2xl',
				className,
			)}
		>
			{children}
		</div>
	);
}

Card.displayName = 'Card';

// CardHeader
export interface CardHeaderProps {
	children: ReactNode;
	className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
	return (
		<div className={cn('flex flex-col space-y-1.5 p-6', className)}>
			{children}
		</div>
	);
}

CardHeader.displayName = 'CardHeader';

// CardDescription
export interface CardDescriptionProps {
	children: ReactNode;
	className?: string;
}

export function CardDescription({
	children,
	className,
}: CardDescriptionProps) {
	return (
		<p className={cn('text-muted-foreground text-sm', className)}>
			{children}
		</p>
	);
}

CardDescription.displayName = 'CardDescription';

// CardContent
export interface CardContentProps {
	children: ReactNode;
	className?: string;
}

export function CardContent({
	children,
	className,
}: CardContentProps) {
	return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

CardContent.displayName = 'CardContent';

// CardFooter
export interface CardFooterProps {
	children: ReactNode;
	className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
	return (
		<div className={cn('flex items-center p-6 pt-0', className)}>
			{children}
		</div>
	);
}

CardFooter.displayName = 'CardFooter';

// CardTitle
export interface CardTitleProps {
	children: ReactNode;
	className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
	return (
		<h3
			className={cn(
				'text-2xl leading-none font-semibold tracking-tight',
				className,
			)}
		>
			{children}
		</h3>
	);
}
