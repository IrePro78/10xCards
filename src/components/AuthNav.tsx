'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AuthNavProps {
	isAuthenticated: boolean;
}

export function AuthNav({ isAuthenticated }: AuthNavProps) {
	const pathname = usePathname();

	// Jeśli użytkownik jest zalogowany, nie pokazujemy nawigacji auth
	if (isAuthenticated) {
		return null;
	}

	// Jeśli jesteśmy na stronie logowania lub rejestracji
	if (pathname === '/login' || pathname === '/register') {
		return (
			<div className="flex items-center gap-2">
				<Link href={pathname === '/login' ? '/register' : '/login'}>
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							'text-muted-foreground hover:text-foreground',
							'transition-colors duration-200',
						)}
					>
						{pathname === '/login'
							? 'Nie masz konta?'
							: 'Masz już konto?'}
					</Button>
				</Link>
				<Link href={pathname === '/login' ? '/register' : '/login'}>
					<Button size="sm">
						{pathname === '/login'
							? 'Zarejestruj się'
							: 'Zaloguj się'}
					</Button>
				</Link>
			</div>
		);
	}

	// Na pozostałych stronach
	return (
		<div className="flex items-center gap-2">
			<Link href="/login">
				<Button variant="ghost" size="sm">
					Zaloguj się
				</Button>
			</Link>
			<Link href="/register">
				<Button size="sm">Dołącz za darmo</Button>
			</Link>
		</div>
	);
}
