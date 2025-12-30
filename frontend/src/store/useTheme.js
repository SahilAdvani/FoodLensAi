import { useEffect } from "react";
import { useSelector } from "react-redux";

export const useTheme = () => {
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    const root = document.documentElement;

    if (mode === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    } else {
      root.classList.toggle("dark", mode === "dark");
    }
  }, [mode]);
};
