import { useState } from "react";

export type Theme = 'light' | 'dark' | 'system';
interface ThemeProviderProps {
    theme: Theme; // theme drop down for choose
    resolvedTheme: 'light' | 'dark'; // system get resolvedTheme for know what them is using
    isDark: boolean;  // if resovedTheme = dark -> true or false => help code is clean (if isDark ? iconDark : iconLight)
    setTheme: (theme: Theme) => void;  // for set them for save
    toggleTheme: () => void; // switch theme dark or light for fast.
}

