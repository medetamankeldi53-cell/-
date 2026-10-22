import { useT } from "./i18n";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Bubble, EpisodeTitle, shake, Stamp, TypingDots } from "./ui";

// Эпизод I: одно слово вместо техзадания
export const ChatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useT();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #14161f 0%, #0b0c12 100%)",
          fontFamily: "Montserrat",
          justifyContent: "flex-end",
          padding: "200px 80px 220px",
          translate: shake(frame, 125, 36),
        }}
      >
        <Bubble from="user" at={50}>
          {t.brief}
        </Bubble>
        <TypingDots from={62} to={88} />
        <Bubble from="claude" at={88}>
          {t.claudeAsk.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </Bubble>
      </AbsoluteFill>
      <Stamp at={125} color="#f3d28b" rotate={-12} size={t.briefStampSize}>
        {t.briefStamp}
      </Stamp>
      <Sequence durationInFrames={42}>
        <EpisodeTitle episode={t.ep1} title={t.ep1Title} />
      </Sequence>

      <Sequence name="SFX — pop user" from={50}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — typing" from={62} durationInFrames={26}>
        <Audio src={staticFile("sfx/type.wav")} volume={0.5} loop />
      </Sequence>
      <Sequence name="SFX — pop claude" from={88}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — stamp" from={125}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
