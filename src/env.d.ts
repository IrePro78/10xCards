/// <reference types="next" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db/database.types';

declare global {
	// Rozszerzenie interfejsu NextRequest
	namespace Next {
		interface NextRequest {
			supabase?: SupabaseClient<Database>;
		}
	}
}

// Definicje typów dla zmiennych środowiskowych
declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_SUPABASE_URL: string;
		NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
	}
}
