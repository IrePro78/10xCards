import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type SupabaseClient = ReturnType<
	typeof createClient<Database>
>;

export const supabaseClient = createClient<Database>(
	supabaseUrl,
	supabaseAnonKey,
);

export const DEFAULT_USER_ID = 'a29cd4c1-c2b3-4fc6-844a-1aca30bca8ae';
