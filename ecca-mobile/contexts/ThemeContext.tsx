import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSettings, Theme, getThemeColors } from '../lib/settings';

interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { settings, loading } = useSettings();
  const [colors, setColors] = useState<ThemeColors>(getThemeColors('light'));

  useEffect(() => {
    if (!loading) {
      setColors(getThemeColors(settings.theme));
    }
  }, [settings.theme, loading]);

  const value: ThemeContextType = {
    theme: settings.theme,
    colors,
    isDark: settings.theme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};