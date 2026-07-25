import { create } from "zustand";

type Theme = "light" | "dark";
type ThemeState = { theme: Theme; setTheme: (theme: Theme) => void };

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem("theme") as Theme) || "light",
  setTheme: (theme) => { localStorage.setItem("theme", theme); set({ theme }); },
}));
