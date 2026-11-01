import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp } from "../flat/characters";
import { T } from "./slides";
import { Emotion, Slide } from "./types";

// Портреты Медета из пиксельных кадров «Агенттер»: файл + где лицо (доли кадра) и его ширина
const PORTRAITS: Record<
  Emotion,
  { src: string; x: number; y: number; w: number }
> = {
  hello: { src: "agents/04.jpg", x: 0.62, y: 0.4, w: 0.15 },
  explain: { src: "agents/13.jpg", x: 0.33, y: 0.38, w: 0.14 },
  happy: { src: "agents/27.jpg", x: 0.51, y: 0.33, w: 0.32 },
  surprised: { src: "agents/27.jpg", x: 0.51, y: 0.33, w: 0.32 },
  shrug: { src: "agents/15.jpg", x: 0.52, y: 0.46, w: 0.38 },
  sad: { src: "agents/21.jpg", x: 0.58, y: 0.46, w: 0.15 },
  shout: { src: "agents/18.jpg", x: 0.46, y: 0.32, w: 0.4 },
};

export const defaultEmotion = (s: Slide): Emotion =>
  ({
    title: "surprised",
    bullets: "explain",
    compare: "surprised",
    prompt: "explain",
    steps: "explain",
    quiz: "hello",
    summary: "hello",
  })[s.type] as Emotion;

// Фон: ночной пиксельный офис, притемнённый, чтобы читались панели
export const PixelBackground: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Img
        src={staticFile("agents/20.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          imageRendering: "pixelated",
          filter: "brightness(0.38) saturate(1.1)",
          scale: String(1.05 + Math.sin(frame / 120) * 0.02),
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
        }}
      />
    </AbsoluteFill>
  );
};

const SIZE = 280;

// Портрет: пикселизованный кроп лица, «подпрыгивает» в такт голосу
const Portrait: React.FC<{ emotion: Emotion; level: number }> = ({
  emotion,
  level,
}) => {
  const p = PORTRAITS[emotion];
  const wd = (SIZE * 0.6) / p.w;
  const hd = (wd * 1376) / 768;
  return (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        overflow: "hidden",
        position: "relative",
        border: `8px solid ${T.gold}`,
        boxShadow: "10px 10px 0 #000",
        backgroundColor: "#000",
        flex: `0 0 ${SIZE}px`,
        translate: `0px ${-level * 10}px`,
      }}
    >
      <Img
        src={staticFile(p.src)}
        style={{
          position: "absolute",
          width: wd,
          height: hd,
          left: SIZE / 2 - p.x * wd,
          top: SIZE / 2 - p.y * hd,
          imageRendering: "pixelated",
          scale: String(1 + level * 0.04),
        }}
      />
    </div>
  );
};

// RPG-диалог: портрет + имя + текущее предложение с эффектом печатной машинки
export const Dialogue: React.FC<{
  text: string;
  emotion: Emotion;
  mouth: number[];
}> = ({ text, emotion, mouth }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const sentences = text
    .match(/[^.!?…]+[.!?…]*/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? [text];
  const speak = durationInFrames - 0.6 * fps;
  const total = sentences.reduce((a, s) => a + s.length, 0);
  let acc = 0;
  let cur = sentences[sentences.length - 1];
  let from = 0;
  let to = speak;
  for (const s of sentences) {
    const a = (acc / total) * speak;
    acc += s.length;
    const b = (acc / total) * speak;
    if (frame < b) {
      cur = s;
      from = a;
      to = b;
      break;
    }
  }
  const typed = Math.ceil(
    interpolate(
      frame,
      [from, from + (to - from) * 0.6],
      [0, cur.length],
      clamp,
    ),
  );
  const level = mouth[frame] ?? 0;
  const p = interpolate(frame, [0, 8], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.4)),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        bottom: 90,
        display: "flex",
        gap: 28,
        alignItems: "flex-end",
        opacity: p,
        translate: `0px ${(1 - p) * 40}px`,
      }}
    >
      <Portrait emotion={emotion} level={level} />
      <div
        style={{
          flex: 1,
          minHeight: SIZE - 20,
          backgroundColor: "#0d1030",
          border: `8px solid #fff`,
          boxShadow: "10px 10px 0 #000",
          padding: "20px 28px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -34,
            left: 20,
            backgroundColor: T.gold,
            color: "#000",
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: 30,
            padding: "4px 18px",
            border: "5px solid #000",
          }}
        >
          МЕДЕТ
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'DejaVu Sans Mono', monospace",
            fontWeight: 700,
            fontSize: 40,
            lineHeight: 1.35,
            color: "#fff",
            marginTop: 10,
          }}
        >
          {cur.slice(0, typed)}
          <span style={{ opacity: frame % 16 < 8 ? 1 : 0, color: T.gold }}>
            ▼
          </span>
        </div>
      </div>
    </div>
  );
};
