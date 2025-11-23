"use client";

// 1. Quitamos 'ToasterProps' del import
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

// 2. Quitamos ': ToasterProps' de las props
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme} // 3. Quitamos 'as ToasterProps["theme"]'
      className="toaster group"
      // 4. Quitamos 'as React.CSSProperties'
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      }}
      {...props}
    />
  );
};

export { Toaster };