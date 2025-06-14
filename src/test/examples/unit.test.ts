import { describe, it, expect } from 'vitest';
import { mockSupabaseClient } from '../mocks/supabase.mock';

describe('Testy jednostkowe z mockiem Supabase', () => {
	it('powinien zwrócić pustą listę fiszek', async () => {
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

	it('powinien zasymulować zalogowanego użytkownika', async () => {
		const {
			data: { user },
			error,
		} = await mockSupabaseClient.auth.getUser();

		expect(error).toBeNull();
		expect(user).toEqual({
			id: 'test_user_id',
			email: 'test@example.com',
		});
	});
});
