import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase Project Settings -> API page
const supabaseUrl = 'https://nqaecbxxjhnlwbtrmzgs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xYWVjYnh4amhubHdidHJtemdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDI1MTksImV4cCI6MjA5OTMxODUxOX0.ajq-i32xDJf_qSCOj52_QS6o_HewGCGTffYI1kk-CjE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);