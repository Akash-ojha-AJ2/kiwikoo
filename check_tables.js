const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: d1 } = await supabase.rpc('execute_sql', { sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'identity_images';" });
    console.log('identity_images cols rpc:', d1);

    const { data: q1, error: e1 } = await supabase.from('identity_images').select('*').limit(1);
    console.log('identity_images data:', q1);

    const { data: q2, error: e2 } = await supabase.from('IdentityImage').select('*').limit(1);
    console.log('IdentityImage data:', q2);
}

check();
