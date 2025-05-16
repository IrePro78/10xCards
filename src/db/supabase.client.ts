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

export const DEFAULT_USER_ID = 'feed04f9-7dbc-4ed2-be9a-c518cf2ba5a5';
