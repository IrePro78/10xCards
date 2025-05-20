import { AIGenerationView } from './components/AIGenerationView';

export default function GeneratePage() {
	return (
		<main className="container mx-auto py-8">
			<h1 className="mb-8 text-3xl font-bold">
				Generowanie fiszek z tekstu
			</h1>
			<AIGenerationView />
		</main>
	);
}
