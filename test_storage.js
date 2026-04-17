const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testStorageUpload() {
    const fileName = `test/test-${Date.now()}.txt`;
    const buffer = Buffer.from('test string');

    // Try using the same service client approach
    let db = supabase;
    let uploadError = null;

    const uploadToStorage = async () => {
        return await db.storage
            .from('identity-images')
            .upload(fileName, buffer, { contentType: 'text/plain', upsert: true })
    }

    let uploadResult = await uploadToStorage();
    uploadError = uploadResult.error;

    if (uploadError && (uploadError.message?.includes('not found') || uploadError.statusCode === 404 || uploadError.message?.includes('Bucket'))) {
        console.log('Creating bucket...');
        await db.storage.createBucket('identity-images', { public: true }).catch(err => console.log('Create bucket err:', err));
        uploadResult = await uploadToStorage();
        uploadError = uploadResult.error;
    }

    if (uploadError) {
        console.error('Storage Upload Error:', uploadError);
    } else {
        console.log('Storage Upload Success:', uploadResult.data);
    }
}

testStorageUpload();
