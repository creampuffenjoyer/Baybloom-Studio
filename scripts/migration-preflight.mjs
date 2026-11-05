/** Read-only preflight. Do not rewrite a migration that may already be applied. */
export async function assertHistoricalMigrationSafe(client) {
  const [tables] = await client.$queryRaw`
    SELECT to_regclass('public."_prisma_migrations"')::text AS migrations,
           to_regclass('public."Design"')::text AS designs`;
  if (!tables?.designs) return;
  if (tables.migrations) {
    const applied = await client.$queryRaw`
      SELECT 1 FROM "_prisma_migrations"
      WHERE migration_name = '20261011090000_websites_only'
        AND finished_at IS NOT NULL AND rolled_back_at IS NULL`;
    if (applied.length) return;
  }
  const columns = await client.$queryRaw`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Design' AND column_name = 'type'`;
  if (!columns.length) return;
  const [affected] = await client.$queryRaw`
    SELECT count(*)::int AS count FROM "OrderItem" i
    JOIN "Design" d ON d.id = i."designId" WHERE d.type::text <> 'WEBSITE'`;
  const [empty] = await client.$queryRaw`
    SELECT count(*)::int AS count FROM "Order" o
    WHERE NOT EXISTS (SELECT 1 FROM "OrderItem" i WHERE i."orderId" = o.id)`;
  if (affected.count || empty.count) {
    throw new Error(
      `Migration blocked: websites_only would delete ${affected.count} historical order items and ${empty.count} empty orders. ` +
      "Preserve these records and reconcile receipts before deployment. See docs/phase-1-deployment.md. No migrations were run.",
    );
  }
}
