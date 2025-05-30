'use client';

import { ReactNode } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export interface ProgressProps {
	value?: number;
	max?: number;
	label?: ReactNode;
	showValue?: boolean;
	className?: string;
}

export function Progress({
	value = 0,
	max = 100,
	label,
	showValue = false,
	className,
}: ProgressProps) {
	const progress = Math.round((value / max) * 100);

	return (
		<div className="space-y-2">
			{(label || showValue) && (
				<div className="flex items-center justify-between">
					{label && (
						<div className="text-sm text-[#717171]">{label}</div>
					)}
					{showValue && (
						<div className="text-sm text-[#717171]">{progress}%</div>
					)}
				</div>
			)}
			<ProgressPrimitive.Root
				className={cn(
					'relative h-2 w-full overflow-hidden rounded-full bg-[#F7F7F7]',
					className,
				)}
			>
				<ProgressPrimitive.Indicator
					className="h-full w-full bg-[#FF385C] transition-all duration-500"
					style={{ transform: `translateX(-${100 - progress}%)` }}
				/>
			</ProgressPrimitive.Root>
		</div>
	);
}

Progress.displayName = 'Progress';
