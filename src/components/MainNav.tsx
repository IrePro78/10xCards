'use client';

import { ActiveLink } from '@/components/ActiveLink';
import { Home, BookOpen, History, User } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import { AuthNav } from '@/components/AuthNav';
import Link from 'next/link';

const navItems = [
	{
		href: '/generate',
		label: 'Generowanie',
		icon: Home,
	},
	{
		href: '/flashcards',
		label: 'Moje fiszki',
		icon: BookOpen,
	},
	{
		href: '/review-sessions',
		label: 'Sesje powtórek',
		icon: History,
	},
	{
		href: '/profile',
		label: 'Profil',
		icon: User,
	},
] as const;

interface MainNavProps {
	email?: string | null;
}

export function MainNav({ email }: MainNavProps) {
	const isAuthenticated = !!email;

	return (
		<nav className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
			<div className="container flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-8">
					<Link
						href={isAuthenticated ? '/generate' : '/'}
						className="group flex items-center gap-2 transition-all duration-300 hover:scale-105"
					>
						{/* 
                          Kontener z logo - kwadrat 12x12 z zaokrąglonymi rogami (rounded-xl)
                          - relative/flex - pozycjonowanie elementów wewnątrz
                          - items-center/justify-center - wycentrowanie zawartości
                          - bg-gradient-to-br - gradient od lewego górnego do prawego dolnego rogu
                          - from-rose-500 to-rose-600 - kolory gradientu (różowy)
                          - shadow-lg - duży cień
                          - transition/duration - płynne animacje przy hover
                          
                          Po najechaniu (group-hover):
                          - gradient zmienia się na ciemniejszy (rose-600 -> rose-700)
                          - pojawia się nakładka (after:) z animowaną przezroczystością
                          
                          Tryb ciemny (dark:):
                          - ciemniejsze kolory gradientu
                          - odwrotna animacja kolorów przy hover
                        */}
						<div className="relative flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] bg-gradient-to-br from-rose-400 to-rose-600 font-bold text-white shadow-lg transition-all duration-300 group-hover:from-rose-600 group-hover:to-rose-700 after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity after:duration-300 after:content-[''] group-hover:after:opacity-100 dark:from-rose-600 dark:to-rose-700 dark:group-hover:from-rose-500 dark:group-hover:to-rose-600">
							<span className="relative z-10 text-xl font-extrabold tracking-tight">
								10x
							</span>
						</div>
						<span className="text-foreground relative bg-gradient-to-r from-zinc-800 to-zinc-950 bg-clip-text text-3xl font-black tracking-tight text-transparent transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-rose-500 after:transition-all after:duration-300 group-hover:after:w-full dark:from-zinc-300 dark:to-zinc-500">
							Cards
						</span>
					</Link>
					{isAuthenticated && (
						<div className="flex items-center gap-1">
							{navItems.map((item) => (
								<ActiveLink key={item.href} href={item.href}>
									<div className="flex items-center gap-2">
										<item.icon className="h-4 w-4" />
										{item.label}
									</div>
								</ActiveLink>
							))}
						</div>
					)}
				</div>
				<div className="flex items-center gap-4">
					{isAuthenticated ? (
						<UserMenu email={email} />
					) : (
						<AuthNav isAuthenticated={isAuthenticated} />
					)}
				</div>
			</div>
		</nav>
	);
}
