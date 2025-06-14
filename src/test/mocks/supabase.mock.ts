import { vi } from 'vitest';

// Mock dla klienta Supabase używanego w testach jednostkowych
export const mockSupabaseClient = {
	from: vi.fn().mockReturnValue({
		select: vi.fn().mockReturnValue({
			limit: vi.fn().mockResolvedValue({
				data: [],
				error: null,
			}),
			eq: vi.fn().mockResolvedValue({
				data: [],
				error: null,
			}),
		}),
	}),
	auth: {
		getSession: vi.fn().mockResolvedValue({
			data: {
				session: {
					access_token: 'mock_token',
					user: { id: 'test_user_id', email: 'test@example.com' },
				},
			},
			error: null,
		}),
		getUser: vi.fn().mockResolvedValue({
			data: {
				user: { id: 'test_user_id', email: 'test@example.com' },
			},
			error: null,
		}),
		signInWithPassword: vi.fn().mockResolvedValue({
			data: {
				user: { id: 'test_user_id', email: 'test@example.com' },
				session: { access_token: 'mock_token' },
			},
			error: null,
		}),
	},
};
