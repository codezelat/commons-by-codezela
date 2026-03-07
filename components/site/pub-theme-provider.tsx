"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type PubTheme = "lavender" | "cream";

interface PubThemeContextValue {
  theme: PubTheme;
  setTheme: (t: PubTheme) => void;
  toggle: () => void;
}

const PubThemeContext = createContext<PubThemeContextValue>({
  theme: "lavender",
  setTheme: () => {},
  toggle: () => {},
});

const STORAGE_KEY = "pub-theme";
const DEFAULT_THEME: PubTheme = "lavender";

const listeners = new Set<() => void>();

function readTheme(): PubTheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "cream" || stored === "lavender") return stored;
  return DEFAULT_THEME;
}

function writeTheme(t: PubTheme) {
  localStorage.setItem(STORAGE_KEY, t);
  document.documentElement.setAttribute("data-pub-theme", t);
  listeners.forEach((fn) => fn());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return readTheme();
}

function getServerSnapshot() {
  return DEFAULT_THEME;
}

export function PubThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep the DOM attribute in sync on first render
  useEffect(() => {
    document.documentElement.setAttribute("data-pub-theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: PubTheme) => writeTheme(t), []);
  const toggle = useCallback(
    () => writeTheme(readTheme() === "lavender" ? "cream" : "lavender"),
    [],
  );

  return (
    <PubThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </PubThemeContext.Provider>
  );
}

export function usePubTheme() {
  return useContext(PubThemeContext);
}
