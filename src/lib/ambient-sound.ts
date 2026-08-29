export const AMBIENT_SOUND_KEY = "lifestyles-ambient-sound";
export const AMBIENT_HINT_KEY = "lifestyles-ambient-hint-seen";

/** "Relax" by AtlasAudio — Pixabay Content License (511892). */
export const AMBIENT_MP3 = "/audio/ambient-relax.mp3";

export function readAmbientPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AMBIENT_SOUND_KEY) === "on";
}

export function writeAmbientPreference(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AMBIENT_SOUND_KEY, on ? "on" : "off");
}

export function readAmbientHintSeen(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(AMBIENT_HINT_KEY) === "1";
}

export function markAmbientHintSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AMBIENT_HINT_KEY, "1");
}
