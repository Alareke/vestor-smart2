/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;                // user-selected theme
  resolvedTheme: "light" | "dark"; // actual theme after resolving "system"
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function getStoredTheme(): Theme {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {}
  return "system";
}

function getResolved(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }
  return theme;
}

function applyThemeToDOM(finalTheme: "light" | "dark") {
  const root = document.documentElement;
  root.setAttribute("data-theme", finalTheme);
  root.classList.toggle("dark", finalTheme === "dark");
  // theme-color for mobile/address bar
  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", finalTheme === "dark" ? "#0b1220" : "#ffffff");
  // notify listeners (e.g., to sync iframes/portals)
  window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: finalTheme } }));
}

export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => getResolved(getStoredTheme()));

  // apply on mount
  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, []);

  // listen to system changes when in "system" mode
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const final = getResolved(theme);
      setResolvedTheme(final);
      applyThemeToDOM(final);
    };
    // apply immediately in case
    handler();
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else (mql as any).addListener?.(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else (mql as any).removeListener?.(handler);
    };
  }, [theme]);

  const setTheme = (t: Theme) => {
    try { localStorage.setItem("theme", t); } catch {}
    const final = getResolved(t);
    setThemeState(t);
    setResolvedTheme(final);
    applyThemeToDOM(final);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next as Theme);
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};