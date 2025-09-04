const KEY = "my_app2_shortlinks_v1";

export function loadAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("loadAll:", err);
    return {};
  }
}

export function saveAll(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch (err) {
    console.error("saveAll:", err);
  }
}

export function addEntry(entry) {
  const all = loadAll();
  all[entry.shortcode] = entry;
  saveAll(all);
}

export function getEntry(code) {
  const all = loadAll();
  return all[code] || null;
}

export function deleteAll() {
  saveAll({});
}

export function addClick(code, click) {
  const all = loadAll();
  if (!all[code]) return;
  all[code].clicks = all[code].clicks || [];
  all[code].clicks.push(click);
  saveAll(all);
}

export function generateShortcode(existing) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let attempt = 0; attempt < 12; attempt++) {
    let s = "";
    for (let i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    if (!existing[s]) return s;
  }
  return "s" + Date.now().toString(36).slice(-6);
}

export function isValidUrl(value) {
  try {
    // quick and dirty way validate URL
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
