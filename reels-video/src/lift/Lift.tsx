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

// «Лифт» — вирусный перемонтаж ролика про отражение в зеркале.
// Диалог идёт в исходном порядке (текста нет, порядок фраз не трогаем),
// вырезаны паузы, речь ускорена ×1,12, кадр меняется каждые ~2 с.

const FPS = 30;
const RATE = 1.12;
const SRC = "lift/src.mp4";

// Куда наезжает камера (доли кадра) и насколько
type Cam = { x: number; y: number; z: number };
const WIDE: Cam = { x: 0.5, y: 0.45, z: 1.0 };
const MEDET: Cam = { x: 0.45, y: 0.3, z: 1.8 };
const MIRROR: Cam = { x: 0.78, y: 0.4, z: 1.9 };
const MIRROR_LOW: Cam = { x: 0.77, y: 0.72, z: 1.8 };
const GUEST: Cam = { x: 0.13, y: 0.42, z: 1.8 };
const TWIN: Cam = { x: 0.2, y: 0.35, z: 1.7 };

// [начало, конец (секунды исходника), камера]
const SHOTS: [number, number, Cam][] = [
  [0, 3, WIDE], // апа
  [3, 5.5, MIRROR], // отражение ещё сияет
  [5.5, 7.7, WIDE], // входит начальник
  [8.9, 10.3, GUEST],
  [11.1, 13.6, MIRROR], // причёска растрёпана
  [13.6, 17.2, WIDE], // старик в кепке
  [17.2, 19.4, GUEST],
  [19.4, 22.1, MIRROR], // отражение больше не улыбается
  [22.1, 24.6, MEDET], // Медет улыбается в телефон…
  [24.6, 28.2, MIRROR_LOW], // …а отражение оседает на пол
  [28.2, 30.2, WIDE], // входит двойник
  [30.2, 32.2, TWIN],
  [32.2, 33.1, WIDE], // кнопка STOP (крупный план в исходнике)
  [33.1, 35.2, MEDET],
  [36.0, 36.7, TWIN],
  [37.6, 40.0, WIDE],
  [40.0, 42.4, MIRROR], // отражение снова стоит
  [42.4, 44.0, WIDE],
];

const HOOK = 45; // 1,5 с хука в начале
const lens = SHOTS.map(([a, b]) => Math.round(((b - a) / RATE) * FPS));
const starts = lens.map(
  (_, i) => HOOK + lens.slice(0, i).reduce((a, b) => a + b, 0),
);
export const LIFT_DURATION = HOOK + lens.reduce((a, b) => a + b, 0);

// Глобальный кадр ролика, где играет секунда t исходника
const at = (t: number) => {
  const i = SHOTS.findIndex(([a, b]) => t >= a && t < b);
  return starts[i] + Math.round(((t - SHOTS[i][0]) / RATE) * FPS);
};

const Shot: React.FC<{
  from: number;
  cam: Cam;
  muted?: boolean;
  rate?: number;
}> = ({ from, cam, muted, rate = RATE }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // удар-наезд на склейке + медленный дрейф
  const punch = interpolate(frame, [0, 6], [1.06, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const drift = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(cam.z * punch * drift),
          transformOrigin: `${cam.x * 100}% ${cam.y * 100}%`,
        }}
      >
        <Video
          src={staticFile(SRC)}
          trimBefore={Math.round(from * FPS)}
          playbackRate={rate}
          muted={muted}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Крупная надпись по центру, «поп» на появлении
const Title: React.FC<{ text: string; y?: number; size?: number }> = ({
  text,
  y = 260,
  size = 84,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });
  const out = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
    },
  );
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.1,
        color: "#fff",
        opacity: p * out,
        scale: String(interpolate(p, [0, 1], [0.7, 1])),
        textShadow:
          "0 0 3px #000, 5px 5px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000",
      }}
    >
      {text.split(" ").map((w, i) => {
        const m = /^\*(.+)\*([,.!?:…]*)$/.exec(w);
        return (
          <span key={i}>
            {m ? <span style={{ color: "#ffb347" }}>{m[1]}</span> : w}
            {m ? m[2] : null}{" "}
          </span>
        );
      })}
    </div>
  );
};

// Табло лифта: номер этажа растёт с каждым новым гостем
const Floor: React.FC = () => {
  const frame = useCurrentFrame();
  const floors = [at(0), at(5.5), at(14.1), at(28.2)];
  const n = floors.filter((f) => frame >= f).length;
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        right: 50,
        backgroundColor: "rgba(0,0,0,0.75)",
        border: "4px solid #ffb347",
        borderRadius: 14,
        padding: "8px 22px",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 800,
        fontSize: 54,
        color: "#ffb347",
      }}
    >
      ▲ {frame < HOOK ? "?" : n}
    </div>
  );
};

export const Lift: React.FC = () => {
  const frame = useCurrentFrame();
  const endQ = at(40.0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ХУК: Медет улыбается в телефон, а отражение сидит на полу */}
      <Sequence name="Hook" durationInFrames={HOOK}>
        <AbsoluteFill
          style={{
            scale: String(interpolate(frame, [0, HOOK], [1.25, 1.55])),
            transformOrigin: "66% 52%",
          }}
        >
          <Video
            src={staticFile(SRC)}
            trimBefore={Math.round(26.9 * FPS)}
            playbackRate={0.6}
            muted
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </AbsoluteFill>
        <Title text="Сен *күлесің.* Ал ол?.." y={300} size={96} />
      </Sequence>

      {SHOTS.map(([a, , cam], i) => (
        <Sequence
          key={i}
          name={`Shot ${a}s`}
          from={starts[i]}
          durationInFrames={lens[i]}
        >
          <Shot from={a} cam={cam} />
        </Sequence>
      ))}

      {/* Надписи-биты */}
      <Sequence
        name="T: бөлігін"
        from={at(8.9)}
        durationInFrames={at(13.6) - at(8.9)}
      >
        <Title text="Әр адам бір *бөлігін* алып кетеді" />
      </Sequence>
      <Sequence
        name="T: ОЛ"
        from={at(28.2)}
        durationInFrames={at(30.2) - at(28.2)}
      >
        <Title text="Сосын *ОЛ* келді" size={100} />
      </Sequence>
      <Sequence
        name="T: question"
        from={endQ}
        durationInFrames={LIFT_DURATION - endQ}
      >
        <Title
          text="Сенің айнаңдағы адам қазір *қай* *күйде?* 👇"
          size={70}
          y={220}
        />
      </Sequence>
      <Floor />

      {/* Звук */}
      <Sequence>
        <Audio src={staticFile("sfx/boom.wav")} volume={0.7} />
      </Sequence>
      {[at(0), at(5.5), at(14.1), at(28.2)].map((f) => (
        <Sequence key={f} from={f}>
          <Audio src={staticFile("sfx/ding.wav")} volume={0.5} />
        </Sequence>
      ))}
      <Sequence from={at(24.6)} durationInFrames={at(28.2) - at(24.6)}>
        <Audio src={staticFile("sfx/heartbeat.wav")} volume={0.45} />
      </Sequence>
      <Sequence from={at(28.2) - 6}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={at(32.2)}>
        <Audio src={staticFile("sfx/click.wav")} volume={0.8} />
        <Audio src={staticFile("sfx/boom.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={at(37.6)}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
