import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { GOLD } from "../journey/kit";

export const SERIF = "'Cormorant Garamond', serif";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Плёночный засвет: тёплые пятна света проходят через кадр на стыке
export const LightLeak: React.FC<{ length?: number; seed?: string }> = ({
  length = 16,
  seed = "a",
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, length], [0, 1], clamp);
  const o = interpolate(frame, [0, length * 0.3, length], [0, 0.85, 0], clamp);
  const x = -30 + p * 160;
  const y = 20 + random(`ly${seed}`) * 60;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: o,
        background: `radial-gradient(ellipse 60% 45% at ${x}% ${y}%, rgba(255,170,60,0.95), rgba(255,80,20,0.55) 40%, rgba(0,0,0,0) 70%), radial-gradient(ellipse 40% 60% at ${x - 35}% ${100 - y}%, rgba(255,220,150,0.7), rgba(0,0,0,0) 65%)`,
      }}
    />
  );
};

// Архивное фото как отпечаток, который «падает на стол»:
// влетает с поворотом и размытием, приземляется с глухим звуком.
// Маленькие сканы не растягиваются на весь кадр — фон из того же фото, размытый.
export const ArchivePrint: React.FC<{
  src: string;
  ratio: number; // ширина / высота
  caption: string;
  rotate?: number;
  bw?: boolean;
  overlay?: React.ReactNode;
  silent?: boolean;
}> = ({ src, ratio, caption, rotate = 0, bw = false, overlay, silent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const maxW = 900;
  const maxH = 1000;
  const w = Math.min(maxW, maxH * ratio);
  const h = w / ratio;
  const drop = interpolate(frame, [0, 9], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.3)),
  });
  const blur = interpolate(frame, [0, 7], [10, 0], clamp);
  const spin = rotate + (rotate >= 0 ? 9 : -9) * (1 - drop);
  // медленный «наезд камеры» на фото после приземления
  const zoom = interpolate(frame, [8, durationInFrames], [1, 1.12], clamp);
  const bgShift = interpolate(frame, [0, durationInFrames], [0, -40], clamp);
  const tone = bw
    ? "sepia(0.45) contrast(1.08)"
    : "saturate(0.9) contrast(1.05)";
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0906" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `blur(46px) brightness(0.35) ${tone}`,
          scale: "1.3",
          translate: `${bgShift}px 0px`,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 220 }}>
        <div style={{ height: maxH, display: "flex", alignItems: "center" }}>
          <div
            style={{
              padding: 16,
              backgroundColor: "#efe6d2",
              boxShadow: `0 ${interpolate(drop, [0, 1], [90, 30])}px ${interpolate(drop, [0, 1], [140, 80])}px rgba(0,0,0,0.78)`,
              rotate: `${spin}deg`,
              opacity: interpolate(frame, [0, 3], [0, 1], clamp),
              scale: String(interpolate(drop, [0, 1], [1.45, 1])),
              translate: `0px ${(1 - drop) * -90}px`,
              filter: `blur(${blur}px)`,
            }}
          >
            <div
              style={{
                width: w,
                height: h,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Img
                src={staticFile(src)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  scale: String(zoom),
                  filter: tone,
                }}
              />
              {overlay}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 40,
            fontWeight: 500,
            color: "#d9d2c3",
            opacity: interpolate(frame, [12, 24], [0, 0.9], clamp),
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>
      {silent ? null : <Audio src={staticFile("sfx/thud.wav")} volume={0.8} />}
    </AbsoluteFill>
  );
};

// Одна цифра «механического счётчика»: прокручивается от from до to
const RollingDigit: React.FC<{ from: number; to: number; delay: number }> = ({
  from,
  to,
  delay,
}) => {
  const frame = useCurrentFrame();
  const steps = (to - from + 10) % 10;
  const digits = new Array(steps + 1).fill(0).map((_, i) => (from + i) % 10);
  const p = interpolate(frame, [delay, delay + 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ height: 300, overflow: "hidden" }}>
      <div style={{ translate: `0px ${-p * steps * 300}px` }}>
        {digits.map((d, i) => (
          <div key={i} style={{ height: 300, lineHeight: "300px" }}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

// Карточка года: цифры прокручиваются от прошлого года к новому, затем слово главы
export const YearCard: React.FC<{
  year: string;
  word: string;
  from: string;
}> = ({ year, word, from }) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [0, 6], [0, 1], clamp);
  const wordIn = interpolate(frame, [18, 28], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.6)),
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07070a",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: SERIF,
          fontVariantNumeric: "lining-nums",
          fontFeatureSettings: '"lnum" 1',
          fontSize: 300,
          fontWeight: 700,
          color: "#f4efe4",
          opacity: appear,
          textShadow: "0 0 60px rgba(244,239,228,0.25)",
          scale: String(interpolate(frame, [0, 60], [1.08, 1], clamp)),
        }}
      >
        {year.split("").map((d, i) => (
          <RollingDigit
            key={i}
            from={Number(from[i])}
            to={Number(d)}
            delay={2 + i * 2}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: SERIF,
          fontSize: 110,
          fontWeight: 700,
          letterSpacing: 8,
          color: GOLD,
          opacity: wordIn,
          scale: String(interpolate(wordIn, [0, 1], [1.6, 1])),
          textShadow: `0 0 50px ${GOLD}66`,
        }}
      >
        {word}
      </div>
      <LightLeak seed={year} />
      <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};

// Красные пятна восстания расползаются по карте, точки пульсируют
export const InkSpread: React.FC = () => {
  const frame = useCurrentFrame();
  const spots = [
    [0.62, 0.72, 0],
    [0.38, 0.6, 10],
    [0.75, 0.45, 18],
    [0.5, 0.82, 26],
    [0.28, 0.38, 34],
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {spots.map(([x, y, at], i) => {
        const r = interpolate(frame, [at + 6, at + 50], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        const pulse = 1 + 0.25 * Math.sin((frame - at) / 4);
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: 420 * r,
                height: 360 * r,
                translate: "-50% -50%",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(190,20,20,0.55), rgba(190,20,20,0.25) 55%, rgba(190,20,20,0) 72%)",
                mixBlendMode: "multiply",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: 18,
                height: 18,
                translate: "-50% -50%",
                borderRadius: 9,
                backgroundColor: "#e01b1b",
                opacity: r > 0 ? 1 : 0,
                scale: String(pulse),
                boxShadow: "0 0 18px #ff2a2a",
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Вспышка-монтаж: архивные кадры сменяются в ритме, каждый — щелчок затвора
export const FlashMontage: React.FC<{ shots: string[]; frames: number[] }> = ({
  shots,
  frames,
}) => {
  const frame = useCurrentFrame();
  let start = 0;
  let idx = shots.length - 1;
  for (let i = 0; i < frames.length; i++) {
    if (frame < start + frames[i]) {
      idx = i;
      break;
    }
    start += frames[i];
  }
  const local = frame - start;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Img
        src={staticFile(shots[idx])}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "grayscale(0.6) sepia(0.4) contrast(1.25) brightness(0.85)",
          scale: String(1.15 - local * 0.02),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: "#fff",
          opacity: interpolate(local, [0, 2], [0.55, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

// Мерцание старой плёнки и пылинки поверх всего ролика
export const FilmFlicker: React.FC = () => {
  const frame = useCurrentFrame();
  const flick = 0.05 + random(`fl${frame}`) * 0.07;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: flick }} />
      {new Array(6).fill(0).map((_, i) => {
        const show = random(`ds${frame}-${i}`) > 0.6;
        if (!show) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`dx${frame}-${i}`) * 1080,
              top: random(`dy${frame}-${i}`) * 1920,
              width: 2 + random(`dw${frame}-${i}`) * 5,
              height: 2 + random(`dh${frame}-${i}`) * 9,
              borderRadius: 4,
              backgroundColor: "rgba(240,230,210,0.55)",
            }}
          />
        );
      })}
      {random(`sc${Math.floor(frame / 3)}`) > 0.7 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: random(`sx${Math.floor(frame / 3)}`) * 1080,
            width: 2,
            backgroundColor: "rgba(240,230,210,0.25)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Кинокадр (не архив): камера проезжает по широкому кадру слева направо.
// Подпись честно помечает кадр как AI, чтобы его не путали с архивными фото.
export const FilmPan: React.FC<{ src: string; caption: string }> = ({
  src,
  caption,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${5 + p * 90}% 50%`,
          scale: String(
            interpolate(frame, [0, durationInFrames], [1.12, 1.04]),
          ),
          filter: "contrast(1.05) saturate(0.95)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 36,
          fontWeight: 500,
          color: "#e6dfd0",
          opacity: interpolate(frame, [8, 20], [0, 0.9], clamp),
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
        }}
      >
        {caption}
      </div>
      <LightLeak seed="pan" length={14} />
    </AbsoluteFill>
  );
};
