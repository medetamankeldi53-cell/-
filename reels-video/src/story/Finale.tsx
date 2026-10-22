import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { GOLD, shake } from "./ui";

const credits: [string, string][] = [
  ["Режиссёр", "ты"],
  ["Монтажёр", "Claude"],
  ["Главный злодей", "git push (403)"],
  ["Спецэффекты", "наезд"],
];

// Финальные титры
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const slam = (at: number) =>
    interpolate(frame, [at, at + 7], [0, 1], {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        fontFamily: "Montserrat",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        translate: shake(frame, 15, 30),
      }}
    >
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, rgba(0,0,0,0) ${interpolate(frame, [10, 60], [-30, 110])}%, rgba(243,210,139,0.22) ${interpolate(frame, [10, 60], [-20, 120])}%, rgba(0,0,0,0) ${interpolate(frame, [10, 60], [-10, 130])}%)`,
        }}
      />
      <div
        style={{
          fontSize: 150,
          fontWeight: 900,
          lineHeight: 1,
          color: GOLD,
          letterSpacing: 6,
          textShadow: "0 0 70px rgba(243,210,139,0.5)",
          opacity: slam(8),
          scale: String(interpolate(slam(8), [0, 1], [3, 1])),
        }}
      >
        МОНТАЖ
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: "#fff",
          marginTop: 10,
          opacity: slam(15),
          scale: String(interpolate(slam(15), [0, 1], [3, 1])),
        }}
      >
        С CLAUDE
      </div>

      <div style={{ marginTop: 90 }}>
        {credits.map(([role, name], i) => (
          <div
            key={role}
            style={{
              fontSize: 46,
              lineHeight: 1.6,
              color: "#e9e2d4",
              opacity: interpolate(frame, [45 + i * 10, 55 + i * 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: `0px ${interpolate(frame, [45 + i * 10, 55 + i * 10], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
            }}
          >
            <span style={{ fontWeight: 600, color: "#9a917f" }}>{role} — </span>
            <span style={{ fontWeight: 800 }}>{name}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 230,
          fontSize: 52,
          fontWeight: 800,
          letterSpacing: 14,
          color: GOLD,
          opacity: interpolate(frame, [100, 112], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        СКОРО В REELS
      </div>

      <Sequence name="SFX — slam 1" from={14}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
      <Sequence name="SFX — slam 2" from={21}>
        <Audio src={staticFile("sfx/boom.wav")} volume={0.6} />
      </Sequence>
      <Sequence name="SFX — tagline" from={100}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
