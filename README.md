# Interactive Star Wars Holocron

Интерактивный архив Галактики: 3D-карта, таймлайн эпох, планеты, персонажи, бестиарий, AI-гид, фоновая тема и tRPC-бэкенд.

## Стек

### Клиент

- **React 19 + TypeScript + Vite** — фронт
- **Tailwind CSS** — тема Holocron (чёрно-синий + мягкий белый)
- **Zustand** — состояние + URL-синхронизация (`?era=...&planet=...&view=...`)
- **React Three Fiber + drei** — 3D-карта галактики с процедурным визуалом планет
- **Framer Motion** — анимации панелей и переходов
- **tRPC-client + superjson** — типизированный клиент к бэкенду

### Сервер

- **Fastify + @fastify/cors** — HTTP-хост
- **tRPC (@trpc/server) + zod + superjson** — процедуры и валидация
- Данные пока читаются из `src/data/*.ts` (mock), но структура готова под Drizzle + Postgres + PostGIS

### Инфраструктура

- **Vitest + Testing Library + jsdom** — тесты
- **ESLint + Prettier + Husky + lint-staged** — качество кода
- **tsx + concurrently** — dev-запуск (web + api одновременно)

## Запуск

```bash
npm install
npm run dev:all    # web (http://localhost:3000) + api (http://127.0.0.1:4000/trpc)
```

Или по отдельности:

```bash
npm run dev        # только фронт
npm run server     # только tRPC-бэкенд

npm run test       # тесты (watch)
npm run test:run   # тесты (CI)
npm run lint
npm run format
npm run build      # прод-сборка
```

После первого `npm install` Husky автоматически поставит pre-commit хук (`.husky/pre-commit`), который прогонит lint-staged.

> Если бэкенд не запущен, фронт всё равно работает: `src/lib/api.ts` автоматически падает на локальные mock-данные из `src/data/*`.

## Фоновая музыка

Плеер в TopBar работает в двух режимах:

1. **Procedural ambient (по умолчанию)** — `src/lib/ambient-audio.ts` генерирует собственный pad через Web Audio API: детуненные осцилляторы + лов пасс с LFO + розовый шум. Никаких внешних файлов, никакого copyright — всё честно.
2. **Свой файл** — если положить `public/audio/theme.mp3`, плеер возьмёт его. Подробности и CC0-источники — в `public/audio/README.md`.

Автоплей включён по умолчанию; браузеры блокируют звук до первого клика, поэтому музыка заиграет в момент первого взаимодействия. Состояние плеера (play/pause, громкость, mute) персистится в `localStorage`.

## Аватары персонажей и существ

Генерация через **DiceBear** (CC0, без API-ключа). Стиль подбирается по id персонажа (`src/lib/avatars.ts`):

- Люди — `adventurer` (человеческие лица)
- Йода, Джа-Джа — `lorelei`
- Чубакка, Джабба — `bottts`
- Существа — `shapes`

У `Character`, `Creature` и `Planet` есть опциональное поле `imageUrl`. Если ты впишешь туда свою ссылку (собственный арт, CC0-фото, любой ресурс, который не нарушает copyright), компонент `<SmartImage>` использует её и автоматически переключается на DiceBear при ошибке загрузки.

> Официальные арты Lucasfilm/Disney в репе хардкодить нельзя — даже для фан-проектов это нарушение авторского права. Поле `imageUrl` даёт тебе возможность локально подключить свои картинки, не коммитя их в git.

## Процедурный визуал планет

Два уровня:

- **3D-карта** — `src/lib/planet-visual.ts` задаёт цвет, эмиссию, roughness/metalness, радиус и кольца каждой планеты в R3F.
- **Портрет в панели** — `src/components/PlanetPortrait.tsx` рисует SVG-диск с атмосферой, континентами-пятнами, кольцами и бликом. Всё детерминированно по id.

Есть оверрайды для узнаваемых миров (Татуин — песочный, Хот — ледяной, Мандалор — с кольцом). Поле `imageUrl` у планеты перекрывает портрет.

## URL как источник правды

Всё состояние (эпоха, выбранная планета, активный вид) сериализуется в query-string, ссылкой можно поделиться:

```
/?era=empire&planet=mandalore&view=map
```

## Структура

```
my-react-app/
├── server/
│   ├── index.ts               — Fastify-хост
│   ├── router.ts              — tRPC-роутер (AppRouter)
│   └── tsconfig.json          — отдельный TS-конфиг для бэка
├── public/
│   ├── holocron.svg           — favicon
│   └── audio/
│       ├── README.md          — где взять CC0-музыку
│       └── theme.mp3          — (положи сам)
└── src/
    ├── App.tsx                — маршрутизация вкладок (map/bestiary/graph)
    ├── main.tsx               — точка входа
    ├── index.css              — Tailwind + тема Holocron
    ├── components/
    │   ├── TopBar.tsx         — верхняя навигация + плеер + AI-toggle
    │   ├── AudioController.tsx — фоновый плеер (Zustand + localStorage)
    │   ├── Timeline.tsx       — таймлайн эпох
    │   ├── TimelineEvents.tsx — список событий выбранной эпохи
    │   ├── CharacterGraph.tsx — граф связей персонажей (SVG + аватары)
    │   ├── galaxy/GalaxyMap.tsx — 3D-карта галактики
    │   ├── panels/PlanetPanel.tsx — карточка планеты с процедурной «текстурой»
    │   ├── bestiary/Bestiary.tsx — бестиарий с аватарами и фильтрами
    │   └── ai/AIGuide.tsx     — mock AI-гид с tool calling
    ├── store/
    │   ├── holocron-store.ts  — Zustand + URL sync
    │   └── audio-store.ts     — состояние плеера, persist в localStorage
    ├── hooks/
    │   └── use-url-sync.ts    — реакция на back/forward
    ├── lib/
    │   ├── types.ts           — доменные типы
    │   ├── api.ts             — data-layer, ходит в tRPC с fallback на mock
    │   ├── trpc.ts            — tRPC-client
    │   ├── geo.ts             — 3D-расстояния (готовы под PostGIS)
    │   ├── avatars.ts         — DiceBear URL-генератор
    │   ├── planet-visual.ts   — процедурная палитра планет
    │   ├── url-state.ts       — сериализация состояния в URL
    │   └── cn.ts              — clsx + tailwind-merge
    ├── data/                  — mock: планеты, персонажи, существа, эпохи, события
    └── test/
        └── setup.ts           — конфигурация Vitest
```

## Что дальше (roadmap)

- Подключить реальный Postgres + PostGIS через Drizzle: заменить импорты в `server/router.ts` на репозитории
- Пространственные запросы `ST_3DDWithin`, `ST_ClusterKMeans` вместо `planetsWithinRadius`
- Neo4j для графа персонажей, GraphQL federation поверх Postgres+Neo4j
- Настоящий Claude tool calling в `AIGuide` — SSE-стрим и `get_planet_by_era`, `get_characters`, `list_creatures` через tRPC subscription
- Генерация иллюстраций существ (Stable Diffusion / DALL-E) с кэшом в сторедже
- PWA + IndexedDB (offline-first)
- Code-splitting: R3F/three в отдельный чанк (сейчас prod-бандл ~1.3 MB, 379 KB gzip)
