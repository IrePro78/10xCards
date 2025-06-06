import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
	return (
		<div className="space-y-24 py-10">
			{/* Hero Section */}
			<section className="relative text-center">
				<div className="flashcard-container mx-auto max-w-5xl rounded-2xl px-4 py-16">
					<div className="space-y-6">
						<h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
							Twórz inteligentne fiszki
							<span className="text-rose-500 dark:text-rose-400">
								{' '}
								w mgnieniu oka
							</span>
						</h1>
						<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
							Wykorzystaj sztuczną inteligencję do automatycznego
							generowania fiszek z dowolnego tekstu. Ucz się
							efektywniej i oszczędzaj czas.
						</p>
						<div className="flex justify-center gap-4 pt-4">
							<Link href="/register">
								<Button
									size="lg"
									className="gap-2 bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500"
								>
									Rozpocznij za darmo
									<ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
							<Link href="/login">
								<Button
									variant="outline"
									size="lg"
									className="border-rose-500/20 hover:bg-rose-500/10 dark:border-rose-500/20 dark:hover:bg-rose-500/10"
								>
									Zaloguj się
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="flashcard-container rounded-xl p-8">
				<div className="text-center">
					<h2 className="text-3xl font-bold text-rose-500 dark:text-rose-400">
						Dlaczego 10xCards?
					</h2>
					<p className="text-muted-foreground mt-2">
						Poznaj główne zalety naszej aplikacji
					</p>
				</div>

				<div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{/* Feature 1 */}
					<div className="group rounded-xl border border-rose-500/20 p-6 transition-all hover:border-rose-500 dark:border-rose-500/20 dark:hover:border-rose-500">
						<div className="inline-flex rounded-lg border border-rose-500/20 p-3 transition-colors group-hover:border-rose-500 dark:border-rose-500/20 dark:group-hover:border-rose-500">
							<Sparkles className="h-6 w-6 text-rose-500 dark:text-rose-400" />
						</div>
						<h3 className="mt-4 text-xl font-semibold">
							AI Generator
						</h3>
						<p className="text-muted-foreground mt-2">
							Automatycznie generuj fiszki z dowolnego tekstu używając
							zaawansowanych algorytmów AI.
						</p>
					</div>

					{/* Feature 2 */}
					<div className="group rounded-xl border border-rose-500/20 p-6 transition-all hover:border-rose-500 dark:border-rose-500/20 dark:hover:border-rose-500">
						<div className="inline-flex rounded-lg border border-rose-500/20 p-3 transition-colors group-hover:border-rose-500 dark:border-rose-500/20 dark:group-hover:border-rose-500">
							<Brain className="h-6 w-6 text-rose-500 dark:text-rose-400" />
						</div>
						<h3 className="mt-4 text-xl font-semibold">
							Inteligentne powtórki
						</h3>
						<p className="text-muted-foreground mt-2">
							System dostosowuje częstotliwość powtórek do twoich
							postępów w nauce.
						</p>
					</div>

					{/* Feature 3 */}
					<div className="group rounded-xl border border-rose-500/20 p-6 transition-all hover:border-rose-500 dark:border-rose-500/20 dark:hover:border-rose-500">
						<div className="inline-flex rounded-lg border border-rose-500/20 p-3 transition-colors group-hover:border-rose-500 dark:border-rose-500/20 dark:group-hover:border-rose-500">
							<Clock className="h-6 w-6 text-rose-500 dark:text-rose-400" />
						</div>
						<h3 className="mt-4 text-xl font-semibold">
							Oszczędność czasu
						</h3>
						<p className="text-muted-foreground mt-2">
							Skróć czas przygotowania materiałów do nauki nawet o
							90%.
						</p>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="flashcard-container rounded-xl p-8">
				<div className="text-center">
					<h2 className="text-3xl font-bold text-rose-500 dark:text-rose-400">
						Jak to działa?
					</h2>
					<p className="text-muted-foreground mt-2">
						Trzy proste kroki do efektywnej nauki
					</p>
				</div>

				<div className="mt-12 grid gap-8 md:grid-cols-3">
					{[1, 2, 3].map((step, index) => (
						<div key={step} className="group relative text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-rose-500/20 text-xl font-bold text-rose-500 transition-colors group-hover:border-rose-500 dark:border-rose-500/20 dark:text-rose-400 dark:group-hover:border-rose-500">
								{step}
							</div>
							<h3 className="text-xl font-semibold">
								{index === 0 && 'Wklej tekst'}
								{index === 1 && 'Generuj fiszki'}
								{index === 2 && 'Rozpocznij naukę'}
							</h3>
							<p className="text-muted-foreground mt-2">
								{index === 0 &&
									'Wprowadź dowolny tekst, z którego chcesz się uczyć'}
								{index === 1 &&
									'AI automatycznie utworzy zestaw fiszek'}
								{index === 2 &&
									'Korzystaj z inteligentnego systemu powtórek'}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="flashcard-container rounded-xl p-12 text-center">
				<h2 className="text-3xl font-bold text-rose-500 dark:text-rose-400">
					Gotowy na efektywniejszą naukę?
				</h2>
				<p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
					Dołącz do tysięcy użytkowników, którzy już korzystają z
					10xCards do szybszej i skuteczniejszej nauki.
				</p>
				<div className="mt-8">
					<Link href="/register">
						<Button
							size="lg"
							className="gap-2 bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500"
						>
							Rozpocznij za darmo
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}
