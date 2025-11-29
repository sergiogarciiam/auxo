import { migrateDbIfNeeded } from "../database/sqlite/migrateDbIfNeeded";

export const dbRepository = {
  migrateDbIfNeeded: migrateDbIfNeeded,
};
