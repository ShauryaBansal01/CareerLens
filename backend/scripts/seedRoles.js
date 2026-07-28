/**
 * Seed the target-role catalogue.
 *
 *   npm run seed:roles
 *
 * Safe to re-run — roles are upserted by name, so ids stay stable and existing
 * analyses keep pointing at the right role. Run this once per environment
 * before the Skill Gap page goes live, otherwise the role picker is empty.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { seedRoles } = require('../services/roleSeedService');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Add it to backend/.env first.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const { total, inserted, updated } = await seedRoles();
  console.log(`Seeded roles: ${inserted} inserted, ${updated} updated, ${total} total.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Role seed failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
