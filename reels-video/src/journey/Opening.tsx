import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Clock, Narration, Photo } from "./kit";

// 1. Ночь: часы 02:47, все спят
export const NightScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #0d1426 0%, #000000 65%)",
        alignItems: "center",
        paddingTop: 640,
      }}
    >
      <div
        style={{
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Clock minutes={2 * 60 + 47} size={220} />
      </div>
      <Sequence name="Narration" from={22} durationInFrames={65}>
        <Narration text="Түн. Бәрі ұйқыда." />
      </Sequence>
      <Audio src={staticFile("sfx/tick.wav")} loop volume={0.7} />
    </AbsoluteFill>
  );
};

// 2. Первое фото: свет загорается, камера едет от мужчины к ребёнку
export const FirstPhotoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const dark =
    frame < 24
      ? frame < 6
        ? 1
        : random(`flicker-${frame}`) > 0.5
          ? 0.85
          : 0.15
      : 0;
  return (
    <AbsoluteFill>
      <Photo
        src="journey/first.jpg"
        zoom={[1.05, 1.22]}
        pos={["33% 45%", "62% 45%"]}
      />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: dark }} />
      <Sequence name="Narration" from={32} durationInFrames={90}>
        <Narration text="Барлығы бір суреттен басталды." />
      </Sequence>
      <Sequence name="SFX — light on" from={22}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
