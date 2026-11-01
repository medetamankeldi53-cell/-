---
name: video-lesson
description: Тақырып бойынша қазақша видео сабақ жасайды (AI, промпт, нейросеть тақырыптары) — сценарий, ElevenLabs диктор, 2D flat слайдтар және мұғалім Медет, 1080×1920 MP4. Use when the user asks for a video lesson / видео сабақ / видеоурок on a topic.
---

# Видео сабақ агенті

Тақырып → сценарий → дауыс → слайдтар → MP4. Жоба: `reels-video/` (Remotion).

## 1. Сценарий (JSON)

`reels-video/src/lesson/lessons/<id>.json` жаса. `<id>` — латынша қысқа атау (`prompt-101`, `video-prompt`).
Үлгі: `src/lesson/lessons/prompt-101.json`. Типтер: `src/lesson/types.ts`.

Ережелер:
- Тіл — қазақша, қарапайым, «сіз» деп. Аудитория — AI-ды енді үйреніп жүргендер.
- 6–9 слайд, барлығы 45–90 секунд. Әр `narration` 1–3 сөйлем (≈ 6–12 секунд).
- Құрылым: `title` → түсінік (`bullets`) → 3–5 ереже/қадам (`compare`, `prompt`, `steps`) → `quiz` → `summary` (`next` — келесі сабақ).
- Слайдтағы мәтін қысқа (бір жол ≤ 30 таңба), толық түсіндіру — `narration`-да.
- Әр жаңа сабақты `src/Root.tsx`-тегі `Lessons` папкасына `Composition` ретінде тірке (`Lesson-prompt-101` үлгісімен: JSON-ды import етіп, `defaultProps={{ lesson }}`, `calculateMetadata={calculateLessonMetadata}`).

## 2. Дауыс (ElevenLabs)

- Генерация пайдаланушының ElevenLabs кредитін жұмсайды. Алдымен шамамен құнын айт (≈ 1 кредит / таңба) және келісім ал.
- `creative_generate_speech`: `model_id: eleven_v4`, `voice_id: TUQNWEvVPBLzMBSVDPUA` (Alex Bell — пайдаланушының тұрақты дикторы), **`generations_count: 1`** (кредит үнемдеу), `prompt` = слайдтың `narration` мәтіні.
- Әр слайдқа бөлек генерация → `creative_get_flow_run_status` → `content_url`-ды `curl` арқылы `reels-video/public/lessons/<id>/NN.mp3` етіп сақта (`01.mp3`, `02.mp3`, … слайд ретімен).
- «Free generations are busy» қатесі келсе — сол бұрылыста қайта іске қоспа, пайдаланушыға айт; бірнеше минуттан кейін тек қалғандарын жаса.

## 3. Уақыт пен ауыз қимылы

```bash
cd reels-video && node scripts/lesson-audio.mjs <id>
```
Скрипт әр слайдтың ұзақтығын (`durationSec`) және мұғалімнің ауызына арналған дауыс қаттылығын (`mouth`) JSON-ға жазады. Дауысы жоқ слайд 4 секунд үнсіз тұрады.

## 4. Тексеру және рендер

```bash
cd reels-video
npm run lint
npx remotion still Lesson-<id> /tmp/x.png --frame=60 --scale=0.3 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render Lesson-<id> out/lesson-<id>.mp4 --crf=18 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```
Әр слайдтан бір кадр қарап шық: мәтін сыйып тұр ма, тест жауабы көріне ме. Соңында MP4-ті пайдаланушыға жібер, `exports/`-қа көшіріп, коммит пен push жаса.

## Стиль (тема)

JSON-да `"theme": "pixel"` — **әдепкі стиль** (пайдаланушы осыны таңдады): түнгі пиксель кеңсе фоны, 8-биттік панельдер,
төменде RPG диалог терезесі — Медеттің пиксель портреті (дауыспен бірге секіреді) және мәтін машинкадай басылады.
Портрет эмоциясы слайд түріне қарай таңдалады; қажет болса слайдқа `"emotion"` қос:
`hello`, `explain`, `happy`, `surprised`, `shrug`, `sad`, `shout` (кадрлар `public/agents/` ішінде, `src/lesson/pixel.tsx`).
`"theme": "flat"` — 2D flat мұғалім (ескі нұсқа).

## Слайд түрлері

| type | Не көрсетеді |
|---|---|
| `title` | Үлкен тақырып + подзаголовок |
| `bullets` | Тізім, пункттер кезекпен шығады |
| `compare` | ✗ жаман / ✓ жақсы мысал (жаманы сызылады) |
| `prompt` | Терминал терезесінде промпт теріледі |
| `steps` | Нөмірленген қадамдар кезекпен жанады |
| `quiz` | Сұрақ + нұсқалар, `revealAt` уақытында дұрыс жауап |
| `summary` | ✓ қорытынды + келесі сабақ |
