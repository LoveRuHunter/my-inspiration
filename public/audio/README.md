# Фоновая музыка Holocron

Плеер ищет файл `theme.mp3` в этой папке. Если файл отсутствует, кнопка «Тема» в TopBar остаётся выключенной, но приложение работает.

## Что положить

Нужен один файл: **`public/audio/theme.mp3`** (или `.ogg` — тогда измени `TRACK_SRC` в `src/components/AudioController.tsx`).

Реальные саундтреки Джона Уильямса и другой материал Lucasfilm — copyright, использовать нельзя. Возьми что-нибудь совместимое с CC0 / CC-BY / Public Domain:

- **Pixabay Music** — https://pixabay.com/music/ (лицензия Pixabay, коммерческое использование разрешено). Ищи `space ambient`, `sci-fi cinematic`, `dark orchestral`.
- **Free Music Archive** — https://freemusicarchive.org/ (фильтруй по CC0 / CC-BY).
- **Incompetech (Kevin MacLeod)** — https://incompetech.com/music/royalty-free/ (CC-BY, укажи авторство).
- **Bensound** — https://www.bensound.com/ (бесплатно с указанием авторства).
- **NASA Audio Collection** — https://www.nasa.gov/nasa-audio-collections/ (public domain, отлично ложится под «космос»).

## Требования

- Формат: MP3 (совместим со всеми браузерами).
- Битрейт 128–192 kbps достаточно — плеер зациклен, качество на слух важно, но не критично.
- Длина: 2–5 минут (плеер зациклит через `loop = true`).
- Громкость: нормализованная. Начальная громкость в интерфейсе — 40%.

## Автоплей

Браузеры блокируют автоплей до первого клика пользователя. Плеер это учитывает: если `.play()` упал — состояние сбросится в «пауза».

## Локальный источник в проекте

Если хочешь версионировать музыку — положи файл сюда. Он попадёт в билд Vite как статик (`/audio/theme.mp3`).
