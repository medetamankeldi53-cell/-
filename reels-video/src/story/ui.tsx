import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

export const GOLD = "#f3d28b";
export const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";

// Пружинка появления: 0 → 1 начиная с кадра `at`
export const usePop = (at: number, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping } });
};

// Тряска камеры после удара на кадре `at`
export const shake = (frame: number, at: number, amp = 28, dur = 14) => {
  const t = frame - at;
  if (t < 0 || t > dur) return "0px 0px";
  const k = amp * (1 - t / dur);
  return `${Math.sin(t * 2.7) * k}px ${Math.cos(t * 3.3) * k}px`;
};

// Заголовок эпизода в стиле трейлера
export const EpisodeTitle: React.FC<{ episode: string; title: string }> = ({
  episode,
  title,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, 34, 42], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        opacity,
        fontFamily: "Montserrat",
        textAlign: "center",
        padding: 100,
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 600,
          letterSpacing: 18,
          color: GOLD,
          marginBottom: 30,
        }}
      >
        {episode}
      </div>
      <div
        style={{
          fontSize: 92,
          fontWeight: 900,
          lineHeight: 1.05,
          color: "#fff",
          textTransform: "uppercase",
          scale: String(interpolate(frame, [0, 42], [1.08, 1])),
        }}
      >
        {title}
      </div>
    </AbsoluteFill>
  );
};

// Сообщение в чате
export const Bubble: React.FC<{
  from: "user" | "claude";
  at: number;
  children: React.ReactNode;
}> = ({ from, at, children }) => {
  const frame = useCurrentFrame();
  const p = usePop(at, 13);
  if (frame < at) return null;
  const user = from === "user";
  return (
    <div
      style={{
        alignSelf: user ? "flex-end" : "flex-start",
        maxWidth: 760,
        marginTop: 26,
        scale: String(interpolate(p, [0, 1], [0.6, 1])),
        opacity: p,
        transformOrigin: user ? "right bottom" : "left bottom",
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 600,
          color: user ? "#8fd3ff" : GOLD,
          textAlign: user ? "right" : "left",
          marginBottom: 8,
          padding: "0 12px",
        }}
      >
        {user ? "Режиссёр" : "Claude"}
      </div>
      <div
        style={{
          fontSize: 50,
          fontWeight: 600,
          lineHeight: 1.3,
          color: user ? "#fff" : "#1b1712",
          backgroundColor: user ? "#2f6bff" : "#f4ead7",
          padding: "26px 36px",
          borderRadius: 40,
          borderBottomRightRadius: user ? 10 : 40,
          borderBottomLeftRadius: user ? 40 : 10,
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// «Claude печатает…»
export const TypingDots: React.FC<{ from: number; to: number }> = ({
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <div
      style={{
        alignSelf: "flex-start",
        marginTop: 26,
        backgroundColor: "#f4ead7",
        borderRadius: 40,
        padding: "30px 40px",
        display: "flex",
        gap: 16,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "#8a7f6c",
            translate: `0px ${Math.sin((frame - i * 4) / 3) * 8}px`,
          }}
        />
      ))}
    </div>
  );
};

// Штамп, который с размаху «падает» на экран
export const Stamp: React.FC<{
  at: number;
  color: string;
  rotate: number;
  size?: number;
  children: React.ReactNode;
}> = ({ at, color, rotate, size = 150, children }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = interpolate(frame - at, [0, 6], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontFamily: "Montserrat",
          fontSize: size,
          fontWeight: 900,
          color,
          border: `14px solid ${color}`,
          borderRadius: 30,
          padding: "10px 50px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          rotate: `${rotate}deg`,
          scale: String(interpolate(p, [0, 1], [3, 1])),
          opacity: p,
          backgroundColor: "rgba(0,0,0,0.25)",
          textShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// Конфетти — детерминированные частицы
export const Confetti: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const colors = ["#f3d28b", "#2f6bff", "#ff3d6e", "#00c2a8", "#ffffff"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(70).fill(0).map((_, i) => {
        const angle = random(`a${i}`) * Math.PI * 2;
        const speed = 18 + random(`s${i}`) * 34;
        const x = 540 + Math.cos(angle) * speed * t;
        const y = 900 + Math.sin(angle) * speed * t + 1.4 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 18,
              height: 30,
              borderRadius: 4,
              backgroundColor: colors[i % colors.length],
              rotate: `${t * (10 + random(`r${i}`) * 30)}deg`,
              opacity: interpolate(t, [30, 50], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Киношная обёртка: плёночное зерно, виньетка, чёрные полосы
export const CinemaLook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", opacity: 0.13, mixBlendMode: "overlay" }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed={frame % 12}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          backgroundColor: "#000",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          backgroundColor: "#000",
        }}
      />
    </AbsoluteFill>
  );
};
