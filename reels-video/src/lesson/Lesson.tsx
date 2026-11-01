import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { clamp, Medet } from "../flat/characters";
import { POSE } from "../toi/parts";
import { SlideView, T } from "./slides";
import { Lesson as LessonData, LessonSlide } from "./types";

export type LessonProps = { lesson: LessonData };

const slideFrames = (s: LessonSlide, fps: number) =>
  Math.round((s.durationSec ?? 4) * fps);

export const calculateLessonMetadata: CalculateMetadataFunction<
  LessonProps
> = ({ props }) => {
  const fps = props.lesson.fps ?? 30;
  return {
    fps,
    durationInFrames: props.lesson.slides.reduce(
      (a, s) => a + slideFrames(s, fps),
      0,
    ),
  };
};

// Учитель: Медет внизу кадра, рот двигается по громкости озвучки
const Teacher: React.FC<{ mouth: number[] }> = ({ mouth }) => {
  const frame = useCurrentFrame();
  const m = mouth[frame] ?? 0;
  const p = interpolate(frame, [0, 10], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <g transform={`translate(220 ${1800 + (1 - p) * 60}) scale(0.78)`}>
        <Medet
          frame={frame}
          pose={{ ...POSE, mouth: m > 0.12 ? m : 0, lookX: 0.6 }}
        />
      </g>
    </svg>
  );
};

// Подпись: текущее предложение диктора (время делится пропорционально длине)
const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const sentences = text
    .match(/[^.!?…]+[.!?…]*/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? [text];
  const speak = durationInFrames - 0.6 * fps;
  const total = sentences.reduce((a, s) => a + s.length, 0);
  let acc = 0;
  let cur = sentences[sentences.length - 1];
  for (const s of sentences) {
    acc += s.length;
    if (frame < (acc / total) * speak) {
      cur = s;
      break;
    }
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 440,
        right: 50,
        bottom: 170,
        fontFamily: "Montserrat",
        fontWeight: 700,
        fontSize: 38,
        lineHeight: 1.3,
        color: T.text,
        backgroundColor: "rgba(0,0,0,0.45)",
        borderRadius: 24,
        padding: "18px 24px",
      }}
    >
      {cur}
    </div>
  );
};

export const LessonVideo: React.FC<LessonProps> = ({ lesson }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const starts: number[] = [];
  lesson.slides.reduce((a, s) => {
    starts.push(a);
    return a + slideFrames(s, fps);
  }, 0);
  const current = starts.filter((s) => s <= frame).length - 1;

  return (
    <AbsoluteFill style={{ backgroundColor: T.bg }}>
      {/* фон: мягкие пятна */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + Math.sin(frame / 90) * 10}% 20%, #2a3170 0%, rgba(0,0,0,0) 45%), radial-gradient(circle at 85% 80%, #3a2a5f 0%, rgba(0,0,0,0) 40%)`,
        }}
      />
      {/* шапка: серия + прогресс по слайдам */}
      <div style={{ position: "absolute", top: 90, left: 60, right: 60 }}>
        <div
          style={{
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: 8,
            color: T.gold,
          }}
        >
          {lesson.series ?? "САБАҚ"} · {lesson.title.toUpperCase()}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {lesson.slides.map((s, i) => {
            const len = slideFrames(s, fps);
            const fill =
              i < current ? 1 : i > current ? 0 : (frame - starts[i]) / len;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#2e3568",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${fill * 100}%`,
                    height: "100%",
                    backgroundColor: T.gold,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {lesson.slides.map((s, i) => {
        const len = slideFrames(s, fps);
        const file = `lessons/${lesson.id}/${String(i + 1).padStart(2, "0")}.mp3`;
        return (
          <Sequence
            key={i}
            name={`${i + 1}. ${s.type}`}
            from={starts[i]}
            durationInFrames={len}
          >
            <AbsoluteFill
              style={{ padding: "260px 70px 460px", justifyContent: "center" }}
            >
              <SlideView slide={s} />
            </AbsoluteFill>
            <Teacher mouth={s.mouth ?? []} />
            <Caption text={s.narration} />
            {s.mouth && s.mouth.length > 0 ? (
              <Audio src={staticFile(file)} />
            ) : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
