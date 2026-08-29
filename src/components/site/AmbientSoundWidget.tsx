import { Music2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AMBIENT_MP3,
  markAmbientHintSeen,
  readAmbientHintSeen,
  readAmbientPreference,
  writeAmbientPreference,
} from "@/lib/ambient-sound";
import { cn } from "@/lib/utils";

export function AmbientSoundWidget() {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const stopSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const startSound = useCallback(async (): Promise<boolean> => {
    const audio = audioRef.current;
    if (!audio || unavailable) return false;

    audio.volume = 0.28;
    audio.loop = true;

    try {
      await audio.play();
      setEnabled(true);
      writeAmbientPreference(true);
      return true;
    } catch {
      setEnabled(false);
      writeAmbientPreference(false);
      return false;
    }
  }, [unavailable]);

  const disableSound = useCallback(() => {
    stopSound();
    setEnabled(false);
    writeAmbientPreference(false);
  }, [stopSound]);

  const toggle = useCallback(async () => {
    markAmbientHintSeen();
    setShowHint(false);
    if (enabled) {
      disableSound();
      return;
    }
    await startSound();
  }, [disableSound, enabled, startSound]);

  useEffect(() => {
    setMounted(true);
    setShowHint(!readAmbientHintSeen());

    if (!readAmbientPreference()) return;

    const resumeOnGesture = () => {
      void startSound();
    };
    window.addEventListener("pointerdown", resumeOnGesture, { once: true });
    window.addEventListener("keydown", resumeOnGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };
  }, [startSound]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, [stopSound]);

  if (!mounted || unavailable) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2">
      <audio
        ref={audioRef}
        src={AMBIENT_MP3}
        preload="none"
        onError={() => setUnavailable(true)}
        className="hidden"
        aria-hidden
      />

      {showHint && !enabled && (
        <div
          className="ambient-hint max-w-44 rounded-xl border border-border bg-card px-3 py-2 text-xs leading-snug text-foreground shadow-lg"
          role="status"
        >
          Tap for soft relaxing background sound
        </div>
      )}

      <button
        type="button"
        onClick={() => void toggle()}
        aria-pressed={enabled}
        aria-label={
          enabled ? "Turn off relaxing background sound" : "Turn on relaxing background sound"
        }
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-lg transition-transform hover:scale-[1.02]",
          !enabled && showHint && "ambient-attention",
          enabled && "border-brand bg-brand-soft text-brand",
        )}
      >
        {enabled ? (
          <>
            <VolumeX className="h-4 w-4" aria-hidden />
            Sound on
          </>
        ) : (
          <>
            <Music2 className="h-4 w-4" aria-hidden />
            Relaxing sound
          </>
        )}
      </button>

      <span className="sr-only" aria-live="polite">
        {enabled ? "Relaxing background sound is playing." : "Background sound is off."}
      </span>
    </div>
  );
}
