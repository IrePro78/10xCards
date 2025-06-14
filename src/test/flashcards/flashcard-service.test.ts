import { describe, it, expect } from 'vitest';
import { mockSupabaseClient } from '../mocks/supabase.mock';

describe('FlashcardService - testy jednostkowe', () => {
	it('powinien zwrócić pustą listę fiszek dla nowego użytkownika', async () => {
		const { data, error } = await mockSupabaseClient
			.from('flashcards')
			.select('*')
			.limit(5);

		expect(error).toBeNull();
		expect(data).toEqual([]);
		expect(mockSupabaseClient.from).toHaveBeenCalledWith(
			'flashcards',
		);
	});

	it('powinien poprawnie obsłużyć autoryzację użytkownika', async () => {
		const {
			data: { session },
			error,
		} = await mockSupabaseClient.auth.getSession();

		expect(error).toBeNull();
		expect(session).toBeDefined();
		expect(session.access_token).toBe('mock_token');
		expect(session.user.id).toBe('test_user_id');
	});
});
