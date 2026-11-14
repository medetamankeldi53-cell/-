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

// «Қамбар Ата» дүкені — исходник (проход по магазину под музыку) без перемонтажа
// и без наездов; сверху motion-графика: рубрики, вспышки на склейках, пульс на бит.

const FPS = 30;
const SRC = "qambar/src.mp4";
export const QAMBAR_DURATION = Math.floor(33.7 * FPS);
const GOLD = "#f5b942";
const RED = "#c8242b";
const f = (t: number) => Math.round(t * FPS);

// Склейки исходника (ffmpeg scene detect)
const CUTS = [
  1.47, 3.1, 4.23, 5.53, 6.97, 8.63, 10.27, 11.77, 13.37, 14.97, 16.73, 18.3,
  21.1, 22.67, 24.3, 26.23, 28.63, 31.13,
];
// Доли музыки (≈94 BPM)
const BEATS = Array.from({ length: 52 }, (_, k) => 0.36 + k * 0.6355);

// Рубрики: [начало, конец, заголовок, подпись]
const CATS: [number, number, string, string][] = [
  [1.47, 6.97, "АТ ӘБЗЕЛДЕРІ", "жүген · ноқта · арқан"],
  [6.97, 13.37, "МАЛ ДӘРІЛЕРІ", "ветеринариялық препараттар"],
  [13.37, 14.97, "ТЫМАҚ · БӨРІК", "ұлттық бас киім"],
  [14.97, 18.3, "ЕР-ТҰРМАН", "ер · тоқым · үзеңгі"],
  [18.3, 21.1, "ЕТІК", "салт атқа арналған"],
  [21.1, 26.23, "ЖЕМ-ШӨП", "мал азығы · дән"],
];

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Подкова: SVG-контур, рисуется штрихом
const Horseshoe: React.FC<{ size: number; draw: number; stroke?: number }> = ({
  size,
  draw,
  stroke = 14,
}) => {
  const len = 420;
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <path
        d="M40 140 L40 80 A40 40 0 0 1 120 80 L120 140"
        fill="none"
        stroke={GOLD}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
      {[
        [40, 100],
        [46, 66],
        [62, 46],
        [98, 46],
        [114, 66],
        [120, 100],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={3.5}
          fill="#1a1a1a"
          opacity={draw > (i + 1) / 7 ? 1 : 0}
        />
      ))}
    </svg>
  );
};

// Текст, выезжающий из-под маски снизу
const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>
        {children}
      </div>
    </div>
  );
};

// Карточка рубрики внизу слева
const CatCard: React.FC<{ n: number; title: string; sub: string }> = ({
  n,
  title,
  sub,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const bar = interpolate(frame, [2, 16], [0, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  // уход: шторка влево
  const out = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [0, 100],
    { extrapolateLeft: "clamp", easing: Easing.in(Easing.cubic) },
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom: 300,
        clipPath: `inset(0 ${out}% 0 0)`,
      }}
    >
      <Rise>
        <div
          style={{
            fontFamily: "Montserrat",
            fontWeight: 800,
            fontSize: 40,
            color: GOLD,
            letterSpacing: 6,
          }}
        >
          {String(n).padStart(2, "0")} / {String(CATS.length).padStart(2, "0")}
        </div>
      </Rise>
      <Rise delay={3}>
        <div
          style={{
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: title.length > 10 ? 104 : 128,
            lineHeight: 1.05,
            color: "#fff",
            textShadow: "0 6px 30px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </div>
      </Rise>
      <div
        style={{
          height: 10,
          width: `${bar * 62}%`,
          background: `linear-gradient(90deg, ${GOLD}, ${RED})`,
          borderRadius: 5,
          margin: "18px 0 20px",
        }}
      />
      <Rise delay={7}>
        <div
          style={{
            fontFamily: "Montserrat",
            fontWeight: 600,
            fontSize: 46,
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 3px 16px rgba(0,0,0,0.8)",
          }}
        >
          {sub}
        </div>
      </Rise>
    </div>
  );
};

// Фраза с акцентами *слово*
const Kinetic: React.FC<{ text: string; size?: number; y?: number }> = ({
  text,
  size = 110,
  y = 640,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  const words = text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 70,
        right: 70,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 26,
        opacity: out,
      }}
    >
      {words.map((w, i) => {
        const m = /^\*(.+)\*([,.!?—…]*)$/.exec(w);
        return (
          <Rise key={i} delay={i * 4}>
            <span
              style={{
                fontFamily: "Montserrat",
                fontWeight: 900,
                fontSize: size,
                lineHeight: 1.15,
                color: m ? GOLD : "#fff",
                textShadow: "0 6px 30px rgba(0,0,0,0.7)",
              }}
            >
              {m ? m[1] + m[2] : w}
            </span>
          </Rise>
        );
      })}
    </div>
  );
};

// Значок бренда в верхнем левом углу
const Badge: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 60,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 26px 10px 14px",
        background: "rgba(10,10,10,0.6)",
        border: `3px solid ${GOLD}`,
        borderRadius: 60,
        opacity: p,
        transform: `translateX(${(1 - p) * -40}px)`,
      }}
    >
      <Horseshoe size={58} draw={p} stroke={16} />
      <span
        style={{
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 38,
          color: "#fff",
          letterSpacing: 3,
        }}
      >
        ҚАМБАР АТА
      </span>
    </div>
  );
};

// Прогресс по рубрикам — шесть сегментов сверху
const Progress: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame() + from;
  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 60,
        right: 60,
        display: "flex",
        gap: 10,
      }}
    >
      {CATS.map(([a, b], i) => {
        const p = interpolate(frame, [f(a), f(b)], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{ width: `${p * 100}%`, height: "100%", background: GOLD }}
            />
          </div>
        );
      })}
    </div>
  );
};

// Пульс рамки на каждую долю + белая вспышка на склейках
const BeatFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const last = BEATS.filter((b) => b <= t).pop();
  const pulse = last === undefined ? 0 : Math.exp(-(t - last) * 9);
  const cut = CUTS.filter((c) => c <= t).pop();
  const flash = cut === undefined ? 0 : Math.max(0, 1 - (t - cut) * FPS / 4);
  return (
    <>
      <AbsoluteFill
        style={{
          border: `${6 + pulse * 10}px solid ${GOLD}`,
          opacity: 0.25 + pulse * 0.6,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash * 0.35 }} />
    </>
  );
};

// Финал: логотип
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const dim = interpolate(frame, [0, 10], [0, 0.72], {
    extrapolateRight: "clamp",
  });
  const draw = interpolate(frame, [2, 26], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const line = interpolate(frame, [18, 34], [0, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(8,8,8,${dim})` }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <Horseshoe size={260} draw={draw} stroke={13} />
        <Rise delay={10}>
          <div
            style={{
              fontFamily: "Montserrat",
              fontWeight: 900,
              fontSize: 130,
              color: "#fff",
              letterSpacing: 4,
              lineHeight: 1.1,
            }}
          >
            ҚАМБАР АТА
          </div>
        </Rise>
        <Rise delay={14}>
          <div
            style={{
              fontFamily: "Montserrat",
              fontWeight: 800,
              fontSize: 54,
              color: GOLD,
              letterSpacing: 18,
            }}
          >
            ДҮКЕНІ
          </div>
        </Rise>
        <div
          style={{
            height: 6,
            width: 560 * line,
            background: `linear-gradient(90deg, ${GOLD}, ${RED})`,
            borderRadius: 3,
            margin: "34px 0",
          }}
        />
        <Rise delay={22}>
          <div
            style={{
              fontFamily: "Montserrat",
              fontWeight: 600,
              fontSize: 44,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.5,
            }}
          >
            Әбзел · Дәрі · Жем-шөп
            <br />
            Бәрі бір жерде
          </div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Qambar: React.FC = () => {
  const hookEnd = f(CUTS[0]);
  const outroAt = f(31.13);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        src={staticFile(SRC)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
      {/* затемнение снизу для читаемости */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <BeatFrame />

      {/* ХУК */}
      <Sequence name="Hook" durationInFrames={hookEnd}>
        <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
        <Kinetic text="Атқа керектің *бәрі* — бір жерде" y={620} size={112} />
      </Sequence>

      <Sequence name="Badge" from={hookEnd} durationInFrames={outroAt - hookEnd}>
        <Badge />
        <Progress from={hookEnd} />
      </Sequence>

      {CATS.map(([a, b, title, sub], i) => (
        <Sequence
          key={title}
          name={`Cat ${title}`}
          from={f(a)}
          durationInFrames={f(b) - f(a)}
        >
          <CatCard n={i + 1} title={title} sub={sub} />
        </Sequence>
      ))}

      <Sequence name="Slogan" from={f(26.23)} durationInFrames={outroAt - f(26.23)}>
        <Kinetic text="Малың *тоқ,* атың *жүйрік!*" y={560} size={118} />
      </Sequence>

      <Sequence name="Outro" from={outroAt}>
        <Outro />
      </Sequence>

      {/* Акценты звука поверх музыки */}
      <Sequence from={f(CUTS[0]) - 6}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={outroAt}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
