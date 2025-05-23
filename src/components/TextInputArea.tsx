'use client';

import { useState, useEffect } from 'react';
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
	disabled = false,
}: TextInputAreaProps) {
	const [charCount, setCharCount] = useState(value.length);
	const MAX_CHARS = 10000;

	const handleChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		const newValue = e.target.value;
		onChange(newValue);
		setCharCount(newValue.length);
	};

	// Aktualizuj licznik znaków, gdy zmienia się wartość z zewnątrz
	useEffect(() => {
		setCharCount(value.length);
	}, [value]);

	const getStatusColor = () => {
		if (charCount < 1000) {
			return 'text-destructive';
		}
		if (charCount > MAX_CHARS) {
			return 'text-destructive';
		}
		return 'text-muted-foreground';
	};

	return (
		<div className="space-y-2">
			<div className="flex justify-between">
				<Label htmlFor="source-text" className="text-sm font-medium">
					Tekst źródłowy
				</Label>
				<span
					className={`text-xs ${getStatusColor()}`}
					data-testid="char-count"
				>
					{charCount}/{MAX_CHARS} znaków{' '}
					{charCount < 1000
						? '(minimum 1000)'
						: charCount > MAX_CHARS
							? '(przekroczono limit)'
							: ''}
				</span>
			</div>
			<Textarea
				id="source-text"
				value={value}
				onChange={handleChange}
				disabled={disabled}
				placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki (minimum 1000, maksimum 10000 znaków)..."
				className="h-[200px] resize-none"
				data-testid="source-text-input"
			/>
		</div>
	);
}
