'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

interface ProgressProps
	extends React.ComponentProps<typeof ProgressPrimitive.Root> {
	'data-state'?: 'error' | 'default';
}

function Progress({
	className,
	value = 0,
	'data-state': state,
	...props
}: ProgressProps) {
	const isError = state === 'error';
	const normalizedValue = Math.max(
		0,
		Math.min(100, Math.round(value || 0)),
	);

	console.log('Progress value:', value);
	console.log('Normalized value:', normalizedValue);

	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			data-state={state}
			className={cn(
				'relative h-2 w-full overflow-hidden rounded-full bg-gray-100',
				className,
			)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				className={cn(
					'h-full w-full flex-1 transition-all',
					isError ? 'bg-red-400' : 'bg-blue-400',
				)}
				style={{
					transform: `translateX(-${100 - normalizedValue}%)`,
				}}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
