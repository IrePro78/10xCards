'use client';

import { ActiveLink } from '@/components/ActiveLink';
import { Home, BookOpen, History, User } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import Link from 'next/link';
import { logout } from '@/actions/auth';

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

interface MainNavProps {
	email?: string | null;
}

export function MainNav({ email }: MainNavProps) {
	return (
		<nav className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
			<div className="container flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-8">
					<div className="text-primary text-2xl font-bold">
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
				{email ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative h-8 w-8 rounded-full"
							>
								<Avatar className="h-8 w-8">
									<AvatarFallback>
										{email[0].toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href="/profile" className="flex items-center">
									<User className="mr-2 h-4 w-4" />
									Profil
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => logout()}>
								<LogOut className="mr-2 h-4 w-4" />
								Wyloguj się
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Link href="/login">
						<Button variant="outline" size="sm">
							Zaloguj się
						</Button>
					</Link>
				)}
			</div>
		</nav>
	);
}
