import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { SERIF } from "../witness/parts";

// «1916. Тізім» — эпизод серии «Уақыт куәлары».
// Исходник: 1280×720, 24 fps, 59,2 с, 12 кадров. Пока звук оригинальный;
// новые реплики (ElevenLabs) и диктор лягут поверх, когда придут файлы.

export const TIZIM_FPS = 24;
export const TIZIM_DURATION = Math.floor(59.16 * TIZIM_FPS);
const f = (t: number) => Math.round(t * TIZIM_FPS);
const GOLD = "#e8c27a";

// Поясняющие надписи: [начало, конец, крупно, мелко]
const CAPTIONS: [number, number, string, string][] = [
  [0.5, 4.7, "1916 жыл, маусым", "Қазақ даласы"],
  [5.2, 9.6, "Патша жарлығы", "19–43 жастағы қазақ жігіттері мардікерлікке алынады"],
  [10.1, 14.6, "Тізім жазылуда", "Байлар ұлдарын тізімнен сызғызуға тырысты"],
  [29.5, 34.0, "Жігіттер аттанды", "Тізімге ілінгендер ауылдан кетті"],
  [54.4, 57.2, "Торғай, 1916", "Амангелді Иманов бастаған көтеріліс"],
];

// Новые реплики (A*m.wav — подогнаны под звук видео скриптом scripts/tizim-match.py): [файл, начало в файле, конец в файле, куда ставим (с), громкость]
// Длинные фразы разрезаны по паузе, чтобы лечь в ритм оригинала.
const LINES: [string, number, number, number, number][] = [
  ["A1m", 0.15, 1.22, 1.9, 1], // Ағай: Мына жігіт…
  ["A1m", 1.45, 2.7, 3.2, 1], // …газет оқыған жігіт қой!
  ["A2m", 0, 1.03, 7.25, 1], // Жарлық шықты.
  ["A2m", 1.33, 2.4, 8.45, 1], // Мардікерге алады.
  ["A3m", 0, 1.6, 12.2, 1], // Бай (сыбырлап): Менің ұлымды жазба.
  ["A4m", 0.18, 1.54, 15.7, 1], // Анасы: Барма, балам…
  ["A4m", 2.19, 4.14, 17.6, 1], // …Сен кетсең, біз қайтеміз?
  ["A5m", 0.1, 0.68, 21.4, 1], // Жігіт: Апа,
  ["A5m", 0.93, 1.97, 22.15, 1], // …мен қайтып келемін.
  ["D1", 0, 3.79, 24.8, 1], // Диктор
  ["B1m", 0.25, 2.82, 29.6, 1], // Ағай (за кадром): Мардікерге кетіп бара ма?
  ["B2m", 0.12, 2.87, 35.5, 1], // Анасы: Жолың болсын, құлыным…
  ["B3m", 0.19, 3.93, 40.4, 1], // Character 1 (за кадром): Жоқ. Торғайға… Амангелдіге.
  // B4 — жиені, оригинальный голос (45,1–48,0 с), не трогаем
  ["B5m", 0.23, 2.45, 51.6, 1], // Анасы: Ағаң қайтады, балам.
  ["B6m", 0.17, 1.1, 56.1, 1], // Character 1: Тізімде…
  ["B6m", 1.58, 2.37, 58.2, 1], // …аталарымыз.
];

// Фон без старой озвучки — public/tizim/bed.wav: исходный звук, где окна старой речи
// (1,8–4,7 / 7,2–9,4 / 10,1–13,8 / 15,9–19,4 / 21,3–23,1 с) заменены степным фоном
// из тихого 6-го кадра (26–29 с, по кругу с кроссфейдами). Собран ffmpeg + numpy.
// Под диктором чуть приглушаем фон
const underNarrator = (t: number) =>
  interpolate(t, [24.6, 24.8, 28.6, 28.9], [1, 0.55, 0.55, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Надпись внизу слева: золотая черта, год/заголовок печатается, подпись проявляется
const Caption: React.FC<{ title: string; sub: string }> = ({ title, sub }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const line = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const chars = Math.floor(
    interpolate(frame, [6, 6 + title.length * 1.6], [0, title.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const subIn = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const out = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 38%)",
        }}
      />
      <div style={{ position: "absolute", left: 64, bottom: 58, right: 64 }}>
        <div
          style={{
            width: 90 * line,
            height: 3,
            background: GOLD,
            marginBottom: 14,
          }}
        />
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 58,
            lineHeight: 1.05,
            color: "#fff",
            textShadow: "0 3px 18px rgba(0,0,0,0.8)",
          }}
        >
          {title.slice(0, chars)}
          <span style={{ opacity: chars < title.length ? 1 : 0, color: GOLD }}>
            |
          </span>
        </div>
        <div
          style={{
            fontFamily: "Montserrat",
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: 1,
            color: "rgba(255,255,255,0.88)",
            marginTop: 10,
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 10}px)`,
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Финальная плашка серии
const SeriesCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(0,0,0,${0.55 * p})`,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: p,
      }}
    >
      <div
        style={{
          fontFamily: "Montserrat",
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: 10,
          color: GOLD,
        }}
      >
        УАҚЫТ КУӘЛАРЫ
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 92,
          color: "#fff",
          marginTop: 6,
        }}
      >
        1916. Тізім
      </div>
    </AbsoluteFill>
  );
};

export const Tizim: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video src={staticFile("tizim/src.mp4")} muted />
      <Audio
        src={staticFile("tizim/bed.wav")}
        volume={(fr) => underNarrator(fr / TIZIM_FPS)}
      />
      {LINES.map(([file, a, b, at, vol]) => (
        <Sequence
          key={`${file}-${a}`}
          name={`${file} @${at}`}
          from={f(at)}
          durationInFrames={f(b) - f(a) + (file.endsWith("m") ? f(0.2) : 0)}
        >
          <Audio
            src={staticFile(`tizim/${file}.${file.endsWith("m") ? "wav" : "mp3"}`)}
            trimBefore={f(a)}
            volume={vol}
          />
        </Sequence>
      ))}
      {CAPTIONS.map(([a, b, title, sub]) => (
        <Sequence
          key={title}
          name={`Cap ${title}`}
          from={f(a)}
          durationInFrames={f(b) - f(a)}
        >
          <Caption title={title} sub={sub} />
        </Sequence>
      ))}
      <Sequence name="Series" from={f(57.2)}>
        <SeriesCard />
      </Sequence>
    </AbsoluteFill>
  );
};
