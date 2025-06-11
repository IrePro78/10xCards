'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const { resolvedTheme, setTheme } = useTheme();

	// Określ etykietę dostępności na podstawie aktualnego motywu
	const ariaLabel =
		resolvedTheme === 'light'
			? 'Przełącz na ciemny motyw'
			: 'Przełącz na jasny motyw';

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="h-9 w-9 rounded-full"
				aria-label="Ładowanie motywu"
			>
				<Sun className="h-5 w-5" />
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() =>
				setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
			}
			className="h-9 w-9 rounded-full"
			aria-label={ariaLabel}
			data-testid="theme-toggle"
		>
			{resolvedTheme === 'light' ? (
				<Moon className="h-5 w-5" />
			) : (
				<Sun className="h-5 w-5" />
			)}
		</Button>
	);
}
