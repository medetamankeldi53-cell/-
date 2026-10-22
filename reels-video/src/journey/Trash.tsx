import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { GOLD, Narration } from "./kit";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Высота одного скриншота при ширине 1080
const SHOT_H = 2340;
const SHOTS = [1, 2, 3, 4, 5];

// 6. Корзина телефона: «Изображений: 1247» и бесконечная прокрутка
export const TrashScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Наезд на заголовок «Корзина · Изображений: 1247», затем отъезд
  const zoom = interpolate(frame, [0, 40, 56], [2.3, 2.1, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const counter = Math.floor(
    interpolate(frame, [4, 38], [0, 1247], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    }),
  );
  // Прокрутка галереи, разгоняется
  const scroll = interpolate(
    frame,
    [56, 160],
    [0, SHOT_H * SHOTS.length - 1920],
    { ...clamp, easing: Easing.in(Easing.quad) },
  );
  const speed = interpolate(frame, [56, 160], [0, 14], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(zoom),
          transformOrigin: "25% 9%",
        }}
      >
        <div
          style={{
            translate: `0px ${-scroll}px`,
            filter: `blur(${speed > 4 ? (speed - 4) * 0.6 : 0}px)`,
          }}
        >
          {SHOTS.map((n) => (
            <Img
              key={n}
              src={staticFile(`journey/trash${n}.jpg`)}
              style={{ width: 1080, height: SHOT_H, display: "block" }}
            />
          ))}
        </div>
      </AbsoluteFill>

      {/* Счётчик 1247 */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: `rgba(0,0,0,${interpolate(frame, [0, 6, 44, 56], [0, 0.55, 0.55, 0], clamp)})`,
          opacity: interpolate(frame, [0, 6, 46, 56], [0, 1, 1, 0], clamp),
        }}
      >
        <div
          style={{
            fontFamily: "Montserrat",
            fontSize: 300,
            fontWeight: 900,
            color: GOLD,
            textShadow: `0 0 80px ${GOLD}aa`,
            scale: String(
              interpolate(frame, [38, 42, 50], [1, 1.18, 1], clamp),
            ),
          }}
        >
          {counter}
        </div>
      </AbsoluteFill>

      <Sequence name="Narration 1" durationInFrames={102}>
        <Narration text="*1247* сурет — себетте." />
      </Sequence>
      <Sequence name="Narration 2" from={100} durationInFrames={65}>
        <Narration text="Әрқайсысы — *бір* *әрекет.*" />
      </Sequence>

      <Sequence name="SFX — counter" from={4} durationInFrames={34}>
        <Audio src={staticFile("sfx/type.wav")} loop volume={0.3} />
      </Sequence>
      <Sequence name="SFX — 1247" from={38}>
        <Audio src={staticFile("sfx/boom.wav")} volume={0.6} />
      </Sequence>
      <Sequence name="SFX — scroll" from={60}>
        <Audio src={staticFile("sfx/riser.wav")} volume={0.5} />
      </Sequence>
      <Sequence name="SFX — scroll 2" from={150}>
        <Audio src={staticFile("sfx/whoosh.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
