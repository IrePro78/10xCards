'use client';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/actions/auth';
import { cn } from '@/lib/utils';

interface UserMenuProps {
	email?: string | null;
}

export function UserMenu({ email }: UserMenuProps) {
	if (!email) {
		return (
			<Link href="/login">
				<Button variant="outline" size="sm" className="font-medium">
					Zaloguj się
				</Button>
			</Link>
		);
	}

	const username = email.split('@')[0];
	const initial = username[0].toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<div
					className={cn(
						'relative cursor-pointer',
						'flex h-9 w-9 items-center justify-center',
						'rounded-full',
						'bg-primary/10 dark:bg-primary/20',
						'border-border border-2',
						'hover:bg-primary/20 dark:hover:bg-primary/30',
						'transition-all duration-200',
					)}
				>
					<span className="text-primary dark:text-primary-foreground text-sm font-semibold">
						{initial}
					</span>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className={cn(
					'w-64 p-0',
					'bg-background dark:bg-background',
					'border-border border',
					'shadow-lg',
				)}
			>
				<div className="border-border bg-muted/50 flex flex-col gap-1 border-b p-3">
					<p className="font-medium">{username}</p>
					<p className="text-muted-foreground text-xs">{email}</p>
				</div>
				<div className="p-2">
					<DropdownMenuItem asChild className="focus:bg-muted gap-2">
						<Link
							href="/profile"
							className="flex w-full items-center"
						>
							<User className="h-4 w-4" />
							<span>Profil użytkownika</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator className="bg-border" />
					<DropdownMenuItem
						onClick={() => logout()}
						className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
					>
						<LogOut className="h-4 w-4" />
						<span>Wyloguj się</span>
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
