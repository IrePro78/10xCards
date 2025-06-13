import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Ładuj zmienne środowiskowe testowe
dotenv.config({ path: '.env.test' });

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/**',
				'src/types/**',
				'**/*.d.ts',
				'**/*.test.{ts,tsx}',
				'**/index.{ts,tsx}',
			],
			thresholds: {
				statements: 70,
				branches: 70,
				functions: 70,
				lines: 70,
			},
		},
		include: ['src/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
		setupFiles: ['./src/test/setup.ts'],
		// Konfiguracja zmiennych środowiskowych dla testów
		env: {
			SUPABASE_URL: process.env.SUPABASE_URL,
			SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY,
			E2E_USERNAME_ID: process.env.E2E_USERNAME_ID,
			E2E_USERNAME: process.env.E2E_USERNAME,
			E2E_PASSWORD: process.env.E2E_PASSWORD,
		},
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@app': resolve(__dirname, './app'),
		},
	},
});
