import { settings } from "@/src/database/sqlite/settings";
import { useCallback, useEffect, useState } from "react";

export const useSettings = () => {
  const [theme, setTheme] = useState<string>("system");
  const [weightUnit, setWeightUnit] = useState<string>("kg");
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
    async (newTheme: string, newWeightUnit: string) => {
      try {
        await settings.update({ theme: newTheme, weight_unit: newWeightUnit });
        setTheme(newTheme);
        setWeightUnit(newWeightUnit);
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
