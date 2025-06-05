import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MainNav } from '@/components/MainNav';
import { getUser } from './actions/auth';

import './globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: '10xCards - Generator Fiszek',
	description: 'Aplikacja do generowania fiszek z tekstu',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user } = await getUser();

	return (
		<html lang="pl" suppressHydrationWarning>
			<body
				className={cn(
					'min-h-screen bg-[#F7F7F7] font-sans antialiased',
					geistSans.variable,
					geistMono.variable,
					inter.className,
				)}
				suppressHydrationWarning
			>
				<Providers>
					<div className="mx-auto max-w-7xl p-4 md:p-6 2xl:p-8">
						<header className="flashcard-container mb-8 rounded-xl p-6">
							<div className="mb-4 flex items-center justify-between">
								<h1 className="text-2xl font-bold">10xCards</h1>
								<ThemeToggle />
							</div>
							<MainNav email={user?.email} />
						</header>

						<main className="flashcard-container rounded-xl p-6">
							{children}
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
