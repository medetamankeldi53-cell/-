import {
  AbsoluteFill,
  Easing,
  interpolate,
  Interactive,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

// Сцена 1 — хук: зритель должен зацепиться за первые 2 секунды
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #ff3d6e 0%, #7a2cff 100%)",
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
        fontFamily: "Montserrat",
      }}
    >
      <Interactive.Div
        name="Hook label"
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: "#ffffff",
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          padding: "16px 36px",
          borderRadius: 999,
          marginBottom: 48,
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Стоп! Не листай 👇
      </Interactive.Div>
      <Interactive.Div
        name="Hook title"
        style={{
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1.05,
          color: "#ffffff",
          textAlign: "center",
          textTransform: "uppercase",
          scale: interpolate(frame, [4, 4 + 0.6 * fps], [0.6, 1], {
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          opacity: interpolate(frame, [4, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        3 ошибки, которые убивают твои Reels
      </Interactive.Div>
    </AbsoluteFill>
  );
};
