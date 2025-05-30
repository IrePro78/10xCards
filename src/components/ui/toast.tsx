'use client';

import { ReactNode } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// Provider
export function ToastProvider({ children }: { children: ReactNode }) {
	return (
		<ToastPrimitive.Provider>
			{children}
			<ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-50 m-6 flex w-full max-w-sm flex-col gap-2" />
		</ToastPrimitive.Provider>
	);
}

ToastProvider.displayName = 'ToastProvider';

// Toast
export interface ToastProps {
	children: ReactNode;
	variant?: 'success' | 'error' | 'warning' | 'info';
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	className?: string;
}

const variantStyles = {
	success: 'bg-[#008A05] text-white',
	error: 'bg-[#C13515] text-white',
	warning: 'bg-[#F1A91B] text-white',
	info: 'bg-[#222222] text-white',
};

export function Toast({
	children,
	variant = 'info',
	open,
	onOpenChange,
	className,
}: ToastProps) {
	return (
		<ToastPrimitive.Root
			open={open}
			onOpenChange={onOpenChange}
			className={cn(
				'flex items-center justify-between rounded-lg px-4 py-3 shadow-lg',
				variantStyles[variant],
				className,
			)}
		>
			<ToastPrimitive.Description>
				{children}
			</ToastPrimitive.Description>
			<ToastPrimitive.Close className="rounded-full p-1 hover:bg-white/10">
				<X className="h-4 w-4" />
			</ToastPrimitive.Close>
		</ToastPrimitive.Root>
	);
}

Toast.displayName = 'Toast';
