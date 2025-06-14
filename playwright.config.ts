import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// W CI nie ładujemy .env.test
if (!process.env.CI) {
	dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
}

// Przygotuj zmienne środowiskowe
const env = {
	SUPABASE_URL: process.env.SUPABASE_URL || 'http://mock.supabase.co',
	SUPABASE_PUBLIC_KEY:
		process.env.SUPABASE_PUBLIC_KEY || 'mock_key_for_tests',
	E2E_USERNAME_ID: process.env.E2E_USERNAME_ID || 'test_user_id',
	E2E_USERNAME: process.env.E2E_USERNAME || 'test@example.com',
	E2E_PASSWORD: process.env.E2E_PASSWORD || 'test_password',
};

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
		// Przekaż zmienne środowiskowe do testów
		...env,
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
			SUPABASE_URL:
				process.env.SUPABASE_URL || 'http://mock.supabase.co',
			NEXT_PUBLIC_SUPABASE_URL:
				process.env.SUPABASE_URL || 'http://mock.supabase.co',
			SUPABASE_PUBLIC_KEY:
				process.env.SUPABASE_PUBLIC_KEY || 'mock_key_for_tests',
			NEXT_PUBLIC_SUPABASE_ANON_KEY:
				process.env.SUPABASE_PUBLIC_KEY || 'mock_key_for_tests',
			E2E_USERNAME_ID: process.env.E2E_USERNAME_ID || 'test_user_id',
			E2E_USERNAME: process.env.E2E_USERNAME || 'test@example.com',
			E2E_PASSWORD: process.env.E2E_PASSWORD || 'test_password',
		},
	},
});
