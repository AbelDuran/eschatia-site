"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback);
  return () => window.removeEventListener("theme-change", callback);
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === "dark", () => false);
  function toggle() {
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("eschatia-theme", theme); } catch { /* Storage may be disabled. */ }
    window.dispatchEvent(new Event("theme-change"));
  }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-pressed={dark} aria-label="Тёмная тема" title={dark ? "Включить светлую тему" : "Включить тёмную тему"}><span aria-hidden="true">{dark ? "☀" : "☾"}</span></button>;
}
