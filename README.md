# Interactive Star Wars Holocron
Мой личный проект, который будет развиваться. 
Ака - портфолио моих софт,хард,ии скилов)

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
``
