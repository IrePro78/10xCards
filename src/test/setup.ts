import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Rozszerz expect o matchers z jest-dom
expect.extend(matchers);

// Mock dla localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

// Mock dla sessionStorage
const sessionStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
	value: sessionStorageMock,
});

// Ustaw domyślne zmienne środowiskowe dla testów
beforeAll(() => {
	// Domyślne wartości dla testów
	process.env.SUPABASE_URL =
		process.env.SUPABASE_URL || 'https://mock.supabase.co';
	process.env.SUPABASE_PUBLIC_KEY =
		process.env.SUPABASE_PUBLIC_KEY || 'mock_public_key';
	process.env.E2E_USERNAME_ID =
		process.env.E2E_USERNAME_ID || 'test_user_id';
	process.env.E2E_USERNAME = process.env.E2E_USERNAME || 'test_user';
	process.env.E2E_PASSWORD =
		process.env.E2E_PASSWORD || 'test_password';
});

// Mock dla console.log w testach
global.console = {
	...console,
	log: vi.fn(),
	error: vi.fn(),
	warn: vi.fn(),
	info: vi.fn(),
	debug: vi.fn(),
};

// Cleanup po każdym teście
afterEach(() => {
	cleanup();
});

// Symulacja środowiska przeglądarki
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Konfiguracja MSW do mockowania Supabase
const server = setupServer(
	// Mock logowania
	rest.post(
		'http://127.0.0.1:3000/auth/v1/token',
		(req, res, ctx) => {
			return res(
				ctx.status(200),
				ctx.json({
					access_token: 'mock_token',
					token_type: 'bearer',
					expires_in: 3600,
					refresh_token: 'mock_refresh_token',
					user: {
						id: process.env.E2E_USERNAME_ID,
						email: process.env.E2E_USERNAME,
					},
				}),
			);
		},
	),

	// Mock pobierania użytkownika
	rest.get('http://127.0.0.1:3000/auth/v1/user', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				id: process.env.E2E_USERNAME_ID,
				email: process.env.E2E_USERNAME,
			}),
		);
	}),
);

// Startuj serwer przed wszystkimi testami
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Resetuj handlery po każdym teście
afterEach(() => server.resetHandlers());

// Zamknij serwer po wszystkich testach
afterAll(() => server.close());
