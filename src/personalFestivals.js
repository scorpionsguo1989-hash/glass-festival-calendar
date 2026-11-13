import { dateFromKey } from "./calendar.js";
import { EFFECTS } from "./effects.js";

export const PERSONAL_FESTIVALS_KEY = "glass-calendar.personal-festivals.v1";
export const MAX_EVENT_NAME = 24;

function isPersonalFestival(value) {
  return value && typeof value.id === "string"
    && typeof value.name === "string" && value.name.trim().length > 0 && value.name.length <= MAX_EVENT_NAME
    && dateFromKey(value.date) !== null
    && Object.hasOwn(EFFECTS, value.scene)
    && typeof value.repeat === "boolean";
}

export function readPersonalFestivals() {
  try {
    const value = JSON.parse(localStorage.getItem(PERSONAL_FESTIVALS_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter(isPersonalFestival) : [];
  } catch {
    return [];
  }
}

export function updatePersonalFestivals(change) {
  const next = change(readPersonalFestivals());
  localStorage.setItem(PERSONAL_FESTIVALS_KEY, JSON.stringify(next));
  return next;
}
