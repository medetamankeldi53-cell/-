import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  AbsoluteFill,
  interpolate,
  Interactive,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CtaScene } from "./scenes/CtaScene";
import { HookScene } from "./scenes/HookScene";
import { PointScene } from "./scenes/PointScene";

// Полоска прогресса сверху — удерживает внимание до конца ролика
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <Interactive.Div
      name="Progress bar"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 12,
        backgroundColor: "#ffffff",
        width: interpolate(frame, [0, durationInFrames - 1], ["0%", "100%"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

export const ReelsVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#111018" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={75}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="Point 1" durationInFrames={90}>
          <PointScene
            number={1}
            title="Нет хука"
            text="Первые 2 секунды решают всё. Начинай с вопроса или сильного заявления."
            color="#ff3d6e"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="Point 2" durationInFrames={90}>
          <PointScene
            number={2}
            title="Мелкий текст"
            text="Ролик смотрят с телефона без звука. Крупные субтитры — обязательно."
            color="#ffb627"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="Point 3" durationInFrames={90}>
          <PointScene
            number={3}
            title="Нет призыва"
            text="Скажи зрителю, что делать дальше: сохранить, написать или подписаться."
            color="#00c2a8"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="CTA" durationInFrames={90}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <ProgressBar />
    </AbsoluteFill>
  );
};
