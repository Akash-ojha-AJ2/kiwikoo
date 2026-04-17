const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sql = `
-- Allow public viewing of images in identity-images bucket
CREATE POLICY IF NOT EXISTS "Public Access" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'identity-images');

-- Allow authenticated users to upload to identity-images bucket
CREATE POLICY IF NOT EXISTS "Auth Upload Access" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (
    bucket_id = 'identity-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own uploads
CREATE POLICY IF NOT EXISTS "Auth Update Access" 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING (
    bucket_id = 'identity-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
`;

async function applyRLS() {
    // Use the RPC to execute raw SQL as the service role
    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
        console.error('Failed to execute SQL via RPC. Falling back to alternative methods. Server Error:', error.message);

        // As an alternative, let's just make sure the bucket is fully public at the bucket level first
        const { data: bucket, error: bErr } = await supabase.storage.updateBucket('identity-images', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
            fileSizeLimit: 15728640 // 15MB
        });
        console.log('Bucket update:', bErr || 'Success');

        // Create a generic policy just to allow inserts for authenticated users
        console.log("Note: Please run the SQL manually in the Supabase SQL editor if RPC fails.");
        console.log(sql);
    } else {
        console.log('RLS policies applied successfully via RPC.');
    }
}

applyRLS();
