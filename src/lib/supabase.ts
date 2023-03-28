import { createClient } from '@supabase/supabase-js'
import { env } from '~/env.mjs';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
