import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Debug środowiska
console.log('Debug środowiska:');
console.log('process.env.CI:', process.env.CI);
console.log(
	'process.env.GITHUB_ACTIONS:',
	process.env.GITHUB_ACTIONS,
);
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);

// Sprawdź czy jesteśmy w środowisku CI
const isCI =
	Boolean(process.env.CI) ||
	Boolean(process.env.GITHUB_ACTIONS) ||
	process.cwd().includes('/home/runner/work/');

console.log('isCI:', isCI);

// W CI nie ładujemy .env.test - zmienne są ustawiane przez workflow
if (!isCI) {
	try {
		dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
		console.log('.env.test załadowany');
	} catch (error) {
		console.error('Błąd ładowania .env.test:', error);
	}
}

// Przygotuj zmienne środowiskowe dla webServer
const env: Record<string, string> = {
	...process.env, // Przekaż wszystkie zmienne z procesu do webServer
	// Upewnij się że Supabase ma poprawne nazwy zmiennych
	NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || '',
	NEXT_PUBLIC_SUPABASE_ANON_KEY:
		process.env.SUPABASE_PUBLIC_KEY || '',
	// Wymuś NODE_ENV=test na końcu
	NODE_ENV: 'test',
};

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : undefined,
	reporter: isCI
		? [['github'], ['list']]
		: [['html', { open: 'never' }], ['list']],
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		command: 'npm run build && npm run start',
		url: 'http://localhost:3000',
		reuseExistingServer: !isCI,
		stdout: 'pipe',
		stderr: 'pipe',
		timeout: 120000,
		env, // Przekaż wszystkie zmienne środowiskowe
	},
});
