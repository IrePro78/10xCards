import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Sprawdź czy jesteśmy w środowisku CI
const isCI = process.env.CI || process.env.GITHUB_ACTIONS || false;

// W CI nie ładujemy .env.test - zmienne są ustawiane przez workflow
if (!isCI) {
	dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
}

// Sprawdź czy wszystkie wymagane zmienne są dostępne
// ale tylko jeśli nie jesteśmy w trakcie budowania w CI
const required = [
	'SUPABASE_URL',
	'SUPABASE_PUBLIC_KEY',
	'E2E_USERNAME_ID',
	'E2E_USERNAME',
	'E2E_PASSWORD',
];

// W CI zmienne są ustawiane później, więc pomijamy tę walidację
if (!isCI) {
	const missing = required.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		throw new Error(
			`Brak wymaganych zmiennych środowiskowych: ${missing.join(', ')}`,
		);
	}
}

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
		timeout: 120000, // 2 minuty na start serwera w CI
		env: {
			NODE_ENV: 'test',
			// W CI te zmienne będą dostępne z GitHub Actions
			SUPABASE_URL: process.env.SUPABASE_URL || '',
			NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || '',
			SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY || '',
			NEXT_PUBLIC_SUPABASE_ANON_KEY:
				process.env.SUPABASE_PUBLIC_KEY || '',
			E2E_USERNAME_ID: process.env.E2E_USERNAME_ID || '',
			E2E_USERNAME: process.env.E2E_USERNAME || '',
			E2E_PASSWORD: process.env.E2E_PASSWORD || '',
		},
	},
});
