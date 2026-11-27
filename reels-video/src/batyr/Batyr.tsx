import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

// «Кішкентай батыр» — смешной монтаж домашнего видео (1080×1920, 30 fps).
// Исходник public/batyr/src.mp4 (18 с); смешная часть с 9,5 с. Без наездов — только
// скорость, стоп-кадры, надписи и звук.

export const BATYR_FPS = 30;
const f = (t: number) => Math.round(t * BATYR_FPS);
const SRC = "batyr/src.mp4";
const GOLD = "#f2c46d";

// Отрезки: [начало в исходнике, конец, скорость]
type Seg = { from: number; to: number; rate: number; mute?: boolean };
const SEGS: Seg[] = [
  { from: 9.5, to: 11.6, rate: 1 }, // идёт с «оружием»
  { from: 11.6, to: 12.6, rate: 0.5, mute: true }, // взмах — замедление
  { from: 12.6, to: 16.85, rate: 1 }, // брат тянет палку, не отдаёт
  { from: 16.85, to: 18.1, rate: 1 }, // смеётся, поднял палку
];
const HOOK = 1.4;
const SHOUT = 0; // стоп-кадр убран по просьбе
const segLen = (s: Seg) => (s.to - s.from) / s.rate;
// начало каждого отрезка в ролике
const starts: number[] = [];
{
  let t = HOOK;
  SEGS.forEach((s, i) => {
    if (i === 3) t += SHOUT;
    starts.push(t);
    t += segLen(s);
  });
}
const END_AT = starts[3] + segLen(SEGS[3]);
export const BATYR_DURATION = f(END_AT + 1.3);
// где в ролике оказывается секунда исходника
const at = (t: number) => {
  const i = SEGS.findIndex((s) => t >= s.from && t < s.to);
  return starts[i] + (t - SEGS[i].from) / SEGS[i].rate;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Подпись-комикс: выпрыгивает пружиной, белая с толстой обводкой
const Cap: React.FC<{ children: React.ReactNode; y?: number; size?: number; rot?: number }> = ({
  children,
  y = 240,
  size = 76,
  rot = -3,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 220 } });
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 50,
        right: 50,
        textAlign: "center",
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.1,
        color: "#fff",
        WebkitTextStroke: "10px #111",
        paintOrder: "stroke fill",
        transform: `scale(${s}) rotate(${rot}deg)`,
        opacity: out,
        textShadow: "0 8px 20px rgba(0,0,0,0.45)",
      }}
    >
      {children}
    </div>
  );
};

const Clip: React.FC<{ seg: Seg }> = ({ seg }) => (
  <Video
    src={staticFile(SRC)}
    trimBefore={f(seg.from)}
    playbackRate={seg.rate}
    muted={seg.mute}
    volume={1.6}
    objectFit="cover"
    style={{ width: "100%", height: "100%" }}
  />
);

// Стоп-кадр с лёгкой «дрожью» кадра (без масштабирования)
const Freeze: React.FC<{ img: string; shake?: number }> = ({ img, shake = 0 }) => {
  const frame = useCurrentFrame();
  const k = shake * Math.max(0, 1 - frame / 14);
  return (
    <AbsoluteFill style={{ transform: `translate(${Math.sin(frame * 2.8) * k}px, ${Math.cos(frame * 3.1) * k * 0.6}px)` }}>
      <Img src={staticFile(img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

export const Batyr: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ХУК: стоп-кадр смеющегося «батыра» */}
      <Sequence name="Hook" durationInFrames={f(HOOK)}>
        <Freeze img="batyr/f_17.3.jpg" shake={10} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0) 40%)" }} />
        <Cap y={200} size={78}>
          Үйдегі ең қорқынышты
          <br />
          <span style={{ color: GOLD }}>БАТЫР</span> 😂
        </Cap>
        <Audio src={staticFile("sfx/boom.wav")} volume={0.6} />
      </Sequence>

      {SEGS.map((s, i) => (
        <Sequence key={i} name={`Seg ${s.from}`} from={f(starts[i])} durationInFrames={f(segLen(s))}>
          <Clip seg={s} />
        </Sequence>
      ))}

      {/* Подписи по сюжету */}
      <Sequence from={f(at(9.8))} durationInFrames={f(1.9)}>
        <Cap>Батыр қаруын алды…</Cap>
      </Sequence>
      <Sequence from={f(starts[1])} durationInFrames={f(segLen(SEGS[1]))}>
        <Cap size={110} rot={-6}>
          ⚔️ <span style={{ color: "#7fd3ff" }}>ШЫҢҚ!</span>
        </Cap>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.8} />
        <Sequence from={f(0.9)}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
        </Sequence>
      </Sequence>
      <Sequence from={f(at(13.1))} durationInFrames={f(1.8)}>
        <Cap>Ағасы тартып алмақшы 😳</Cap>
      </Sequence>
      <Sequence from={f(at(15.0))} durationInFrames={f(1.6)}>
        <Cap size={96} rot={3}>
          БЕРМЕЙМІН! 😤
        </Cap>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.5} />
      </Sequence>

      {/* Финал */}
      <Sequence from={f(END_AT - 0.9)}>
        <Cap y={1450} size={72} rot={-2}>
          Кішкентай <span style={{ color: GOLD }}>батыр</span> 👑
        </Cap>
      </Sequence>
      <Sequence from={f(END_AT)}>
        <Freeze img="batyr/f_17.3.jpg" />
        <Cap y={1450} size={72} rot={-2}>
          Кішкентай <span style={{ color: GOLD }}>батыр</span> 👑
        </Cap>
      </Sequence>
    </AbsoluteFill>
  );
};
