import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("workout_timer.db");

export const runQuery = async (sql: string, params: any[] = []) => {
  try {
    const result = await db.runAsync(sql, params);
    return result;
  } catch (err) {
    console.error("SQL Error:", sql, err);
    throw err;
  }
};

export const getAllRows = async (sql: string, params: any[] = []) => {
  try {
    const result = await db.getAllAsync(sql, params);
    return result;
  } catch (err) {
    console.error("SQL Error:", sql, err);
    throw err;
  }
};

export const getFirstRow = async (sql: string, params: any[] = []) => {
  try {
    const result = await db.getFirstAsync(sql, params);
    return result;
  } catch (err) {
    console.error("SQL Error:", sql, err);
    throw err;
  }
};
