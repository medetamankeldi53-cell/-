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

// «Анашым» — ночная трасса: едва не столкнулся → звонит маме.
// Исходник 1280×720, 24 fps, 30 с. Хук: встречные фары (18–20 с) + сигнал → белая вспышка.
// Звук: музыка и SFX сгенерированы в ElevenLabs (public/drive/music.mp3, horn.mp3, engine.mp3).

export const DRIVE_FPS = 24;
const f = (t: number) => Math.round(t * DRIVE_FPS);
const SRC = "drive/src.mp4";
const GOLD = "#f2c46d";

const HOOK = 2.0; // хук: 18,2–20,2 с исходника
const SRC_LEN = 30.05;
const END = 3.0; // финальная надпись на чёрном
export const DRIVE_DURATION = f(HOOK) + f(SRC_LEN) + f(END);
const at = (t: number) => f(HOOK) + f(t); // кадр для секунды исходника

const LINE_AT = 28.04; // «Анашым…» (файл начинается с 0,16 с тишины)

const Fade: React.FC<{
  children: React.ReactNode;
  inF?: number;
  outF?: number;
}> = ({ children, inF = 6, outF = 6 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = Math.min(
    interpolate(frame, [0, inF], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [durationInFrames - outF, durationInFrames], [1, 0], {
      extrapolateLeft: "clamp",
    }),
  );
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Big: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 80,
}) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: size,
        color: "#fff",
        textAlign: "center",
        lineHeight: 1.15,
        textShadow: "0 4px 24px rgba(0,0,0,0.85)",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// белая вспышка в конце хука
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 3, 10], [0, 1, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: o }} />;
};

export const Drive: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ХУК: встречные фары */}
      <Sequence name="Hook" durationInFrames={f(HOOK)}>
        <Video
          src={staticFile(SRC)}
          trimBefore={f(18.2)}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <Sequence from={f(0.25)}>
          <Fade inF={4} outF={2}>
            <Big>Бір секунд…</Big>
          </Fade>
        </Sequence>
        <Audio src={staticFile("drive/horn.mp3")} volume={0.9} />
      </Sequence>
      <Sequence name="Flash" from={f(HOOK) - 3} durationInFrames={12}>
        <Flash />
      </Sequence>

      {/* Ролик целиком; родной звук тише — под музыку */}
      <Sequence name="Film" from={f(HOOK)} durationInFrames={f(SRC_LEN)}>
        <Video
          src={staticFile(SRC)}
          volume={0.7}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </Sequence>

      {/* Музыка: напряжение → обрыв на столкновении → тёплое фортепиано */}
      <Sequence name="Music" from={f(HOOK)} durationInFrames={f(SRC_LEN + END)}>
        {/* обрыв музыки (24,2 с трека) совпадает со склейкой на красные огни (21,75 с) */}
        <Audio
          src={staticFile("drive/music.mp3")}
          trimBefore={f(2.45)}
          volume={(fr) =>
            interpolate(
              fr,
              [0, f(1), f(27.6), f(28.0), f(29.2), f(29.8)],
              [0, 0.55, 0.55, 0.3, 0.3, 0.6],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ) *
            interpolate(fr, [f(SRC_LEN + END - 1.5), f(SRC_LEN + END)], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>

      {/* SFX */}
      <Sequence name="Engine" from={at(0.2)} durationInFrames={f(6)}>
        <Audio src={staticFile("drive/engine.mp3")} volume={0.45} />
      </Sequence>
      <Sequence name="Heartbeat" from={at(12.8)} durationInFrames={f(5)}>
        <Audio src={staticFile("sfx/heartbeat.wav")} volume={0.5} />
      </Sequence>
      <Sequence name="Horn" from={at(17.0)} durationInFrames={f(4)}>
        <Audio src={staticFile("drive/horn.mp3")} volume={0.9} />
      </Sequence>

      {/* «Анашым…» */}
      <Sequence name="Line" from={at(LINE_AT)}>
        <Audio src={staticFile("drive/line_fx.wav")} volume={1} />
      </Sequence>
      <Sequence name="Sub" from={at(LINE_AT + 0.1)} durationInFrames={f(1.9)}>
        <Fade inF={4} outF={6}>
          <div
            style={{
              position: "absolute",
              bottom: 70,
              width: "100%",
              textAlign: "center",
              fontFamily: "Montserrat",
              fontWeight: 800,
              fontSize: 54,
              color: GOLD,
              textShadow: "0 0 4px #000, 0 3px 14px rgba(0,0,0,0.9)",
            }}
          >
            Анашым…
          </div>
        </Fade>
      </Sequence>

      {/* Финальная надпись */}
      <Sequence name="End" from={at(SRC_LEN)} durationInFrames={f(END)}>
        <Fade inF={10} outF={8}>
          <Big size={64}>
            Бүгін <span style={{ color: GOLD }}>анаңа</span>
            <br />
            қоңырау шал.
          </Big>
        </Fade>
      </Sequence>
    </AbsoluteFill>
  );
};
