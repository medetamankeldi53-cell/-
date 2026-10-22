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

export const GOLD = "#f3d28b";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Дикторский текст: слова проявляются по одному, в конце строка гаснет
export const Narration: React.FC<{
  text: string;
  bottom?: number;
  size?: number;
  gold?: boolean;
}> = ({ text, bottom = 330, size = 66, gold = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    clamp,
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottom,
        paddingLeft: 90,
        paddingRight: 90,
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: "Montserrat",
          fontSize: size,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          color: gold ? GOLD : "#ffffff",
          textShadow: "0 4px 30px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.6)",
        }}
      >
        {text.split(" ").map((word, i) => {
          const p = interpolate(frame, [i * 4, i * 4 + 10], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                opacity: p,
                translate: `0px ${(1 - p) * 30}px`,
                filter: `blur(${(1 - p) * 8}px)`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Фото на весь кадр с медленным наездом (Ken Burns)
export const Photo: React.FC<{
  src: string;
  zoom?: [number, number];
  pos?: [string, string];
  filter?: string;
}> = ({ src, zoom = [1, 1.12], pos = ["50% 50%", "50% 50%"], filter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const [x1, y1] = pos[0].split(" ").map(parseFloat);
  const [x2, y2] = pos[1].split(" ").map(parseFloat);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${x1 + (x2 - x1) * p}% ${y1 + (y2 - y1) * p}%`,
          scale: String(zoom[0] + (zoom[1] - zoom[0]) * p),
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

// Вспышка в начале кадра
export const FlashIn: React.FC<{ length?: number }> = ({ length = 10 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fff",
        opacity: interpolate(frame, [0, length], [0.9, 0], clamp),
        pointerEvents: "none",
      }}
    />
  );
};

// Глитч: кадр режется на полосы, полосы дёргаются, цвет срывается.
// Глитч активен, пока `active(frame)` возвращает true.
export const Glitch: React.FC<{
  children: React.ReactNode;
  active: (frame: number) => boolean;
}> = ({ children, active }) => {
  const frame = useCurrentFrame();
  const on = active(frame);
  const slices = 9;
  return (
    <AbsoluteFill>
      {new Array(slices).fill(0).map((_, i) => {
        const top = (i / slices) * 100;
        const bottom = 100 - ((i + 1) / slices) * 100;
        const dx = on ? (random(`g${i}-${frame}`) - 0.5) * 160 : 0;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${top}% 0 ${bottom}% 0)`,
              translate: `${dx}px 0px`,
              filter: on
                ? `hue-rotate(${Math.floor(random(`h${frame}`) * 360)}deg) saturate(2.5) contrast(1.4)`
                : undefined,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
      {on ? (
        <AbsoluteFill
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(255,0,60,0.18) 0px, rgba(255,0,60,0.18) 3px, rgba(0,255,255,0.12) 3px, rgba(0,255,255,0.12) 6px)",
            mixBlendMode: "screen",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Ночные часы «ЧЧ:ММ» с мигающим двоеточием
export const Clock: React.FC<{
  minutes: number;
  size?: number;
  color?: string;
}> = ({ minutes, size = 200, color = GOLD }) => {
  const frame = useCurrentFrame();
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'DejaVu Sans Mono', monospace",
        fontSize: size,
        fontWeight: 700,
        color,
        letterSpacing: 4,
        textShadow: `0 0 50px ${color}88`,
      }}
    >
      {hh}
      <span style={{ opacity: frame % 30 < 15 ? 1 : 0.2 }}>:</span>
      {mm}
    </div>
  );
};

// Постер целиком между кинополос: размытый фон + сам постер по центру
export const PosterCard: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(40px) brightness(0.5)",
          scale: "1.2",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          scale: String(
            interpolate(frame, [0, 12], [1.25, 1], {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            }) * interpolate(frame, [12, 90], [1, 1.04], clamp),
          ),
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            height: 1640,
            width: "auto",
            maxWidth: 1000,
            objectFit: "contain",
            boxShadow: "0 30px 90px rgba(0,0,0,0.8)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
