import { AIGenerationView } from './components/AIGenerationView';

export default function GeneratePage() {
	return (
		<div className="container mx-auto max-w-5xl py-8">
			<div className="border-border mb-6 flex items-center justify-between border-b pb-2">
				<h1 className="text-2xl font-bold">Generator fiszek</h1>
			</div>
			<AIGenerationView />
		</div>
	);
}
