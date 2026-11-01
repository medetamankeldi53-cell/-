# HANDOFF — проект «Reels / Уақыт куәлары»

Состояние на 2026-11-01. Ветка `claude/montazh-zi1sud`, репозиторий `medetamankeldi53-cell/-`.
Пользователь — Медет (автор). Общается на казахском и русском; ролики — на казахском.

## Что это

Вертикальные ролики 1080×1920 (Reels/Shorts) на Remotion: монтаж клипов, документальный
монтаж из архива, 2D flat-анимация, пиксель-арт с AI-клипами, видео-уроки.
Весь код — в `reels-video/`. Готовые ролики для скачивания — в `exports/`
(ссылка вида `https://github.com/medetamankeldi53-cell/-/raw/refs/heads/claude/montazh-zi1sud/exports/<файл>`;
GitHub не принимает файлы > 100 МБ — перекодировать `-crf 20 -maxrate 7M`).

## Как рендерить

```bash
cd reels-video && npm i
npm run lint                       # eslint + tsc, должен быть чистым
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion still <Id> /tmp/x.png --frame=60 --scale=0.3 --browser-executable=$B
npx remotion render <Id> out/<имя>.mp4 --crf=18 --browser-executable=$B
```
Chromium Remotion сам не скачивает (remotion.media закрыт) — всегда `--browser-executable`.
Длинные рендеры (1–2 мин видео ≈ 5–15 мин) — в фоне.

## Композиции (`src/Root.tsx`)

| Id | Что | Код | Готовый файл |
|---|---|---|---|
| `Reels` | шаблон «хук → 3 пункта → CTA» | `src/scenes/`, `ReelsVideo.tsx` | — |
| `Montage` | 2 клипа «обмен одеждой», хук 2 с, бесшовный переход через наезд | `src/montage/` | `out/montage.mp4` |
| `Story` / `StoryKZ` | трейлер «Монтаж с Claude» (ru / kk) | `src/story/` (тексты в `i18n.tsx`) | `out/story*.mp4` |
| `Journey` | «Уақыт» — путь автора, 68 с, диктор, 2× эффект 0:50–0:59 | `src/journey/` | `out/journey.mp4` |
| `JourneyCover` | синяя обложка «Уақыт» (Still) | `src/journey/Cover.tsx` | `out/cover.jpg` |
| `Witness` | «Уақыт куәлары: 1906–1916», архив + диктор, 53 с | `src/witness/` | `exports/Uakyt-kuelary-1906-1916.mp4` |
| `Agents` | «Агенттер» — пиксель-арт, 31 сцена, AI-клипы, робот-голос, 1:21 | `src/agents/` | `exports/Agentter-kz.mp4` |
| `FlatDemo` | 14 с демо 2D flat | `src/flat/` | `out/flat-demo.mp4` |
| `Toi` | «Агенттер той жасайды» — 2D flat, 53 с | `src/toi/` | `exports/Toi-agentter.mp4` |
| `Lesson-prompt-101` | видео-урок «Жақсы промпт: 4 ереже», 74 с | `src/lesson/` | `exports/Sabaq-jaqsy-prompt.mp4` |

Общие куски: `src/fonts.ts` (Montserrat + Cormorant Garamond с казахскими буквами, локально в `public/fonts/`),
`src/flat/characters.tsx` (SVG-персонажи: `Medet` с вариантом `look` для брата, `Agent`-кубик, `Skyline`),
`src/journey/kit.tsx` (`Narration` с акцентами `*слово*`, `PosterCard`, `LightLeak`).

## Агент видео-уроков

Скилл `.claude/skills/video-lesson/SKILL.md` (`/video-lesson <тема>`): JSON урока в
`src/lesson/lessons/<id>.json` → озвучка `public/lessons/<id>/NN.mp3` (по файлу на слайд) →
`node scripts/lesson-audio.mjs <id>` (длительности + громкость для рта учителя) → регистрация в Root → рендер.
Голоса нормализовать: `loudnorm=I=-14:TP=-1.5:LRA=7`.

## Голос и сервисы

- Диктор: ElevenLabs **Alex Bell — Deep and Confident**, voice_id `TUQNWEvVPBLzMBSVDPUA`, модель `eleven_v4`.
- ElevenLabs-коннектор подключён к claude.ai пользователя и тратит **его** кредиты; баланс через коннектор не виден.
  Генерировать с `generations_count: 1` и предупреждать о стоимости (≈ 1 кредит/символ).
  «Free generations are busy» → не повторять в том же ходе; аккаунт, похоже, на бесплатном тарифе.
  Часто проще дать пользователю реплики — он генерирует сам и присылает mp3.
- Эмоциональные теги `[excited]` и т. п. в v4 работают не гарантированно — лучше пунктуация.
- Робот-эффект (для финальных строк «Мен агентпін…»): `afftfilt=real='hypot(re,im)':imag='0'…,flanger,aecho` + `volume=23dB` — см. команды в коммитах Agents/Toi.
- Сеть: открыты Wikimedia, archive.org (без `*.archive.org`-зеркал), huggingface.co (но не `cdn.hf.co`),
  storage.googleapis.com, github releases. Pexels/Pixabay — ключей нет.
- Whisper недоступен (CDN HF закрыт) — фразы выравниваются по паузам (`silencedetect`) и слогам.

## Предпочтения пользователя (важно)

- Название серии — **«Уақыт куәлары»** (не «куәлері»).
- В «Агенттер»: мат в голосе без бипа; в субтитрах звёздочка только у «нах*й»; вместо «блядь» — «ёпдігыдык», вместо «охуенно» — «офигенно».
- Подписи с ключевыми словами-акцентами (оранжевый/золотой), без лишних титров; «Идея: @kireev.voice» — в описании, не в ролике.
- Хуки короткие (~2 с), темп быстрый; при желании — 2× ускорение, бесшовные переходы через наезд.
- Изображения генерирует сам (Nano Banana/GPT Image/Kling и т. п.) — нужны готовые промпты; надписи на казахском лучше накладывать кодом.

## Открытые хвосты

- Постеры 1906 ЖЕР / 1913 СӨЗ всё ещё с надписью «КУӘЛЕРІ» (сделаны пользователем) — предлагалось перегенерировать или поправить.
- Эпизод «1916. Тізім» в работе у пользователя — добавить в `Witness`/отдельный ролик, когда пришлёт.
- Идеи серии «Агенттер» (не сделаны): спортзал, свидание, «ұлттық агенттер», профсоюз агентов, «Монтажшы агент», музей 2050.
- `src/agents/` — сцена 22 (полицейский) и 26 («2 күн бұрын») намеренно остаются картинками.
