const Role = require('../models/Role');
const ROLE_CATALOGUE = require('../data/roles');

/**
 * Upsert the role catalogue, keyed on the (unique) roleName.
 *
 * This replaces a `Role.deleteMany()` + `insertMany()` pair, which was
 * destructive in a way that mattered: dropping the collection reassigns every
 * `_id`, so a reseed silently orphaned every `UserAnalysis.roleId` pointing at
 * the old documents. It also left a window where the collection was empty and
 * the role picker rendered nothing.
 *
 * Upserting by name keeps ids stable and makes the operation safe to re-run on
 * every deploy.
 */
async function seedRoles() {
  const result = await Role.bulkWrite(
    ROLE_CATALOGUE.map((role) => ({
      updateOne: {
        filter: { roleName: role.roleName },
        update: { $set: { requiredSkills: role.requiredSkills } },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  return {
    total: ROLE_CATALOGUE.length,
    inserted: result.upsertedCount ?? 0,
    updated: result.modifiedCount ?? 0,
  };
}

module.exports = { seedRoles, ROLE_CATALOGUE };
