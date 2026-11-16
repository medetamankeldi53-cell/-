import { Video } from "@remotion/media";
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
      <Video src={staticFile("tizim/src.mp4")} />
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
