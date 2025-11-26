import { initDatabase } from "../database/sqlite/init";

export const dbRepository = {
  init: initDatabase,
};
