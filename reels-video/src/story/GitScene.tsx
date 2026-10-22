import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Bubble, Confetti, EpisodeTitle, MONO, shake, Stamp } from "./ui";

type Line = { at: number; text: string; color: string; typeFor?: number };

const lines: Line[] = [
  { at: 48, text: "$ git push", color: "#e9e2d4", typeFor: 12 },
  { at: 66, text: "error: 403 Forbidden", color: "#ff4d5e" },
  { at: 112, text: "$ git push", color: "#e9e2d4", typeFor: 12 },
  { at: 128, text: "error: 403 Forbidden", color: "#ff4d5e" },
  { at: 172, text: "$ git push", color: "#e9e2d4", typeFor: 12 },
  { at: 188, text: "* [new branch] montazh ✓", color: "#3ddc84" },
];

// Эпизод II: git push против режиссёра
export const GitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shakeOffset =
    frame < 128 ? shake(frame, 66, 34) : shake(frame, 128, 46, 18);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #14161f 0%, #0b0c12 100%)",
          fontFamily: "Montserrat",
          padding: "190px 70px 160px",
          translate: shakeOffset,
        }}
      >
        <div
          style={{
            backgroundColor: "#07080c",
            border: "3px solid #2a2d3a",
            borderRadius: 30,
            height: 640,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              padding: "22px 26px",
              backgroundColor: "#1a1c25",
            }}
          >
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: c,
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 44,
              lineHeight: 1.55,
              padding: "24px 34px",
            }}
          >
            {lines
              .filter((l) => frame >= l.at)
              .map((l, i) => {
                const n = l.typeFor
                  ? Math.floor(
                      interpolate(
                        frame,
                        [l.at, l.at + l.typeFor],
                        [0, l.text.length],
                        { extrapolateRight: "clamp" },
                      ),
                    )
                  : l.text.length;
                return (
                  <div key={i} style={{ color: l.color }}>
                    {l.text.slice(0, n)}
                  </div>
                );
              })}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            overflow: "hidden",
          }}
        >
          <Bubble from="user" at={95}>
            доступ дал, пушь
          </Bubble>
          <Bubble from="claude" at={142}>
            снова 403 🫠
          </Bubble>
          <Bubble from="user" at={160}>
            Пробуй
          </Bubble>
        </div>
      </AbsoluteFill>

      <Sequence from={66} durationInFrames={26}>
        <Stamp at={0} color="#ff4d5e" rotate={-10} size={240}>
          403
        </Stamp>
      </Sequence>
      <Sequence from={128} durationInFrames={26}>
        <Stamp at={0} color="#ff4d5e" rotate={9} size={300}>
          403
        </Stamp>
      </Sequence>
      <Sequence from={188}>
        <Confetti at={0} />
        <Stamp at={0} color="#3ddc84" rotate={-6} size={130}>
          Pushed ✓
        </Stamp>
      </Sequence>
      <Sequence durationInFrames={42}>
        <EpisodeTitle episode="ЭПИЗОД II" title="Гит наносит ответный удар" />
      </Sequence>

      <Sequence name="SFX — type 1" from={48} durationInFrames={12}>
        <Audio src={staticFile("sfx/type.wav")} volume={0.5} />
      </Sequence>
      <Sequence name="SFX — 403 #1" from={66}>
        <Audio src={staticFile("sfx/buzz.wav")} />
        <Audio src={staticFile("sfx/boom.wav")} volume={0.7} />
      </Sequence>
      <Sequence name="SFX — pop" from={95}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — type 2" from={112} durationInFrames={12}>
        <Audio src={staticFile("sfx/type.wav")} volume={0.5} />
      </Sequence>
      <Sequence name="SFX — 403 #2" from={128}>
        <Audio src={staticFile("sfx/buzz.wav")} />
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
      <Sequence name="SFX — pop" from={142}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — pop" from={160}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — type 3" from={172} durationInFrames={12}>
        <Audio src={staticFile("sfx/type.wav")} volume={0.5} />
      </Sequence>
      <Sequence name="SFX — success" from={188}>
        <Audio src={staticFile("sfx/chime.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
