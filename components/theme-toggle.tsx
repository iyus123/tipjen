"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tipjen-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {dark ? "Mode terang" : "Mode gelap"}
    </button>
  );
}
