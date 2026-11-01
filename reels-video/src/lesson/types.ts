// Описание видео-урока. Один JSON = один урок (src/lesson/lessons/<id>.json).
// Озвучка: public/lessons/<id>/<NN>.mp3 — по одному файлу на слайд.
// Поля durationSec и mouth заполняет скрипт scripts/lesson-audio.mjs.

export type Slide =
  | { type: "title"; title: string; subtitle?: string }
  | { type: "bullets"; heading: string; items: string[] }
  | {
      type: "compare";
      heading: string;
      bad: { label: string; text: string };
      good: { label: string; text: string };
    }
  | { type: "prompt"; heading: string; lines: string[] }
  | { type: "steps"; heading: string; steps: string[] }
  | {
      type: "quiz";
      question: string;
      options: string[];
      correct: number;
      revealAt?: number; // доля слайда (0..1), когда показать ответ
    }
  | { type: "summary"; heading: string; items: string[]; next?: string };

export type LessonSlide = Slide & {
  narration: string; // текст диктора (по нему генерируется озвучка)
  durationSec?: number; // длительность озвучки + пауза
  mouth?: number[]; // громкость голоса по кадрам (0..1) — для рта учителя
};

export type Lesson = {
  id: string;
  title: string;
  series?: string; // например «AI САБАҚТАРЫ»
  fps?: number;
  slides: LessonSlide[];
};
