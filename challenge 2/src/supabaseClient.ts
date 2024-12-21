import { createClient } from '@supabase/supabase-js';
import { DatabaseSchema } from './db';

export const supabase = createClient<DatabaseSchema>(
  'https://xsqczpbbkqwvnbtcgkcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcWN6cGJia3F3dm5idGNna2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTI1NjgsImV4cCI6MjA1MDM2ODU2OH0.V81ItpHL9Sp3-jcwfzuhBEyx9dPsSeWERCwusbSE4-w'
);