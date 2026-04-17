
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars. Ensure .env.local has SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Starting migration...');

    // 1a. Get Valid Profiles (to avoid FK errors)
    console.log('Fetching Profiles...');
    const { data: profiles, error: prErr } = await supabase.from('profiles').select('id, role');
    if (prErr) {
        console.error('Error fetching valid profiles:', prErr);
        return;
    }
    const validProfileIds = new Set(profiles.map(p => p.id));
    const fallbackBrand = profiles.find(p => (p.role || '').toLowerCase() === 'brand');
    console.log(`Loaded ${profiles.length} profiles. Fallback brand: ${fallbackBrand?.id || 'None'}`);

    // 1b. Get Brand Profiles to map ID -> UserID
    console.log('Fetching BrandProfiles...');
    const { data: brands, error: bErr } = await supabase.from('BrandProfile').select('id, userId');
    if (bErr) {
        console.error('Error fetching BrandProfiles:', bErr);
        return;
    }

    const brandMap = {}; // oldBrandId -> userId (UUID)
    brands.forEach(b => brandMap[b.id] = b.userId);
    console.log(`Loaded ${brands.length} brand profiles.`);

    // 2. Get Products
    console.log('Fetching legacy Products...');
    const { data: oldProducts, error: pErr } = await supabase.from('Product').select('*');
    if (pErr) {
        console.error('Error fetching Products:', pErr);
        return;
    }

    console.log(`Found ${oldProducts.length} legacy products to migrate.`);

    // 3. Migrate
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const p of oldProducts) {
        let brandId = brandMap[p.brandId];

        // Validate existence
        if (!brandId || !validProfileIds.has(brandId)) {
            console.warn(`Brand ${brandId} (from map) not found in profiles for contents of ${p.id}.`);
            if (fallbackBrand) {
                brandId = fallbackBrand.id;
                console.log(`-> Re-assigning to fallback brand: ${brandId}`);
            } else {
                console.warn(`-> No fallback brand found. Skipping.`);
                skipCount++;
                continue;
            }
        }

        // Prepare new object
        const newProduct = {
            brand_id: brandId,
            name: p.name,
            description: p.description,
            category: p.category,
            price: p.price,
            cover_image: p.imagePath || null,
            images: p.imagePath ? [p.imagePath] : [], // Use cover image as first image if no arrays
            link: p.link,
            tags: p.tags ? p.tags.split(',').map(t => t.trim()) : [],
            audience: p.audience,
            active: true
        };

        // Check duplication by name and brand to avoid double insertion if run user runs multiple times
        // (A rough check)
        const { data: existing } = await supabase.from('products')
            .select('id')
            .eq('brand_id', brandId)
            .eq('name', p.name)
            .single();

        if (existing) {
            console.log(`Skipping "${p.name}": already exists as ${existing.id}`);
            skipCount++;
            continue;
        }

        const { error: iErr } = await supabase.from('products').insert(newProduct);
        if (iErr) {
            console.error(`Failed to insert "${p.name}":`, iErr.message);
            failCount++;
        } else {
            console.log(`Migrated: "${p.name}"`);
            successCount++;
        }
    }

    console.log(`Migration Complete. Success: ${successCount}, Skipped: ${skipCount}, Failed: ${failCount}`);
}

migrate();
