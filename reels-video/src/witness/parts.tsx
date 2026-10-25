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

// Архивное фото как отпечаток: бумажная рамка, медленный наезд, подпись-источник.
// Маленькие сканы не растягиваются на весь кадр — фон из того же фото, размытый.
export const ArchivePrint: React.FC<{
  src: string;
  ratio: number; // ширина / высота
  caption: string;
  rotate?: number;
  bw?: boolean;
}> = ({ src, ratio, caption, rotate = 0, bw = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const maxW = 900;
  const maxH = 1000;
  const w = Math.min(maxW, maxH * ratio);
  const h = w / ratio;
  const appear = interpolate(frame, [0, 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.1], clamp);
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
          scale: "1.25",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 220 }}>
        <div
          style={{
            height: maxH,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: 16,
              backgroundColor: "#efe6d2",
              boxShadow: "0 30px 80px rgba(0,0,0,0.75)",
              rotate: `${rotate}deg`,
              opacity: appear,
              scale: String(interpolate(appear, [0, 1], [1.08, 1])),
            }}
          >
            <div style={{ width: w, height: h, overflow: "hidden" }}>
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
            opacity: interpolate(frame, [10, 22], [0, 0.9], clamp),
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Карточка года: «1906» и слово главы, с ударом
export const YearCard: React.FC<{ year: string; word: string }> = ({
  year,
  word,
}) => {
  const frame = useCurrentFrame();
  const slam = interpolate(frame, [0, 7], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const wordIn = interpolate(frame, [10, 20], [0, 1], clamp);
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
          fontFamily: SERIF,
          fontSize: 300,
          fontWeight: 700,
          lineHeight: 1,
          color: "#f4efe4",
          opacity: slam,
          scale: String(interpolate(slam, [0, 1], [2.4, 1])),
          textShadow: "0 0 60px rgba(244,239,228,0.25)",
        }}
      >
        {year}
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
          translate: `0px ${(1 - wordIn) * 30}px`,
          textShadow: `0 0 50px ${GOLD}66`,
        }}
      >
        {word}
      </div>
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
