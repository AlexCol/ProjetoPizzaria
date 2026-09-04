export type ThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  disabled: string;
  background: string;
  background2: string;
  foreground: string;
  primaryText: string;
  border: string;
};

export type ColorScheme = {
  light: ThemeColors;
  dark: ThemeColors;
};

export const colorsByTheme: ColorScheme = {
  light: {
    primary: "#2563eb",
    secondary: "#10b981",
    tertiary: "#f59e0b",
    success: "#16a34a",
    danger: "#dc2626",
    warning: "#f59e0b",
    info: "#2563eb",
    disabled: "#9ca3af",
    background: "#f9fafb",
    background2: "#ececee",
    foreground: "#374151",
    primaryText: "#111827",
    border: "#6a7282",
  },
  dark: {
    primary: "#3b82f6",
    secondary: "#34d399",
    tertiary: "#fbbf24",
    success: "#22c55e",
    danger: "#ef4444",
    warning: "#facc15",
    info: "#3b82f6",
    disabled: "#6b7280",
    background: "#111827",
    background2: "#1f2937",
    foreground: "#e5e7eb",
    primaryText: "#f9fafb",
    border: "#99a1af",
  },
};
