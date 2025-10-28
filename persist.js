// simple persist/get helpers
export function persist(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)) }catch{} }
export function recall(key, fallback){
  try {
    const storedValue = localStorage.getItem(key);
    // If value is missing, or stored as "undefined" or "null" string, return fallback.
    if (storedValue === null || storedValue === 'undefined' || storedValue === 'null') {
      return fallback;
    }
    const parsed = JSON.parse(storedValue);
    // Return parsed value, or fallback if parsed value is null/undefined
    return parsed ?? fallback;
  } catch (e) {
    // This will catch any errors from JSON.parse on other malformed strings.
    console.warn(`Error recalling '${key}' from localStorage. Returning fallback.`, e);
    return fallback;
  }
}