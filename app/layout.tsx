import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: '10xCards - Generator Fiszek',
	description: 'Aplikacja do generowania fiszek z tekstu',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pl" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
			>
				<div className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
					<header className="mb-8 flex items-center justify-between">
						<h1 className="text-2xl font-bold">10xCards</h1>
						<ThemeToggle />
					</header>

					<main>{children}</main>
				</div>

				<Toaster richColors position="bottom-right" />
			</body>
		</html>
	);
}
