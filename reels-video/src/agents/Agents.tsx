import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ORANGE, Shot, Sticker, Subtitle, Zoom } from "./fx";
import { SUBS } from "./subs";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const AGENTS_DURATION = 2440;

// --- Надписи внутри кадров (координаты — % от картинки) ---

// 01: прогресс-бар загрузки на мониторе
const Loading: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [4, 60], [0, 0.8], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "62.2%",
          top: "48%",
          width: `${16.4 * p}%`,
          height: "1%",
          backgroundColor: ORANGE,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "61.5%",
          top: "43.5%",
          width: "18%",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 26,
          color: "#3a2a1a",
        }}
      >
        ЖҮКТЕЛУДЕ {Math.round(p * 100)}%
      </div>
    </>
  );
};

// 05: табличка музейного экспоната
const Plaque: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: "24.7%",
      top: "65.9%",
      width: "18.3%",
      height: "3.4%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 700,
      fontSize: 19,
      lineHeight: 1.05,
      color: "#3b2508",
      textAlign: "center",
    }}
  >
    <div>XXI ҒАСЫР</div>
    <div>Өзі теретін адам</div>
  </div>
);

// 26: заставка «2 күн бұрын» в рамке
const TwoDaysAgo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: "12%",
        top: "15%",
        width: "76%",
        height: "15%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 800,
        fontSize: 92,
        color: "#f4ead7",
        letterSpacing: 4,
        opacity: interpolate(frame, [3, 8], [0, 1], clamp),
      }}
    >
      2 КҮН БҰРЫН
    </div>
  );
};

// 25: письмо — Медет пытается печатать сам
const Typing: React.FC = () => {
  const frame = useCurrentFrame();
  const text = "Сәлем, Асх";
  const n = Math.floor(interpolate(frame, [10, 50], [0, text.length], clamp));
  return (
    <div
      style={{
        position: "absolute",
        left: "31%",
        top: "47%",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: 26,
        color: "#1a2a55",
      }}
    >
      {text.slice(0, n)}
      <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>
    </div>
  );
};

// 30: значок записи
const Rec: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 150,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 800,
        fontSize: 44,
        color: "#fff",
        textShadow: "3px 3px 0 #000",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "#ff2a2a",
          opacity: frame % 30 < 18 ? 1 : 0.2,
        }}
      />
      REC
    </div>
  );
};

// --- Раскадровка: сцена начинается с фразы p (индекс в SUBS) ---
type Scene = {
  p: number;
  img: string;
  zoom?: Zoom;
  shake?: boolean;
  glitch?: boolean;
  sfx?: string;
  overlay?: React.ReactNode;
};

const Z = (from: number, to: number, x: number, y: number): Zoom => ({
  from,
  to,
  x,
  y,
});

const SCENES: Scene[] = [
  { p: 0, img: "01", zoom: Z(1.05, 1.15, 70, 48), overlay: <Loading /> },
  { p: 1, img: "02", zoom: Z(1, 1.1, 50, 60) },
  { p: 3, img: "03", zoom: Z(1, 1.12, 60, 45) },
  { p: 5, img: "04", zoom: Z(1.05, 1.2, 55, 45) },
  { p: 6, img: "05", zoom: Z(1.1, 1.35, 34, 62), overlay: <Plaque /> },
  { p: 7, img: "06", zoom: Z(1, 1.1, 55, 45) },
  { p: 8, img: "06", zoom: Z(1.25, 1.35, 55, 40), shake: true },
  { p: 9, img: "07", zoom: Z(1.05, 1.2, 40, 70) },
  { p: 10, img: "08", zoom: Z(1.05, 1.2, 35, 70) },
  { p: 11, img: "09", zoom: Z(1, 1.15, 60, 50) },
  { p: 14, img: "10", zoom: Z(1.05, 1.3, 40, 65), shake: true },
  {
    p: 15,
    img: "11",
    zoom: Z(1, 1.15, 30, 70),
    overlay: (
      <Sticker x={50} y={14} rotate={-3}>
        ӨЗІН-ӨЗІ
        <br />
        ЖҰМЫСПЕН ҚАМТЫҒАН
      </Sticker>
    ),
  },
  { p: 17, img: "12", zoom: Z(1, 1.2, 75, 75) },
  {
    p: 18,
    img: "13",
    zoom: Z(1, 1.1, 60, 55),
    overlay: (
      <Sticker x={50} y={13} rotate={2}>
        МЕДЕТТІҢ ӨНІМДІЛІГІ
      </Sticker>
    ),
  },
  {
    p: 19,
    img: "13",
    zoom: Z(1.8, 2.4, 59, 61),
    overlay: (
      <Sticker x={59} y={52} rotate={-4} delay={2}>
        8:12,34 МИН
      </Sticker>
    ),
  },
  { p: 21, img: "14", zoom: Z(1, 1.15, 40, 55) },
  { p: 23, img: "15", zoom: Z(1, 1.12, 50, 45) },
  { p: 25, img: "16", zoom: Z(1.05, 1.3, 35, 60) },
  { p: 26, img: "17", zoom: Z(1.1, 1.35, 30, 52) },
  { p: 27, img: "18", zoom: Z(1.1, 1.2, 50, 40), shake: true },
  { p: 28, img: "19", zoom: Z(1, 1.1, 60, 50) },
  {
    p: 29,
    img: "19",
    zoom: Z(1.8, 2.2, 85, 47),
    overlay: (
      <Sticker x={62} y={30} rotate={-5} delay={2}>
        АГЕНТ-ЗАҢГЕР
      </Sticker>
    ),
  },
  { p: 32, img: "20", zoom: Z(1, 1.15, 55, 60) },
  { p: 35, img: "21", zoom: Z(1, 1.2, 60, 50) },
  { p: 37, img: "24", zoom: Z(1, 1.12, 30, 72) },
  { p: 38, img: "23", zoom: Z(1, 1.1, 55, 60) },
  {
    p: 39,
    img: "23",
    zoom: Z(1.6, 2, 85, 47),
    overlay: (
      <Sticker x={75} y={38} rotate={4} delay={2}>
        ???
      </Sticker>
    ),
  },
  { p: 40, img: "22", zoom: Z(1.1, 1.5, 73, 70) },
  { p: 41, img: "27", zoom: Z(1.05, 1.15, 50, 40) },
  { p: 42, img: "26", zoom: Z(1, 1.06, 50, 30), overlay: <TwoDaysAgo /> },
  { p: 43, img: "25", zoom: Z(1.3, 1.6, 40, 48), overlay: <Typing /> },
  { p: 44, img: "25", zoom: Z(1.2, 1.5, 65, 63) },
  {
    p: 45,
    img: "28",
    zoom: Z(1.1, 1.35, 30, 65),
    shake: true,
    sfx: "sfx/error8.wav",
    overlay: (
      <Sticker x={32} y={55} rotate={-6} delay={14}>
        ⛔ ТОҚТА!
      </Sticker>
    ),
  },
  { p: 46, img: "29", zoom: Z(1, 1.12, 45, 55) },
  { p: 48, img: "20", zoom: Z(1.2, 2.2, 22, 47), glitch: true },
  { p: 49, img: "30", zoom: Z(1, 1.2, 45, 45), overlay: <Rec /> },
  { p: 50, img: "31", zoom: Z(1, 1.12, 40, 50) },
  { p: 51, img: "31", zoom: Z(1.6, 1.8, 30, 25) },
];

// «Агенттер» — казахская версия ролика @kireev.voice, пиксель-арт, Медет
export const Agents: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SCENES.map((s, i) => {
        const start = Math.max(0, SUBS[s.p][0] - 2);
        const end =
          i + 1 < SCENES.length
            ? Math.max(0, SUBS[SCENES[i + 1].p][0] - 2)
            : AGENTS_DURATION;
        return (
          <Sequence
            key={i}
            name={`Scene ${s.img} (фраза ${s.p})`}
            from={start}
            durationInFrames={end - start}
          >
            <Shot
              src={`agents/${s.img}.jpg`}
              zoom={s.zoom}
              shake={s.shake}
              glitch={s.glitch}
            >
              {s.overlay}
            </Shot>
            {s.sfx ? (
              <Sequence from={14}>
                <Audio src={staticFile(s.sfx)} volume={0.6} />
              </Sequence>
            ) : null}
          </Sequence>
        );
      })}

      {SUBS.map(([from, to, text], i) => (
        <Sequence
          key={i}
          name={`Sub ${i}`}
          from={from}
          durationInFrames={to - from}
        >
          <Subtitle text={text} />
        </Sequence>
      ))}

      <Audio src={staticFile("agents/voice-125.mp3")} />
    </AbsoluteFill>
  );
};
