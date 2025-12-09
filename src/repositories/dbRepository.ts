import { setDatabase } from "../database/sqlite/db";
import { migrateDbIfNeeded } from "../database/sqlite/migrateDbIfNeeded";

async function onInit(db: Parameters<typeof migrateDbIfNeeded>[0]) {
  setDatabase(db as any);
  await migrateDbIfNeeded(db as any);
}

export const dbRepository = {
  onInit,
  migrateDbIfNeeded,
};
