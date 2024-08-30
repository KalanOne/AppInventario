import { create } from "zustand";

export { useThemeStore };

interface ThemeState {
  defaultTheme: boolean;
  changeTheme: () => void;
  changeThemeBoolean: (value: boolean) => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  defaultTheme: true,
  changeTheme: () =>
    set((state) => ({
      defaultTheme: !state.defaultTheme,
    })),
  changeThemeBoolean: (value) =>
    set(() => ({
      defaultTheme: value,
    })),
}));
