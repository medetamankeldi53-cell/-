import { createContext, useContext } from "react";

export type Lang = "ru" | "kk";

const texts = {
  ru: {
    prologue1: "В мире, где Reels живут 15 секунд…",
    prologue2: "один человек решил смонтировать шедевр",
    director: "Режиссёр",
    ep1: "ЭПИЗОД I",
    ep1Title: "Техзадание",
    brief: "Монтаж",
    claudeAsk: [
      "Что именно? 🤔",
      "1. Смонтировать видео",
      "2. Ролик из кода",
      "3. Сценарий",
      "4. Монтаж электрики? ⚡",
    ],
    briefStamp: "ТЗ: 1 слово 😎",
    briefStampSize: 84,
    ep2: "ЭПИЗОД II",
    ep2Title: "Гит наносит ответный удар",
    accessGiven: "доступ дал, пушь",
    again403: "снова 403 🫠",
    tryIt: "Пробуй",
    ep3: "ЭПИЗОД III",
    ep3Title: "Монтаж",
    caption: "СМОТРИ НА ПИДЖАК 👀",
    clip: (n: string) => `Клип ${n}`,
    merged: ["ОДИН", "РОЛИК"],
    removeText: "Надписи убери",
    oneVideo: "1 и 2 — как 1 ролик",
    zoomAsk: "Бесшовный переход через наезд",
    finaleWith: "С CLAUDE",
    credits: [
      ["Режиссёр", "ты"],
      ["Монтажёр", "Claude"],
      ["Главный злодей", "git push (403)"],
      ["Спецэффекты", "наезд"],
    ] as [string, string][],
    soon: "СКОРО В REELS",
  },
  kk: {
    prologue1: "Reels 15 секунд өмір сүретін әлемде…",
    prologue2: "бір адам шедевр монтаждауды ұйғарды",
    director: "Режиссёр",
    ep1: "I ЭПИЗОД",
    ep1Title: "Тапсырма",
    brief: "Монтаж",
    claudeAsk: [
      "Нақты не керек? 🤔",
      "1. Видео монтаждау",
      "2. Кодтан ролик",
      "3. Сценарий",
      "4. Электр монтажы? ⚡",
    ],
    briefStamp: "Тапсырма: 1 сөз 😎",
    briefStampSize: 64,
    ep2: "II ЭПИЗОД",
    ep2Title: "Гит қарсы соққы береді",
    accessGiven: "рұқсат бердім, пуш жаса",
    again403: "тағы 403 🫠",
    tryIt: "Байқап көр",
    ep3: "III ЭПИЗОД",
    ep3Title: "Монтаж",
    caption: "ПИДЖАККА ҚАРА 👀",
    clip: (n: string) => `${n}-клип`,
    merged: ["БІР", "РОЛИК"],
    removeText: "Жазуларды алып таста",
    oneVideo: "1 мен 2 — бір ролик болсын",
    zoomAsk: "Жақындау арқылы үздіксіз ауысу",
    finaleWith: "CLAUDE-ПЕН",
    credits: [
      ["Режиссёр", "сен"],
      ["Монтажшы", "Claude"],
      ["Басты зұлым", "git push (403)"],
      ["Арнайы эффект", "жақындау"],
    ] as [string, string][],
    soon: "ЖАҚЫНДА REELS-ТЕ",
  },
};

export type Texts = (typeof texts)["ru"];

const LangContext = createContext<Lang>("ru");

export const LangProvider = LangContext.Provider;

// Тексты трейлера на текущем языке
export const useT = (): Texts => texts[useContext(LangContext)];
