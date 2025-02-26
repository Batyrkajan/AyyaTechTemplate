import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = "https://sescgrgsnriwwoitwopw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc2NncmdzbnJpd3dvaXR3b3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjA4ODAsImV4cCI6MjA1NjA5Njg4MH0.9-cUzg1o_psXQeClud0gs-7SivkJ9oznAGHZTszKJqE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
