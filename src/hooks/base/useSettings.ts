import { settings } from "@/src/database/sqlite/settings";
import { ThemeOption, WeightUnit } from "@/src/stores/useSettingsStore";
import { useCallback, useEffect, useState } from "react";

export const useSettings = () => {
  const [theme, setTheme] = useState<ThemeOption>("system");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settings.get();
      setTheme(data.theme);
      setWeightUnit(data.weightUnit);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (newTheme: ThemeOption, newWeightUnit: WeightUnit) => {
      try {
        await settings.update({ theme: newTheme, weightUnit: newWeightUnit });
        // Refresca los valores desde DB para asegurar consistencia
        const updated = await settings.get();
        setTheme(updated.theme);
        setWeightUnit(updated.weightUnit);
      } catch (error) {
        console.error("Failed to update settings:", error);
      }
    },
    [],
  );

  // Carga inicial
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { theme, weightUnit, updateSettings, loading };
};
