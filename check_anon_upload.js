const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use service role to bypass RLS to read the bucket config
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkUpload() {
    const dummyBuffer = Buffer.from('fake image data');

    const { error: uploadError } = await anonClient.storage
        .from('identity-images')
        .upload(`test/anon-${Date.now()}.jpg`, dummyBuffer, { contentType: 'image/jpeg' });

    console.log('Anon Upload JPG Error:', uploadError?.message || 'Success');
}

checkUpload();
