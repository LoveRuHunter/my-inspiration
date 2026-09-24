import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { PLANET_BY_ID } from '@/data/planets';
import { ERA_BY_ID } from '@/data/eras';
import { useHolocronStore } from '@/store/holocron-store';

interface Message {
  id: string;
  role: 'user' | 'guide';
  text: string;
  tools?: string[];
}

/**
 * Mock AI-гид. Имитирует Claude tool calling: показывает, какие «инструменты»
 * агент вызывает (get_planet_by_era, get_characters, get_creatures) и
 * стримит ответ по символам.
 *
 * Позже это подключается к настоящему стрим-эндпоинту `/api/guide`.
 */
async function* mockGuideStream(question: string, ctx: { eraId: string; planetId: string | null }) {
  const planet = ctx.planetId ? PLANET_BY_ID[ctx.planetId] : undefined;
  const era = ERA_BY_ID[ctx.eraId];
  const tools: string[] = [];
  if (planet) tools.push(`get_planet_by_era(${planet.id}, ${ctx.eraId})`);
  tools.push(`search_characters(era=${ctx.eraId})`);
  if (planet) tools.push(`list_creatures(planet=${planet.id})`);

  yield { kind: 'tools' as const, tools };

  const snapshot = planet?.eras.find((e) => e.eraId === ctx.eraId);

  const paragraphs = [
    planet
      ? `В эпоху «${era?.shortName ?? ctx.eraId}» ${planet.name} находилась под властью ${snapshot?.ruler ?? 'неизвестного правителя'} (фракция: ${snapshot?.faction ?? 'н/д'}).`
      : `Ты спрашиваешь: «${question}». В эпоху «${era?.shortName ?? ctx.eraId}» галактикой управляли: ${era?.ruling}.`,
    planet
      ? `Ключевые особенности: климат ${planet.climate}, ландшафт ${planet.terrain}. ${snapshot?.notes ?? ''}`
      : 'Уточни планету — вызову get_planet_by_era и дам подробности с датами и правителями.',
    'Источник: голокрон-архив. Данные могут отличаться в разных канонах.',
  ];

  const full = paragraphs.join('\n\n');
  let buffer = '';
  for (const ch of full) {
    buffer += ch;
    await new Promise((r) => setTimeout(r, 8));
    yield { kind: 'chunk' as const, text: buffer };
  }
}

export function AIGuide() {
  const open = useHolocronStore((s) => s.aiOpen);
  const close = useHolocronStore((s) => s.toggleAi);
  const eraId = useHolocronStore((s) => s.eraId);
  const planetId = useHolocronStore((s) => s.selectedPlanetId);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'guide',
      text: 'Приветствую. Я архивариус голокрона. Спроси про эпоху, планету или персонажа — вызову подходящие инструменты и найду.',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: q }]);
    const guideId = crypto.randomUUID();
    setMessages((m) => [...m, { id: guideId, role: 'guide', text: '', tools: [] }]);
    for await (const evt of mockGuideStream(q, { eraId, planetId })) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === guideId
            ? evt.kind === 'tools'
              ? { ...msg, tools: evt.tools }
              : { ...msg, text: evt.text }
            : msg,
        ),
      );
    }
    setBusy(false);
  }

  // Последнее сообщение ассистента — для aria-live-региона (только он озвучивается)
  const lastGuideText = [...messages].reverse().find((m) => m.role === 'guide')?.text ?? '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="pointer-events-auto absolute right-4 top-4 flex h-[calc(100%-2rem)] w-[380px] flex-col"
          role="dialog"
          aria-modal="false"
          aria-label="AI-гид"
        >
          <div className="holo-panel flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-holo-edge/60 px-4 py-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-holo-glow">
                  Archivist · stream
                </p>
                <h3 className="holo-title text-sm">AI-гид</h3>
              </div>
              <button
                className="holo-button !px-2 !py-1 text-xs"
                onClick={() => close(false)}
                aria-label="Закрыть AI-гид"
              >
                ✕
              </button>
            </div>

            <div
              ref={scrollRef}
              className="scrollbar-holo flex-1 space-y-3 overflow-y-auto p-4"
              role="log"
              aria-label="Сообщения AI-гида"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === 'user'
                      ? 'ml-6 rounded-lg border border-holo-glow/30 bg-holo-blue/10 p-3 text-sm text-holo-bone'
                      : 'mr-6 rounded-lg border border-holo-edge/50 bg-holo-deep/70 p-3 text-sm text-holo-bone/90'
                  }
                >
                  {m.tools && m.tools.length > 0 && (
                    <div
                      className="mb-2 flex flex-wrap gap-1"
                      aria-label="Инструменты, которые вызвал гид"
                    >
                      {m.tools.map((t) => (
                        <span
                          key={t}
                          className="holo-chip !text-[9px] font-mono normal-case tracking-normal"
                        >
                          ⚙ {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{m.text || (busy ? '…' : '')}</p>
                </div>
              ))}
            </div>

            {/* Скрытый aria-live: скринридер слышит только обновления гида, не UI-мусор */}
            <div className="sr-only" aria-live="polite" aria-atomic="false">
              {lastGuideText}
            </div>

            <form
              className="flex gap-2 border-t border-holo-edge/60 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              aria-label="Форма вопроса AI-гиду"
            >
              <label htmlFor="ai-guide-input" className="sr-only">
                Ваш вопрос архивариусу
              </label>
              <input
                id="ai-guide-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Расскажи про Мандалор в эпоху Империи…"
                className="flex-1 rounded-md border border-holo-edge/60 bg-holo-deep/60 px-3 py-2 text-sm text-holo-bone placeholder:text-holo-bone/40 focus:border-holo-glow focus:outline-none"
                disabled={busy}
              />
              <button type="submit" className="holo-button" disabled={busy}>
                {busy ? '…' : 'Спросить'}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
