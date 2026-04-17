const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRLS() {
    const sql = `
    SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
    FROM
        pg_policies
    WHERE
        tablename = 'objects' AND schemaname = 'storage';
  `;

    const { data, error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
        console.error("RPC Error:", error.message);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

checkRLS();
