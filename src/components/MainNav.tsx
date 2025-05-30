'use client';

import { ActiveLink } from '@/components/ActiveLink';
import { Home, BookOpen, History, User } from 'lucide-react';

const navItems = [
	{
		href: '/',
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

export function MainNav() {
	return (
		<nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
			<div className="container flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-8">
					<div className="text-2xl font-bold text-[#FF385C]">
						10xCards
					</div>
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
				</div>
			</div>
		</nav>
	);
}
