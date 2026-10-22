import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Bubble, shake, TypingDots } from "../story/ui";
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
      </AbsoluteFill>

      <Sequence name="SFX — slam" from={55}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

// 12. Аутро без диктора: Claude пишет, что впереди ещё много работы
export const ClaudeOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #14161f 0%, #0b0c12 100%)",
        fontFamily: "Montserrat",
      }}
    >
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 80px 260px",
        }}
      >
        <TypingDots from={4} to={26} />
        <Bubble from="claude" at={26}>
          Алда әлі талай жұмыс бар 💪
        </Bubble>
        <TypingDots from={38} to={54} />
        <Bubble from="claude" at={54}>
          Жалғастырамыз! 🎬
        </Bubble>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 300,
        }}
      >
        <div
          style={{
            fontSize: 50,
            fontWeight: 700,
            letterSpacing: 16,
            color: GOLD,
            textShadow: `0 0 40px ${GOLD}88`,
            opacity: interpolate(frame, [84, 100], [0, 1], clamp),
          }}
        >
          ЖАЛҒАСЫ БАР…
        </div>
      </AbsoluteFill>

      <Sequence name="SFX — typing 1" from={4} durationInFrames={22}>
        <Audio src={staticFile("sfx/type.wav")} volume={0.4} />
      </Sequence>
      <Sequence name="SFX — pop 1" from={26}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — typing 2" from={38} durationInFrames={16}>
        <Audio src={staticFile("sfx/type.wav")} volume={0.4} />
      </Sequence>
      <Sequence name="SFX — pop 2" from={54}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — end" from={84}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
