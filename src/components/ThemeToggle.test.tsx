import { render, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mockowanie modułu next-themes
vi.mock('next-themes', () => ({
	useTheme: vi.fn(),
}));

describe('ThemeToggle', () => {
	beforeEach(() => {
		// Resetowanie wszystkich mocków przed każdym testem
		vi.resetAllMocks();
	});

	test('powinien renderować przycisk do przełączania motywu', () => {
		// Konfiguracja mocka dla useTheme
		const mockSetTheme = vi.fn();
		(useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
			theme: 'light',
			setTheme: mockSetTheme,
			resolvedTheme: 'light',
		});

		const { container } = render(<ThemeToggle />);

		// Sprawdź czy przycisk jest renderowany
		const button = container.querySelector('button');
		expect(button).not.toBeNull();

		// Wydrukuj DOM dla debugowania
		console.log(container.innerHTML);
	});

	test('powinien przełączyć motyw po kliknięciu', () => {
		// Konfiguracja mocka dla useTheme
		const mockSetTheme = vi.fn();
		(useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
			theme: 'light',
			setTheme: mockSetTheme,
			resolvedTheme: 'light',
		});

		const { container } = render(<ThemeToggle />);

		// Znajdź przycisk i kliknij go
		const button = container.querySelector('button');
		expect(button).not.toBeNull();

		if (button) {
			fireEvent.click(button);
		}

		// Sprawdź czy funkcja setTheme została wywołana z prawidłowym argumentem
		expect(mockSetTheme).toHaveBeenCalledWith('dark');
	});

	test('powinien pokazywać odpowiednią ikonę w zależności od aktualnego motywu', () => {
		// Konfiguracja mocka dla useTheme - ciemny motyw
		const mockSetTheme = vi.fn();
		(useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
			theme: 'dark',
			setTheme: mockSetTheme,
			resolvedTheme: 'dark',
		});

		const { container } = render(<ThemeToggle />);

		// Sprawdź czy przycisk jest renderowany
		const button = container.querySelector('button');
		expect(button).not.toBeNull();

		// Sprawdź czy ikona słońca jest renderowana dla ciemnego motywu
		const sunIcon = container.querySelector('.lucide-sun');
		expect(sunIcon).not.toBeNull();
	});
});
