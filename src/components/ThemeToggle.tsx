'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	useEffect(() => {
		// Sprawdź preferencje użytkownika przy pierwszym załadowaniu
		const savedTheme = localStorage.getItem('theme') as
			| 'light'
			| 'dark'
			| null;
		const prefersDark = window.matchMedia(
			'(prefers-color-scheme: dark)',
		).matches;

		if (savedTheme) {
			setTheme(savedTheme);
			document.documentElement.classList.toggle(
				'dark',
				savedTheme === 'dark',
			);
		} else if (prefersDark) {
			setTheme('dark');
			document.documentElement.classList.add('dark');
		}
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
		document.documentElement.classList.toggle(
			'dark',
			newTheme === 'dark',
		);
		localStorage.setItem('theme', newTheme);
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="h-9 w-9 rounded-full"
			aria-label={
				theme === 'light'
					? 'Przełącz na ciemny motyw'
					: 'Przełącz na jasny motyw'
			}
		>
			{theme === 'light' ? (
				<Moon className="h-5 w-5" />
			) : (
				<Sun className="h-5 w-5" />
			)}
		</Button>
	);
}
