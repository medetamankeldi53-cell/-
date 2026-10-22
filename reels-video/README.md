# Reels-видео из кода (Remotion)

Вертикальный ролик 1080×1920, 30 fps, ~13 секунд — для Reels / Shorts / TikTok.

Структура: **хук → 3 пункта → призыв к действию**, переходы между сценами и полоска прогресса сверху.

| Файл | Что внутри |
| --- | --- |
| `src/ReelsVideo.tsx` | Монтаж: порядок сцен, длительности, переходы, тексты пунктов |
| `src/scenes/HookScene.tsx` | Сцена 1 — хук |
| `src/scenes/PointScene.tsx` | Сцена пункта (используется 3 раза) |
| `src/scenes/CtaScene.tsx` | Финал — призыв к действию |
| `src/Root.tsx` | Регистрация композиций (размер, fps, общая длительность) |
| `public/fonts/` | Шрифт Montserrat (OFL) с кириллицей |

## Монтаж из клипов (`Montage`)

`src/montage/Montage.tsx` — ролик ~14 с из двух клипов «прошли мимо — поменялись одеждой» (`public/clips/`):
хук 2 с с наездом на подмену → клип 1 (ускорение → slow-mo на подмене → реальная скорость) → слайд → клип 2 → CTA.
На подменах — вспышка и басовый удар (`public/sfx/`, сгенерированы ffmpeg).

```bash
npx remotion render Montage out/montage.mp4
```

## Запуск

```bash
npm i
npm run dev      # Remotion Studio — превью и правки в браузере
npm run render   # готовый ролик в out/reels.mp4
```

## Как править

- **Тексты** — прямо в `ReelsVideo.tsx` (пункты) и в файлах сцен (хук, CTA).
- **Длительность сцены** — `durationInFrames` у `TransitionSeries.Sequence` (30 кадров = 1 с).
  После изменения пересчитайте `durationInFrames` композиции `Reels` в `Root.tsx`:
  сумма сцен минус 12 кадров на каждый переход.
- **Цвета и размеры** — inline-стили в сценах; их также можно менять мышкой в Studio.
