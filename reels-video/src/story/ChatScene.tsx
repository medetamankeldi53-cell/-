import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Bubble, EpisodeTitle, shake, Stamp, TypingDots } from "./ui";

// Эпизод I: одно слово вместо техзадания
export const ChatScene: React.FC = () => {
  const frame = useCurrentFrame();

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
          Монтаж
        </Bubble>
        <TypingDots from={62} to={88} />
        <Bubble from="claude" at={88}>
          Что именно? 🤔
          <br />
          1. Смонтировать видео
          <br />
          2. Ролик из кода
          <br />
          3. Сценарий
          <br />
          4. Монтаж электрики? ⚡
        </Bubble>
      </AbsoluteFill>
      <Stamp at={125} color="#f3d28b" rotate={-12} size={84}>
        ТЗ: 1 слово 😎
      </Stamp>
      <Sequence durationInFrames={42}>
        <EpisodeTitle episode="ЭПИЗОД I" title="Техзадание" />
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
