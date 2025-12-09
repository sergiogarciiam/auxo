import type { SQLiteDatabase } from "expo-sqlite";

let internalDb: SQLiteDatabase | null = null;

/**
 * Initializes the database instance
 * Must be called from SQLiteProvider.onInit
 */
export function setDatabase(db: SQLiteDatabase): void {
  internalDb = db;
}

/**
 * Ensures database is initialized
 * @throws Error if database not initialized
 */
function ensureDb(): SQLiteDatabase {
  if (!internalDb)
    throw new Error(
      "Database not initialized. Make sure `setDatabase` was called from SQLiteProvider.onInit.",
    );
  return internalDb;
}

/**
 * Executes a query with error handling
 */
export const runQuery = async (
  sql: string,
  params: any[] = [],
): Promise<any> => {
  const db = ensureDb();
  try {
    const result = await db.runAsync(sql, params);
    return result;
  } catch (err) {
    console.error("SQL Error:", sql, err);
    throw err;
  }
};

/**
 * Fetches all rows matching a query
 */
export const getAllRows = async (
  sql: string,
  params: any[] = [],
): Promise<any[]> => {
  const db = ensureDb();
  try {
    const result = await db.getAllAsync(sql, params);
    return result;
  } catch (err) {
    console.error("SQL Error:", sql, err);
    throw err;
  }
};

/**
 * Fetches a single row matching a query
 */
export const getFirstRow = async (
  sql: string,
  params: any[] = [],
): Promise<any> => {
  const db = ensureDb();
  try {
    const result = await db.getFirstAsync(sql, params);
    return result;
  } catch (err) {
    console.error("SQL Error:", sql, err);
    throw err;
  }
};
