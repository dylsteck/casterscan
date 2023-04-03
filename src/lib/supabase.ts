import { createClient } from '@supabase/supabase-js'
import { env } from '~/env.mjs';
import { Database } from '~/types/database.t';

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
