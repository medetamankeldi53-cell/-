import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { GOLD } from "./ui";

// Пролог в стиле трейлера: «В мире, где…»
export const Prologue: React.FC = () => {
  const frame = useCurrentFrame();
  const line1 = "В мире, где Reels живут 15 секунд…";
  const typed = Math.floor(
    interpolate(frame, [6, 46], [0, line1.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Montserrat",
        textAlign: "center",
        padding: 110,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${interpolate(frame, [0, 120], [20, 80])}% 40%, rgba(243,210,139,0.18), rgba(0,0,0,0) 55%)`,
        }}
      />
      {frame < 66 ? (
        <div
          style={{
            fontSize: 70,
            fontWeight: 600,
            lineHeight: 1.3,
            color: "#e9e2d4",
            opacity: interpolate(frame, [54, 64], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {line1.slice(0, typed)}
          <span style={{ opacity: frame % 16 < 8 ? 1 : 0, color: GOLD }}>
            |
          </span>
        </div>
      ) : (
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            lineHeight: 1.08,
            color: GOLD,
            textTransform: "uppercase",
            textShadow: "0 0 60px rgba(243,210,139,0.45)",
            opacity: interpolate(frame, [66, 74], [0, 1], {
              extrapolateRight: "clamp",
            }),
            scale: String(interpolate(frame, [66, 120], [1.25, 1])),
          }}
        >
          один человек решил смонтировать шедевр
        </div>
      )}

      <Sequence name="SFX — typing" from={6}>
        <Audio src={staticFile("sfx/type.wav")} volume={0.6} loop />
      </Sequence>
      <Sequence name="SFX — boom" from={66}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
