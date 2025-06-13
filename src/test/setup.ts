import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Rozszerzenie matcherów Vitest o matchery z testing-library
expect.extend(matchers);

// Czyszczenie po każdym teście
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

// Symulacja localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

// Symulacja sessionStorage
const sessionStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

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
