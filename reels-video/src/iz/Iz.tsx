import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";

// «Із» — хук «оборванная фраза» + субтитры. Исходник 1280×720, 24 fps, 51,7 с.
// Хук: старик в снегу, голос отца «Мен шыңға емес…» обрывается → чёрный кадр, удар, надпись.
// Дальше ролик идёт как есть, ботинки в начале сокращены до 1 с.

export const IZ_FPS = 24;
const f = (t: number) => Math.round(t * IZ_FPS);
const SRC = "iz/src.mp4";
const GOLD = "#f2c46d";

const HOOK_VOICE = 0.3; // когда в хуке звучит «Мен шыңға емес…»
const HOOK_CUT = 1.4; // обрыв на чёрное
const HOOK = 2.7; // длина хука
const TRIM = 2.3; // с какой секунды исходника начинается основной ролик
const SRC_LEN = 51.708;
export const IZ_DURATION = f(HOOK) + f(SRC_LEN - TRIM);

// Субтитры по распознанной речи (секунды исходника); *слово* — золотом
const SUBS: [number, number, string][] = [
  [5.0, 7.7, "Папа, ана жаққа ешкім шықпаған ғой."],
  [7.9, 9.1, "Енді шығады."],
  [23.0, 25.5, "Түс, пап, ұят қой!"],
  [30.2, 33.0, "Пап, сенің жасыңда ешкім өрмелей алмайды."],
  [43.0, 45.2, "Пап, болды енді."],
  [47.6, 49.85, "Мен шыңға емес,"],
  [49.85, 51.7, "Мен шыңға емес, *саған* *жол* *салдым.*"],
];
// глобальный кадр для секунды исходника
const at = (t: number) => f(HOOK) + f(t - TRIM);

const Sub: React.FC<{ text: string; fadeIn: boolean; fadeOut: boolean }> = ({
  text,
  fadeIn,
  fadeOut,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = Math.min(
    fadeIn ? interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }) : 1,
    fadeOut
      ? interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {
          extrapolateLeft: "clamp",
        })
      : 1,
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        right: 160,
        bottom: 90,
        textAlign: "center",
        fontFamily: "Montserrat",
        fontWeight: 800,
        fontSize: 52,
        lineHeight: 1.25,
        color: "#fff",
        opacity: o,
        textShadow:
          "0 0 4px #000, 0 3px 14px rgba(0,0,0,0.9), 2px 2px 0 rgba(0,0,0,0.6)",
      }}
    >
      {text.split(" ").map((w, i) => {
        const m = /^\*(.+)\*$/.exec(w);
        return (
          <span key={i} style={{ color: m ? GOLD : "#fff" }}>
            {m ? m[1] : w}{" "}
          </span>
        );
      })}
    </div>
  );
};

const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [2, 12], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.15,
          color: "#fff",
          opacity: p,
          transform: `translateY(${(1 - p) * 20}px)`,
        }}
      >
        Ол бұл сөзді
        <br />
        <span style={{ color: GOLD }}>40 жылдан</span> кейін айтты.
      </div>
    </AbsoluteFill>
  );
};

export const Iz: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ХУК: старик в снегу, обрывок фразы отца */}
      <Sequence name="Hook: old man" durationInFrames={f(HOOK_CUT)}>
        <Video
          src={staticFile(SRC)}
          trimBefore={f(38.0)}
          playbackRate={0.75}
          volume={0.35}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </Sequence>
      <Sequence
        name="Hook: voice"
        from={f(HOOK_VOICE)}
        durationInFrames={f(HOOK_CUT - HOOK_VOICE)}
      >
        <Audio src={staticFile("iz/hookline.wav")} volume={1.2} />
      </Sequence>
      <Sequence
        name="Hook: title"
        from={f(HOOK_CUT)}
        durationInFrames={f(HOOK - HOOK_CUT)}
      >
        <HookTitle />
        <Audio src={staticFile("sfx/boom.wav")} volume={0.8} />
      </Sequence>

      {/* Основной ролик */}
      <Sequence name="Film" from={f(HOOK)}>
        <Video
          src={staticFile(SRC)}
          trimBefore={f(TRIM)}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </Sequence>

      {SUBS.map(([a, b, text], i) => (
        <Sequence key={i} name={`Sub ${text}`} from={at(a)} durationInFrames={at(b) - at(a)}>
          <Sub
            text={text}
            fadeIn={!text.startsWith("Мен шыңға емес, *")}
            fadeOut={text !== "Мен шыңға емес,"}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
