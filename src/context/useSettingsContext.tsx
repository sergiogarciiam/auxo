import { settings } from "@/src/database/sqlite/settings";
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeOption, WeightUnit } from "../types/ui";

type SettingsContextType = {
  theme: ThemeOption;
  weightUnit: WeightUnit;
  setTheme: (theme: ThemeOption) => Promise<void>;
  setWeightUnit: (unit: WeightUnit) => Promise<void>;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextType>({
  theme: "system",
  weightUnit: "kg",
  setTheme: async () => {},
  setWeightUnit: async () => {},
  loading: true,
});

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [theme, setThemeState] = useState<ThemeOption>("system");
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>("kg");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await settings.get();
      setThemeState(data.theme as ThemeOption);
      setWeightUnitState(data.weightUnit as WeightUnit);
      setLoading(false);
    };
    load();
  }, []);

  const setTheme = async (newTheme: ThemeOption) => {
    await settings.update({ theme: newTheme, weight_unit: weightUnit });
    setThemeState(newTheme);
  };

  const setWeightUnit = async (newUnit: WeightUnit) => {
    await settings.update({ theme, weight_unit: newUnit });
    setWeightUnitState(newUnit);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        weightUnit,
        setTheme,
        setWeightUnit,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => useContext(SettingsContext);
