import { getFirstRow, runQuery } from "./db";

export const settings = {
  update: async ({
    theme,
    weight_unit,
  }: {
    theme: string;
    weight_unit: string;
  }): Promise<any> => {
    const sql = `
     UPDATE settings
     SET theme = ?, weight_unit = ?, updated_at = CURRENT_TIMESTAMP
    `;
    return await runQuery(sql, [theme, weight_unit]);
  },

  get: async (): Promise<{ theme: string; weightUnit: string }> => {
    const sql = `SELECT theme, weight_unit FROM settings;`;
    let result = await getFirstRow(sql);

    // Si no existe ningún registro, crea uno por defecto
    if (!result) {
      const defaults = {
        theme: "system" as string,
        weightUnit: "kg" as string,
      };
      await runQuery(
        `INSERT INTO settings (theme, weight_unit) VALUES (?, ?)`,
        [defaults.theme, defaults.weightUnit],
      );
      result = defaults;
    }

    return {
      theme: result.theme as string,
      weightUnit: result.weightUnit as string,
    };
  },
};
