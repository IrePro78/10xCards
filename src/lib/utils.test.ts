import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Utils', () => {
	describe('cn', () => {
		it('powinien łączyć klasy CSS poprawnie', () => {
			const result = cn('text-red-500', 'bg-blue-200', 'p-4');
			expect(result).toBe('text-red-500 bg-blue-200 p-4');
		});

		it('powinien nadpisywać zduplikowane klasy', () => {
			const result = cn('text-red-500', 'text-blue-500');
			expect(result).toBe('text-blue-500');
		});

		it('powinien obsługiwać warunki', () => {
			const isActive = true;
			const result = cn('btn', isActive && 'btn-active');
			expect(result).toBe('btn btn-active');
		});

		it('powinien ignorować fałszywe wartości', () => {
			const result = cn(
				'btn',
				false && 'btn-active',
				null,
				undefined,
				0,
			);
			expect(result).toBe('btn');
		});
	});
});
