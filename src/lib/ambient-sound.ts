export const AMBIENT_SOUND_KEY = "lifestyles-ambient-sound";
export const AMBIENT_HINT_KEY = "lifestyles-ambient-hint-seen";

/** "Relax" by AtlasAudio — Pixabay Content License (511892). */
export const AMBIENT_MP3 = `${import.meta.env.BASE_URL}audio/ambient-relax.mp3`.replace(
  /(?<!:)\/{2,}/g,
  "/",
);

/** True unless the visitor explicitly turned sound off. New visitors default to on. */
export function readAmbientPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(AMBIENT_SOUND_KEY) !== "off";
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
