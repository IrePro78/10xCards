import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Ładuj zmienne środowiskowe testowe
dotenv.config({ path: '.env.test' });

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'happy-dom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		env: {
			// Używamy MSW do mockowania Supabase
			SUPABASE_URL: 'http://127.0.0.1:3000',
			SUPABASE_PUBLIC_KEY: 'mock_public_key',
			E2E_USERNAME_ID: 'test_user_id',
			E2E_USERNAME: 'test_user',
			E2E_PASSWORD: 'test_password',
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/coverage/**',
			],
		},
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/cypress/**',
			'**/e2e/**',
			'**/.{idea,git,cache,output,temp}/**',
			'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
		],
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
});
