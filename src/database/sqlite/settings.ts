import { ThemeOption, WeightUnit } from "@/src/stores/useSettingsStore";
import { getFirstRow, runQuery } from "./db";

export const settings = {
  update: async ({
    theme,
    weightUnit,
  }: {
    theme: ThemeOption;
    weightUnit: WeightUnit;
  }): Promise<any> => {
    const sql = `
      UPDATE user_settings
      SET theme = ?, weight_unit = ?, updated_at = CURRENT_TIMESTAMP
    `;
    return await runQuery(sql, [theme, weightUnit]);
  },

  get: async (): Promise<{ theme: ThemeOption; weightUnit: WeightUnit }> => {
    const sql = `SELECT theme, weight_unit FROM user_settings LIMIT 1;`;
    let result = await getFirstRow(sql);

    // Si no existe ningún registro, crea uno por defecto
    if (!result) {
      const defaults = {
        theme: "system" as ThemeOption,
        weightUnit: "kg" as WeightUnit,
      };
      await runQuery(
        `INSERT INTO user_settings (theme, weight_unit) VALUES (?, ?)`,
        [defaults.theme, defaults.weightUnit],
      );
      result = defaults;
    }

    return {
      theme: result.theme as ThemeOption,
      weightUnit: result.weightUnit as WeightUnit,
    };
  },
};
