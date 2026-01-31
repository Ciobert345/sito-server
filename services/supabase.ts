import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbqbxhtqvsvfasbmvahe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicWJ4aHRxdnN2ZmFzYm12YWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzQwNzgsImV4cCI6MjA4NDE1MDA3OH0.l7MKGPMyCx4EYpdGXG8MPu1PxDFXIWSZwHI8tBSjqRY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
