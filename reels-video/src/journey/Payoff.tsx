import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { shake } from "../story/ui";
import { FlashIn, GOLD, Narration, Photo, PosterCard } from "./kit";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// 9. Итог: «Ең бастысы — уақыт» и постеры
export const PayoffScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence name="Title" durationInFrames={55}>
        <Narration text="Ең бастысы — уақыт." gold size={96} bottom={880} />
      </Sequence>

      <Sequence name="Poster — той" from={55} durationInFrames={45}>
        <PosterCard src="journey/poster-toi.jpg" />
        <FlashIn />
      </Sequence>
      <Sequence name="Poster — киім" from={100} durationInFrames={45}>
        <PosterCard src="journey/poster-kiim.jpg" />
        <FlashIn />
      </Sequence>

      <Sequence name="SFX — title">
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
      <Sequence name="SFX — poster 1" from={55}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
      <Sequence name="SFX — poster 2" from={100}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

// 11. Финал: «Уақыт кетті. Бірақ бекер емес.»
export const FinaleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const slam = interpolate(frame, [50, 57], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: "Montserrat" }}>
      <AbsoluteFill style={{ opacity: 0.3, filter: "blur(4px)" }}>
        <Photo
          src="journey/first.jpg"
          zoom={[1.1, 1.25]}
          pos={["52% 50%", "52% 50%"]}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          translate: shake(frame, 57, 30),
          padding: 90,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#fff",
            opacity: interpolate(frame, [8, 20], [0, 1], clamp),
          }}
        >
          Уақыт кетті.
        </div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            lineHeight: 1.05,
            color: GOLD,
            marginTop: 20,
            textShadow: `0 0 70px ${GOLD}88`,
            opacity: slam,
            scale: String(interpolate(slam, [0, 1], [3, 1])),
          }}
        >
          Бірақ бекер емес.
        </div>
        <div
          style={{
            marginTop: 120,
            fontSize: 46,
            fontWeight: 600,
            letterSpacing: 14,
            color: "#e9e2d4",
            opacity: interpolate(frame, [100, 115], [0, 1], clamp),
          }}
        >
          ЖАЛҒАСЫ БАР…
        </div>
      </AbsoluteFill>

      <Sequence name="SFX — slam" from={55}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
      <Sequence name="SFX — end" from={100}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
