import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
interface ThemeProviderType {
  theme: Theme; // theme drop down for choose
  resolvedTheme: "light" | "dark"; // system get resolvedTheme for know what them is using
  isDark: boolean; // if resovedTheme = dark -> true or false => help code is clean (if isDark ? iconDark : iconLight)
  setTheme: (theme: Theme) => void; // for set them for save
  toggleTheme: () => void; // switch theme dark or light for fast.
}

// create context:
const ThemeContext = createContext<ThemeProviderType>({
  theme: "system",
  resolvedTheme: "light",
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

// React.FC => React.FunctionComponent
// <> inside <>, children is all class or file below <ThemeProvider>
// ReactNode is prop all component, is maybe mean div, html, text, component,...
const STORAGE_THEME = "user_theme";
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeState, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_THEME);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
    return "system";
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement; // <html>
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)"); // true or false
    const updateTheme = () => {
      const activeTheme =
        themeState === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : themeState;
      // activeTheme = if themeState vs 'system' = true => get theme follow by window dark or light;
      // themeState vs 'system' = false -> activeThem = themeState (tuc la neu k phai system, themeState đang chọn gì thì activeTheme sẽ là cái đó)
      setResolvedTheme(activeTheme);

      if (activeTheme === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    };
    updateTheme();
    localStorage.setItem(STORAGE_THEME, themeState);

    const handleSystemThemeChange = () => {
      if (themeState === "system") {
        updateTheme();
      }
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange); // if user choose 'system', web auto change when window or MACOS change theme
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themeState]);
  // chua hieu lam

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };
  return (
    <ThemeContext.Provider
      value={{
        theme: themeState,
        resolvedTheme,
        isDark: resolvedTheme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
