'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { ElementRef, ComponentPropsWithoutRef } from 'react';

interface DialogProps {
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = DialogPrimitive.Overlay;

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			{children}
		</DialogPrimitive.Root>
	);
};

Dialog.displayName = 'Dialog';

const DialogContent = React.forwardRef<
	ElementRef<typeof DialogPrimitive.Content>,
	ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay
			className={cn(
				'bg-background/80 fixed inset-0 z-50 backdrop-blur-sm',
				'data-[state=open]:animate-in data-[state=closed]:animate-out',
				'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			)}
		/>
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				'bg-background w-full rounded-xl border p-6 shadow-lg',
				'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg',
				className,
			)}
			{...props}
		>
			{children}
			<DialogClose className="absolute top-4 right-4 rounded-lg opacity-70">
				<X className="h-4 w-4" />
				<span className="sr-only">Close</span>
			</DialogClose>
		</DialogPrimitive.Content>
	</DialogPortal>
));

DialogContent.displayName = 'DialogContent';

export {
	Dialog,
	DialogContent,
	DialogPortal,
	DialogOverlay,
	DialogClose,
};

// DialogHeader
export interface DialogHeaderProps {
	children: ReactNode;
	className?: string;
}

export function DialogHeader({
	children,
	className,
}: DialogHeaderProps) {
	return (
		<div
			className={cn(
				'flex flex-col space-y-1.5 text-center sm:text-left',
				className,
			)}
		>
			{children}
		</div>
	);
}

DialogHeader.displayName = 'DialogHeader';

// DialogFooter
export interface DialogFooterProps {
	children: ReactNode;
	className?: string;
}

export function DialogFooter({
	children,
	className,
}: DialogFooterProps) {
	return (
		<div
			className={cn(
				'mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
				className,
			)}
		>
			{children}
		</div>
	);
}

DialogFooter.displayName = 'DialogFooter';

// DialogTitle
export interface DialogTitleProps {
	children: ReactNode;
	className?: string;
}

export function DialogTitle({
	children,
	className,
}: DialogTitleProps) {
	return (
		<DialogPrimitive.Title
			className={cn(
				'text-lg leading-none font-semibold tracking-tight',
				className,
			)}
		>
			{children}
		</DialogPrimitive.Title>
	);
}

DialogTitle.displayName = 'DialogTitle';
