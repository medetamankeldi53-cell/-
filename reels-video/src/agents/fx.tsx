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

export const ORANGE = "#ff8a3d";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export type Zoom = { from: number; to: number; x: number; y: number };

// Кадр-картинка: удар-наезд на старте, медленный зум к точке (x, y в %),
// белая вспышка на склейке, тряска по желанию, 8-битный «блип».
export const Shot: React.FC<{
  src: string;
  zoom?: Zoom;
  shake?: boolean;
  glitch?: boolean;
  children?: React.ReactNode;
}> = ({ src, zoom = { from: 1, to: 1.08, x: 50, y: 50 }, shake, glitch, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const punch = interpolate(frame, [0, 6], [1.08, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const z = interpolate(frame, [0, durationInFrames], [zoom.from, zoom.to], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const k = shake ? Math.max(0, 1 - frame / 18) * 26 : 0;
  const sx = shake ? Math.sin(frame * 2.9) * k : 0;
  const sy = shake ? Math.cos(frame * 3.7) * k : 0;
  const gl = glitch && random(`g${Math.floor(frame / 2)}`) > 0.7;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(z * punch),
          transformOrigin: `${zoom.x}% ${zoom.y}%`,
          translate: `${sx}px ${sy}px`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "pixelated",
            filter: gl ? "hue-rotate(160deg) saturate(2)" : undefined,
            translate: gl ? `${(random(`gx${frame}`) - 0.5) * 40}px 0px` : undefined,
          }}
        />
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: "#fff",
          opacity: interpolate(frame, [0, 3], [0.55, 0], clamp),
          pointerEvents: "none",
        }}
      />
      <Audio src={staticFile("sfx/blip.wav")} volume={0.35} />
    </AbsoluteFill>
  );
};

// Наклейка-плашка (как в оригинале: «самозанятый», «агент-юрист»)
export const Sticker: React.FC<{
  x: number;
  y: number;
  rotate?: number;
  delay?: number;
  children: React.ReactNode;
}> = ({ x, y, rotate = -4, delay = 4, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 7], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(2)),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        translate: "-50% -50%",
        rotate: `${rotate}deg`,
        scale: String(p),
        backgroundColor: "#fff",
        border: "6px solid #111",
        boxShadow: "8px 8px 0 #111",
        padding: "10px 22px",
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: 40,
        color: "#111",
        whiteSpace: "nowrap",
        textAlign: "center",
        lineHeight: 1.15,
      }}
    >
      {children}
    </div>
  );
};

// Субтитр: заглавные, белые, ключевые слова — оранжевые, «поп» на появлении
export const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 5], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.8)),
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 560,
        paddingLeft: 70,
        paddingRight: 70,
      }}
    >
      <div
        style={{
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 66,
          lineHeight: 1.15,
          textAlign: "center",
          color: "#fff",
          scale: String(interpolate(p, [0, 1], [0.7, 1])),
          opacity: p,
          textShadow:
            "0 0 2px #000, 4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 8px 24px rgba(0,0,0,0.8)",
        }}
      >
        {text.split(" ").map((w, i) => {
          const accent = w.length > 2 && w.startsWith("*") && w.endsWith("*");
          return (
            <span
              key={i}
              style={{ color: accent ? ORANGE : "#fff", marginRight: "0.25em" }}
            >
              {accent ? w.slice(1, -1) : w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Солнечные лучи (как «агент по найму» в оригинале)
export const Sunburst: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `repeating-conic-gradient(from ${frame * 1.5}deg at 50% 40%, #ff9a4d 0deg 12deg, #ffb877 12deg 24deg)`,
      }}
    />
  );
};
