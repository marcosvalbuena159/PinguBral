import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uqtoprfpfgxejdvsmlvo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdG9wcmZwZmd4ZWpkdnNtbHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTQwNjMsImV4cCI6MjA5MTA5MDA2M30.R8z5OTezM1TtivcXoVWRtZ2EM_u7HYn8BzybFFE84M4'

export const supabase = createClient(supabaseUrl, supabaseKey)
