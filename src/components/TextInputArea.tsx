'use client';

import { ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface TextInputAreaProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

export function TextInputArea({
	value,
	onChange,
	disabled,
}: TextInputAreaProps) {
	const textLength = value.length;
	const progressPercentage = Math.round(
		(Math.min(Math.max(textLength, 0), 10000) / 10000) * 100,
	);

	const getStatusClass = () => {
		if (textLength === 0) return '';
		if (textLength < 1000) return 'text-red-500';
		if (textLength > 10000) return 'text-red-500';
		return 'text-gray-500';
	};

	return (
		<div className="relative mb-8">
			<Label
				htmlFor="source-text"
				className="mb-2 block text-base font-medium"
			>
				Tekst źródłowy
			</Label>

			<Textarea
				id="source-text"
				value={value}
				onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
					onChange(e.target.value)
				}
				disabled={disabled}
				placeholder="Wprowadź tekst do wygenerowania fiszek (minimum 1000 znaków, maksimum 10000 znaków)"
				className="font-inherit min-h-[200px] w-full resize-y rounded-md border border-gray-300 bg-white p-3 text-sm leading-relaxed text-gray-900 shadow-sm transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
			/>

			<div className="absolute right-0 -bottom-7 flex items-center gap-2 text-xs">
				<Progress
					value={progressPercentage}
					className="h-2 w-[120px]"
					data-state={
						textLength > 10000 ||
						(textLength > 0 && textLength < 1000)
							? 'error'
							: 'default'
					}
				/>
				<span className={getStatusClass()}>{textLength}/10000</span>
			</div>
		</div>
	);
}
