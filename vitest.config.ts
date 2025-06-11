import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@app': resolve(__dirname, './app'),
		},
	},
});
