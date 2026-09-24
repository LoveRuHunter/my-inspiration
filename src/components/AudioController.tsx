import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAudioStore } from '@/store/audio-store';
import { getAmbientPad } from '@/lib/ambient-audio';

const TRACK_SRC = '/audio/theme.mp3';
const TRACK_TITLE = 'John Williams · Star Wars';
const AMBIENT_TITLE = 'Holocron · Ambient';

/**
 * Плеер темы Holocron.
 *
 * По умолчанию играет процедурный ambient pad из Web Audio API
 * (собственная генерация, без внешних файлов). Если в public/audio/
 * лежит theme.mp3 — плеер использует его вместо синтеза.
 *
 * Из-за политики браузеров автоплей возможен только после первого
 * пользовательского жеста. Мы вешаем одноразовый слушатель на window
 * и запускаем звук на первом клике/тапе/клавише.
 */
export function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const playing = useAudioStore((s) => s.playing);
  const volume = useAudioStore((s) => s.volume);
  const muted = useAudioStore((s) => s.muted);
  const toggle = useAudioStore((s) => s.toggle);
  const setVolume = useAudioStore((s) => s.setVolume);
  const setMuted = useAudioStore((s) => s.setMuted);

  // Проверяем, лежит ли пользовательский файл theme.mp3
  useEffect(() => {
    const el = new Audio();
    el.preload = 'metadata';
    el.src = TRACK_SRC;
    const onCanPlay = () => {
      setHasFile(true);
      el.loop = true;
      audioRef.current = el;
    };
    const onError = () => {
      setHasFile(false);
    };
    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('error', onError);
      el.pause();
    };
  }, []);

  // Пытаемся запустить сразу; если autoplay заблокирован — ждём первый жест
  useEffect(() => {
    let disposed = false;

    async function tryStart() {
      if (disposed) return;
      if (!playing) return;
      const effectiveVolume = muted ? 0 : volume;
      try {
        if (hasFile && audioRef.current) {
          audioRef.current.volume = effectiveVolume;
          await audioRef.current.play();
        } else {
          await getAmbientPad().start(effectiveVolume);
        }
        if (!disposed) setReady(true);
      } catch {
        // autoplay заблокирован — оставим ожидание жеста
      }
    }

    void tryStart();

    if (playing && !ready) {
      const gestureListener = () => {
        void tryStart();
      };
      window.addEventListener('pointerdown', gestureListener, { once: true });
      window.addEventListener('keydown', gestureListener, { once: true });
      return () => {
        disposed = true;
        window.removeEventListener('pointerdown', gestureListener);
        window.removeEventListener('keydown', gestureListener);
      };
    }
    return () => {
      disposed = true;
    };
  }, [playing, hasFile, muted, volume, ready]);

  // Реакция на паузу/громкость
  useEffect(() => {
    const effectiveVolume = muted ? 0 : volume;
    if (playing) {
      if (hasFile && audioRef.current) {
        audioRef.current.volume = effectiveVolume;
        audioRef.current.play().catch(() => {
          /* заблокировано до жеста */
        });
      } else if (ready) {
        void getAmbientPad().start(effectiveVolume);
      }
    } else {
      if (hasFile && audioRef.current) {
        audioRef.current.pause();
      }
      getAmbientPad().fadeOut();
    }
  }, [playing, volume, muted, hasFile, ready]);

  const displayVolume = muted ? 0 : volume;

  return (
    <div className="relative">
      <button
        className="holo-audio-button"
        data-active={playing}
        onClick={() => setExpanded((v) => !v)}
        aria-label="Аудио"
        aria-expanded={expanded}
      >
        <span className="holo-audio-icon" data-playing={playing}>
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="hidden text-xs font-medium sm:inline">
          {playing ? 'Тема · играет' : 'Тема'}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-30 mt-2 w-64 rounded-lg border border-holo-edge/60 bg-holo-deep/95 p-3 shadow-holo backdrop-blur-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-holo-glow">
                  Тема
                </p>
                <p className="text-[11px] text-holo-crystal">
                  {hasFile ? TRACK_TITLE : AMBIENT_TITLE}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  className="holo-mini-btn"
                  onClick={toggle}
                  aria-label={playing ? 'Пауза' : 'Играть'}
                >
                  {playing ? (
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                      <rect x="0" y="0" width="3" height="12" rx="1" />
                      <rect x="7" y="0" width="3" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                      <path d="M0 0L10 6L0 12Z" />
                    </svg>
                  )}
                </button>
                <button
                  className="holo-mini-btn"
                  onClick={() => setMuted(!muted)}
                  aria-label={muted ? 'Включить звук' : 'Заглушить'}
                  data-active={muted}
                >
                  {muted ? '×' : '≋'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-holo-bone/60">VOL</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={displayVolume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (muted && v > 0) setMuted(false);
                }}
                className="holo-slider flex-1"
                style={{ '--val': `${displayVolume * 100}%` } as React.CSSProperties}
                aria-label="Громкость"
              />
              <span className="w-8 text-right font-mono text-[10px] text-holo-crystal">
                {Math.round(displayVolume * 100)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
