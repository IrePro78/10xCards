import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
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
