import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseUrl = 'https://jzdvwdhdnueugpdzrsxb.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY ?? '';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZHZ3ZGhkbnVldWdwZHpyc3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3ODA2MDA5OSwiZXhwIjoxOTkzNjM2MDk5fQ.tzpkcmX_9ztH25_PyZV2PVxeRbFafH9fmuGpaqeZvcs'
export const supabase = createClient(supabaseUrl, supabaseKey);
