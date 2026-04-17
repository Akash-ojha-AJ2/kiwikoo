const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStorage() {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets?.map(b => b.name));

    const { data: files, error: fErr } = await supabase.storage.from('identity-images').list();
    console.log('Files in identity-images:', files?.slice(0, 5));
}

checkStorage();
