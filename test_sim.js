const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUploadLogic() {
    const authUserId = 'a0f94ad5-3c1a-4a25-a7b2-73ecdbf41d06'; // Example ID, we might need a real one
    // Let's just find any valid profile
    const { data: p } = await supabase.from('influencer_profiles').select('id, user_id').limit(1);
    if (!p || p.length === 0) return console.log('no profiles');
    const profile = p[0];
    console.log('Using profile:', profile);

    const imageType = 'face_front';
    const fileName = `${profile.id}/${imageType}-${Date.now()}.jpg`;
    const publicUrl = 'http://test';

    const { data: existingImage } = await supabase
        .from('identity_images')
        .select('id')
        .eq('influencer_profile_id', profile.id)
        .eq('image_type', imageType)
        .maybeSingle()

    const payload = {
        influencer_profile_id: profile.id,
        image_type: imageType,
        image_path: fileName,
        image_url: publicUrl,
        is_active: true,
        updated_at: new Date().toISOString(),
    }

    let dbError;
    if (existingImage) {
        console.log('Updating existing:', existingImage.id);
        const { error } = await supabase
            .from('identity_images')
            .update(payload)
            .eq('id', existingImage.id);
        dbError = error;
    } else {
        console.log('Inserting new...');
        const { error } = await supabase
            .from('identity_images')
            .insert({ ...payload, id: crypto.randomUUID() });
        dbError = error;
    }

    if (dbError) {
        console.error('DB Error:', dbError);
    } else {
        console.log('Success');
    }
}

testUploadLogic();
