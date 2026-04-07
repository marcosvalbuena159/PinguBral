import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uqtoprfpfgxejdvsmlvo.supabase.co'
const supabaseKey = 'sb_publishable_AyjHbCHVb0OSu5_6JSVIug_QB7P8QkH'

export const supabase = createClient(supabaseUrl, supabaseKey)