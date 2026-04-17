const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkRLS() {
    try {
        const policies = await prisma.$queryRaw`
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

        console.log(JSON.stringify(policies, null, 2));
    } catch (err) {
        console.error('Prisma Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkRLS();
