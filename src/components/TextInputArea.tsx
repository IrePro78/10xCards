'use client';

import { ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
	const progressPercentage = Math.min(
		(textLength / 10000) * 100,
		100,
	);

	const getStatusClass = () => {
		if (textLength === 0) return '';
		if (textLength < 1000) return 'char-counter-min';
		if (textLength > 10000) return 'char-counter-max';
		return 'char-counter-optimal';
	};

	return (
		<div className="text-input-container">
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
				className="text-input-area"
			/>

			<div className="char-counter">
				<div className="char-counter-progress">
					<div
						className="char-counter-bar"
						style={{ width: `${progressPercentage}%` }}
					></div>
				</div>
				<span className={getStatusClass()}>
					{textLength < 1000
						? `Min. ${textLength}/1000`
						: textLength > 10000
							? `Max. ${textLength}/10000`
							: `${textLength}/10000`}
				</span>
			</div>
		</div>
	);
}
