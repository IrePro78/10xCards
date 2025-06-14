import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// W CI nie ładujemy .env.test
if (!process.env.CI) {
	dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
}

// Sprawdź czy wszystkie wymagane zmienne są dostępne
const required = [
	'SUPABASE_URL',
	'SUPABASE_PUBLIC_KEY',
	'E2E_USERNAME_ID',
	'E2E_USERNAME',
	'E2E_PASSWORD',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
	throw new Error(
		`Brak wymaganych zmiennych środowiskowych: ${missing.join(', ')}`,
	);
}

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI
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
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
		timeout: 120000, // 2 minuty na start serwera w CI
		env: {
			NODE_ENV: 'test',
			// TypeScript wie, że te zmienne istnieją, bo sprawdziliśmy je wyżej
			SUPABASE_URL: process.env.SUPABASE_URL!,
			NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL!,
			SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY!,
			NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_PUBLIC_KEY!,
			E2E_USERNAME_ID: process.env.E2E_USERNAME_ID!,
			E2E_USERNAME: process.env.E2E_USERNAME!,
			E2E_PASSWORD: process.env.E2E_PASSWORD!,
		},
	},
});
