"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-20 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-muted transition-all duration-300 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      role="switch"
      aria-checked={isDark}
    >
      {/* Track background */}
      <span className="sr-only">Toggle theme</span>
      
      {/* Icons container */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5">
        <Sun 
          className={cn(
            "h-4 w-4 transition-all duration-700",
            !isDark ? "text-primary scale-110" : "text-muted-foreground scale-90"
          )} 
        />
        <Moon 
          className={cn(
            "h-4 w-4 transition-all duration-700",
            isDark ? "text-primary scale-110" : "text-muted-foreground scale-90"
          )} 
        />
      </div>

      {/* Thumb/Ball */}
      <span
        className={cn(
          "inline-block h-8 w-8 transform rounded-full bg-primary shadow-lg transition-all duration-700 ease-in-out",
          isDark ? "translate-x-11" : "translate-x-1"
        )}
      />
    </button>
  );
}

