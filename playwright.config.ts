import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [['html', { open: 'never' }], ['list']],
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
		env: {
			NODE_ENV: 'test',
			...(process.env.SUPABASE_URL && {
				NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
			}),
			...(process.env.SUPABASE_PUBLIC_KEY && {
				NEXT_PUBLIC_SUPABASE_ANON_KEY:
					process.env.SUPABASE_PUBLIC_KEY,
			}),
			...(process.env.E2E_USERNAME_ID && {
				E2E_USERNAME_ID: process.env.E2E_USERNAME_ID,
			}),
			...(process.env.E2E_USERNAME && {
				E2E_USERNAME: process.env.E2E_USERNAME,
			}),
			...(process.env.E2E_PASSWORD && {
				E2E_PASSWORD: process.env.E2E_PASSWORD,
			}),
		},
	},
});
