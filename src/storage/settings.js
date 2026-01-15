const KEY = "costManager.settings.v2";

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const ratesUrl =
      typeof parsed?.ratesUrl === "string" && parsed.ratesUrl.trim()
        ? parsed.ratesUrl.trim()
        : "/rates.json";
    return { ratesUrl };
  } catch {
    return { ratesUrl: "/rates.json" };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
