import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
	extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{ className, label, error, helper, type = 'text', ...props },
		ref,
	) => {
		return (
			<div className="space-y-2">
				{label && (
					<label className="text-foreground/90 dark:text-foreground/80 block text-sm font-medium">
						{label}
					</label>
				)}
				<div className="relative">
					<input
						type={type}
						className={cn(
							'border-input bg-background flex h-10 w-full rounded-lg border px-3 py-2',
							'placeholder:text-muted-foreground text-sm',
							'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
							'disabled:cursor-not-allowed disabled:opacity-50',
							className,
						)}
						ref={ref}
						{...props}
					/>
					{error && (
						<div className="absolute -bottom-5 left-0">
							<span className="text-destructive text-sm font-medium">
								{error}
							</span>
						</div>
					)}
				</div>
				{helper && !error && (
					<span className="text-muted-foreground block text-sm">
						{helper}
					</span>
				)}
			</div>
		);
	},
);

Input.displayName = 'Input';
