import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { AbsoluteFill, Easing, interpolate } from "remotion";

type ZoomThroughProps = Record<string, never>;

// Бесшовный переход «через наезд»: уходящий кадр резко наезжает с размытием,
// входящий стартует с того же наезда и отъезжает к обычному масштабу.
const ZoomThroughPresentation: React.FC<
  TransitionPresentationComponentProps<ZoomThroughProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const exiting = presentationDirection === "exiting";
  // Первая половина: уходящий кадр разгоняется в наезд.
  // Середина: смена кадра на максимальном наезде и размытии.
  // Вторая половина: входящий кадр тормозит, отъезжая к обычному масштабу.
  const scale = exiting
    ? interpolate(presentationProgress, [0, 0.5], [1, 2.6], {
        easing: Easing.in(Easing.cubic),
        extrapolateRight: "clamp",
      })
    : interpolate(presentationProgress, [0.5, 1], [2.6, 1], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: "clamp",
      });
  const blur = exiting
    ? interpolate(presentationProgress, [0, 0.5], [0, 24], {
        easing: Easing.in(Easing.cubic),
        extrapolateRight: "clamp",
      })
    : interpolate(presentationProgress, [0.5, 1], [24, 0], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: "clamp",
      });
  const opacity = exiting
    ? 1
    : interpolate(presentationProgress, [0.45, 0.55], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return (
    <AbsoluteFill
      style={{
        scale: String(scale),
        filter: `blur(${blur}px)`,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const zoomThrough = (): TransitionPresentation<ZoomThroughProps> => ({
  component: ZoomThroughPresentation,
  props: {},
});
