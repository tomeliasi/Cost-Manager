const KEY = 'costManager.settings.v2';

/**
 * Load app settings from localStorage.
 * If missing, return default exchange rates URL.
 * Requirement: app must work even if user doesn't provide URL in settings.
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const ratesUrl = typeof parsed?.ratesUrl === 'string' && parsed.ratesUrl.trim()
      ? parsed.ratesUrl.trim()
      : '/rates.json';
    return { ratesUrl };
  } catch {
    return { ratesUrl: '/rates.json' };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
