import { Audio, Video } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { zoomThrough } from "./zoomThrough";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Interactive,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Монтаж из двух клипов «прошли мимо — поменялись одеждой».
// 30 fps. Таймлайн (абсолютные кадры):
//   0–60     хук 2 с: момент подмены из клипа 2, подмена на кадре 38
//   54–245   клип 1: ускорение → slow-mo на подмене (кадр ~155) → реальная скорость
//   231–418  клип 2: ускорение → slow-mo на подмене (кадр ~318) → реальная скорость
// Переходы: вспышка 6 кадров (хук → клип 1); бесшовный наезд 14 кадров
// (клип 1 → клип 2), чтобы оба клипа смотрелись как одно видео.

// Вспышка белым — на подменах и склейках
const Flash: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Flash"
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#ffffff",
        opacity: interpolate(frame, [0, 2, 10], [0, 0.85, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

// Хук: подмена из клипа 2 с наездом камеры
const Hook: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Interactive.Div
        name="Hook zoom"
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(frame, [0, 37, 44, 60], [1.15, 1.3, 1.5, 1.42], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 60], ["0px 0px", "0px 140px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Video
          name="Hook — clip 2"
          src={staticFile("clips/swap-2.mp4")}
          trimBefore={60}
          playbackRate={0.8}
          volume={0.5}
          objectFit="cover"
          style={{
            width: "100%",
            height: "100%",
            filter: "contrast(1.1) saturate(1.2)",
          }}
        />
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// Клип с наездом камеры на slow-mo
const SlowMoClip: React.FC<{ src: string; trimBefore: number }> = ({
  src,
  trimBefore,
}) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Slow-mo zoom"
      style={{
        position: "absolute",
        inset: 0,
        scale: interpolate(frame, [0, 60], [1, 1.35], {
          easing: Easing.inOut(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 60], ["0px 0px", "0px 220px"], {
          easing: Easing.inOut(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <Video
        src={staticFile(src)}
        trimBefore={trimBefore}
        playbackRate={0.4}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          filter: "contrast(1.1) saturate(1.2)",
        }}
      />
    </Interactive.Div>
  );
};

export const Montage: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <TransitionSeries name="Video timeline">
        <TransitionSeries.Sequence name="Hook" durationInFrames={60}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 6 })}
        />
        <TransitionSeries.Sequence name="Clip 1 — fast" durationInFrames={68}>
          <Video
            src={staticFile("clips/swap-1.mp4")}
            trimBefore={0}
            playbackRate={1.5}
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
              filter: "contrast(1.1) saturate(1.2)",
            }}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence
          name="Clip 1 — slow-mo"
          durationInFrames={75}
        >
          <SlowMoClip src="clips/swap-1.mp4" trimBefore={102} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Clip 1 — real" durationInFrames={48}>
          <Video
            src={staticFile("clips/swap-1.mp4")}
            trimBefore={132}
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
              filter: "contrast(1.1) saturate(1.2)",
            }}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={zoomThrough()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence name="Clip 2 — fast" durationInFrames={52}>
          <Video
            src={staticFile("clips/swap-2.mp4")}
            trimBefore={0}
            playbackRate={1.5}
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
              filter: "contrast(1.1) saturate(1.2)",
            }}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence
          name="Clip 2 — slow-mo"
          durationInFrames={60}
        >
          <SlowMoClip src="clips/swap-2.mp4" trimBefore={78} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="Clip 2 — real" durationInFrames={75}>
          <Video
            src={staticFile("clips/swap-2.mp4")}
            trimBefore={102}
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
              filter: "contrast(1.1) saturate(1.2)",
            }}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Вспышки на подменах */}
      <Sequence name="Flash — hook swap" from={37} durationInFrames={12}>
        <Flash />
      </Sequence>
      <Sequence name="Flash — clip 1 swap" from={154} durationInFrames={12}>
        <Flash />
      </Sequence>
      <Sequence name="Flash — clip 2 swap" from={317} durationInFrames={12}>
        <Flash />
      </Sequence>

      {/* Звук */}
      <Sequence name="SFX — boom hook" from={37}>
        <Audio src={staticFile("sfx/boom.wav")} volume={0.9} />
      </Sequence>
      <Sequence name="SFX — whoosh to clip 1" from={44}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.7} />
      </Sequence>
      <Sequence name="SFX — boom clip 1" from={154}>
        <Audio src={staticFile("sfx/boom.wav")} volume={0.9} />
      </Sequence>
      <Sequence name="SFX — whoosh zoom" from={231}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
      </Sequence>
      <Sequence name="SFX — boom clip 2" from={317}>
        <Audio src={staticFile("sfx/boom.wav")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};
