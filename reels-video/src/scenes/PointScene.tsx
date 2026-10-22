import {
  AbsoluteFill,
  Easing,
  interpolate,
  Interactive,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

export type PointSceneProps = {
  number: number;
  title: string;
  text: string;
  color: string;
};

// Сцены 2–4 — один пункт списка: номер, заголовок, пояснение
export const PointScene: React.FC<PointSceneProps> = ({
  number,
  title,
  text,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111018",
        justifyContent: "center",
        padding: 100,
        fontFamily: "Montserrat",
      }}
    >
      <Interactive.Div
        name="Point number"
        style={{
          fontSize: 320,
          fontWeight: 900,
          lineHeight: 1,
          color,
          scale: interpolate(frame, [0, 0.5 * fps], [0.4, 1], {
            easing: Easing.spring({ damping: 14 }),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {number}
      </Interactive.Div>
      <Interactive.Div
        name="Point title"
        style={{
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1.1,
          color: "#ffffff",
          marginTop: 24,
          opacity: interpolate(frame, [8, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [8, 8 + 0.5 * fps],
            ["0px 60px", "0px 0px"],
            {
              easing: Easing.spring({ damping: 200 }),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        {title}
      </Interactive.Div>
      <Interactive.Div
        name="Point text"
        style={{
          fontSize: 52,
          fontWeight: 600,
          lineHeight: 1.3,
          color: "rgba(255, 255, 255, 0.75)",
          marginTop: 40,
          opacity: interpolate(frame, [20, 32], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [20, 20 + 0.5 * fps],
            ["0px 40px", "0px 0px"],
            {
              easing: Easing.spring({ damping: 200 }),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        {text}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
