export const themeScript = `(() => {
  try {
    const saved = localStorage.getItem("tipjen-theme");
    const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
})();`;
