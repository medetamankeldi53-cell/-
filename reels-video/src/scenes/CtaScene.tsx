import {
  AbsoluteFill,
  Easing,
  interpolate,
  Interactive,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

// Финальная сцена — призыв к действию
export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(200deg, #00c2a8 0%, #0057ff 100%)",
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
        fontFamily: "Montserrat",
      }}
    >
      <Interactive.Div
        name="CTA title"
        style={{
          fontSize: 110,
          fontWeight: 900,
          lineHeight: 1.05,
          color: "#ffffff",
          textAlign: "center",
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 0.6 * fps], [0.8, 1], {
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Сохрани, чтобы не потерять
      </Interactive.Div>
      <Interactive.Div
        name="CTA button"
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "#0057ff",
          backgroundColor: "#ffffff",
          padding: "32px 72px",
          borderRadius: 999,
          marginTop: 80,
          opacity: interpolate(frame, [15, 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [15, 15 + 0.5 * fps], [0.5, 1], {
            easing: Easing.spring({ damping: 10 }),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Подписаться ➜
      </Interactive.Div>
    </AbsoluteFill>
  );
};
