const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkRLS() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const result = await client.query(`
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
    `);

        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('PG Error:', err.message);
    } finally {
        await client.end();
    }
}

checkRLS();
