import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import "../fonts";
import { Agent, C, clamp, Medet, Skyline } from "./characters";

export const FLAT_DURATION = 420;

const DESK_Y = 1360;
const SCREEN = { x: 120, y: 1090, w: 250, h: 190 };

// Сцена рисуется в 1080×1920 и масштабируется ×1,2, чтобы персонажи были крупнее
const VIEW = { s: 1.2, x: -108, y: -182 };
// Перевод координат сцены в координаты экрана (для HTML-реплик поверх SVG)
const sx = (x: number) => VIEW.x + x * VIEW.s;
const sy = (y: number) => VIEW.y + y * VIEW.s;

// Агенты: когда выпрыгивают из монитора и куда приземляются
const AGENTS: {
  at: number;
  x: number;
  y: number;
  size: number;
  hat?: "detective" | "police" | "headset";
}[] = [
  { at: 78, x: 400, y: DESK_Y + 30, size: 120 },
  { at: 160, x: 850, y: DESK_Y + 40, size: 110, hat: "detective" },
  { at: 172, x: 760, y: DESK_Y + 120, size: 100 },
  { at: 184, x: 245, y: DESK_Y - 220, size: 90, hat: "headset" },
  { at: 196, x: 900, y: DESK_Y + 170, size: 95, hat: "police" },
  { at: 208, x: 300, y: DESK_Y + 160, size: 90 },
  { at: 220, x: 560, y: DESK_Y + 210, size: 85 },
  { at: 232, x: 180, y: DESK_Y + 240, size: 80 },
];

const easeOut = { ...clamp, easing: Easing.out(Easing.cubic) };

// Прыжок из монитора по дуге, затем подпрыгивания на месте
const agentTransform = (
  frame: number,
  a: (typeof AGENTS)[number],
  i: number,
) => {
  const t = frame - a.at;
  const sx = SCREEN.x + SCREEN.w / 2;
  const sy = SCREEN.y + SCREEN.h / 2 + 40;
  const p = interpolate(t, [0, 16], [0, 1], clamp);
  const x = sx + (a.x - sx) * p;
  const arc = Math.sin(p * Math.PI) * 260;
  const y = sy + (a.y - sy) * p - arc;
  // после приземления — ритмичные прыжки (на финале все в такт)
  const sync = frame > 330;
  const ph = sync ? frame / 4.5 : (frame + i * 11) / 6;
  const hop = t > 16 ? Math.max(0, Math.sin(ph)) * (sync ? 40 : 14) : 0;
  const land = t > 16 && t < 24 ? interpolate(t, [16, 19, 24], [0, 1, 0]) : 0;
  const scale = interpolate(t, [0, 6], [0.2, 1], easeOut);
  return { x, y: y - hop, scale, squash: land, visible: t >= 0 };
};

// Речевой пузырь
const Bubble: React.FC<{
  x: number;
  y: number;
  text: string;
  tail?: "left" | "right";
  dark?: boolean;
}> = ({ x, y, text, tail = "left", dark }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 7], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(2)),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -100%",
        scale: String(p),
        transformOrigin: tail === "left" ? "20% 100%" : "80% 100%",
      }}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: dark ? C.ink : "#fff",
          color: dark ? "#fff" : C.ink,
          border: `6px solid ${C.ink}`,
          borderRadius: 36,
          padding: "18px 30px",
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 46,
          whiteSpace: "nowrap",
          boxShadow: "8px 8px 0 rgba(0,0,0,0.35)",
        }}
      >
        {text}
        <div
          style={{
            position: "absolute",
            bottom: -30,
            [tail === "left" ? "left" : "right"]: 50,
            width: 0,
            height: 0,
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderTop: `30px solid ${C.ink}`,
          }}
        />
      </div>
    </div>
  );
};

// Подпись внизу: слова выпрыгивают по одному, *слово* — оранжевым
const Caption: React.FC<{ text: string; y: number; size?: number }> = ({
  text,
  y,
  size = 70,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: y,
        textAlign: "center",
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.15,
        color: "#fff",
        textShadow: `5px 5px 0 ${C.ink}`,
      }}
    >
      {text.split(" ").map((w, i) => {
        const p = interpolate(frame, [i * 4, i * 4 + 8], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.back(2.2)),
        });
        const accent = w.startsWith("*");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.25em",
              color: accent ? C.orange : "#fff",
              scale: String(p),
              opacity: p,
            }}
          >
            {accent ? w.replace(/\*/g, "") : w}
          </span>
        );
      })}
    </div>
  );
};

export const FlatDemo: React.FC = () => {
  const frame = useCurrentFrame();

  // Поза Медета по таймлайну
  const typing =
    interpolate(frame, [0, 70, 80], [1, 1, 0], clamp) +
    interpolate(frame, [400, 420], [0, 0], clamp);
  const surprise =
    interpolate(frame, [78, 86, 140, 150], [0, 1, 1, 0.3], clamp) +
    interpolate(frame, [160, 170, 230, 240], [0, 0.7, 0.7, 0], clamp);
  const shrug = interpolate(frame, [244, 254, 296, 306], [0, 1, 1, 0], easeOut);
  const wave = interpolate(frame, [334, 344], [0, 1], easeOut);
  const talk = (from: number, to: number) =>
    frame >= from && frame < to ? Math.abs(Math.sin((frame - from) / 2.6)) : 0;
  const mouth = Math.max(talk(166, 200), talk(250, 290), talk(340, 372), 0);
  const lookX =
    frame < 78
      ? -0.6
      : frame < 150
        ? -1
        : frame < 330
          ? Math.sin(frame / 14)
          : 0;

  // Монитор вспыхивает перед каждым агентом
  const flash = Math.max(
    ...AGENTS.map((a) =>
      interpolate(frame - a.at, [-6, 0, 8], [0, 1, 0], clamp),
    ),
  );
  const intro = interpolate(frame, [0, 12], [0, 1], clamp);
  const bigShake =
    frame >= 78 && frame < 92 ? Math.sin(frame * 3) * (92 - frame) * 1.2 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#151935", opacity: intro }}>
      <svg
        viewBox="0 0 1080 1920"
        width="100%"
        height="100%"
        style={{ position: "absolute", translate: `${bigShake}px 0px` }}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2152" />
            <stop offset="1" stopColor="#4a3a7a" />
          </linearGradient>
          <clipPath id="win">
            <rect x={150} y={230} width={780} height={640} />
          </clipPath>
          <radialGradient id="lamp" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* стена и окно */}
        <rect width={1080} height={1920} fill="#1d2244" />
        <rect x={130} y={210} width={820} height={680} rx={14} fill="#3b2c2a" />
        <g clipPath="url(#win)">
          <rect x={150} y={230} width={780} height={640} fill="url(#sky)" />
          <circle cx={820} cy={330} r={46} fill="#fff4d6" />
          {new Array(18).fill(0).map((_, i) => (
            <circle
              key={i}
              cx={170 + ((i * 137) % 760)}
              cy={250 + ((i * 89) % 240)}
              r={2.5}
              fill="#fff"
              opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i))}
            />
          ))}
          <g transform="translate(150 250)">
            <Skyline frame={frame} />
          </g>
        </g>
        <rect x={530} y={230} width={20} height={640} fill="#3b2c2a" />

        {/* настольная лампа: тёплое пятно */}
        <ellipse
          cx={980}
          cy={DESK_Y + 20}
          rx={360}
          ry={200}
          fill="url(#lamp)"
        />

        {/* Медет */}
        <g transform={`translate(${VIEW.x} ${VIEW.y}) scale(${VIEW.s})`}>
          <g transform="translate(620 1150)">
            <Medet
              frame={frame}
              pose={{ mouth, surprise, typing, shrug, wave, lookX }}
            />
          </g>

          {/* стол */}
          <rect x={0} y={DESK_Y} width={1080} height={60} fill="#8a5432" />
          <rect
            x={0}
            y={DESK_Y + 60}
            width={1080}
            height={500}
            fill="#5e3822"
          />
          <rect
            x={470}
            y={DESK_Y - 22}
            width={270}
            height={34}
            rx={8}
            fill="#2a2a36"
          />
          <rect
            x={480}
            y={DESK_Y - 16}
            width={250}
            height={8}
            rx={3}
            fill="#40404f"
          />

          {/* кружка с паром */}
          <rect
            x={790}
            y={DESK_Y - 70}
            width={70}
            height={80}
            rx={10}
            fill="#e9e1d0"
          />
          <path
            d={`M 860 ${DESK_Y - 50} q 30 10 0 40`}
            stroke="#e9e1d0"
            strokeWidth={10}
            fill="none"
          />
          {[0, 1].map((k) => (
            <path
              key={k}
              d={`M ${812 + k * 22} ${DESK_Y - 90} q 12 -20 0 -40 q -12 -20 0 -40`}
              stroke="#ffffff"
              strokeWidth={6}
              fill="none"
              opacity={0.25 + 0.2 * Math.sin(frame / 8 + k)}
            />
          ))}

          {/* монитор */}
          <rect
            x={SCREEN.x - 20}
            y={SCREEN.y - 20}
            width={SCREEN.w + 40}
            height={SCREEN.h + 40}
            rx={18}
            fill="#d8d2c4"
          />
          <rect
            x={SCREEN.x}
            y={SCREEN.y}
            width={SCREEN.w}
            height={SCREEN.h}
            rx={8}
            fill={
              flash > 0.05
                ? `rgba(255,${200 + flash * 55},${150 + flash * 105},1)`
                : "#2f6bff"
            }
          />
          {flash < 0.05
            ? new Array(5)
                .fill(0)
                .map((_, r) => (
                  <rect
                    key={r}
                    x={SCREEN.x + 20}
                    y={SCREEN.y + 24 + r * 30}
                    width={
                      frame < 80
                        ? ((frame * 9 + r * 40) % 190) + 20
                        : 160 - r * 20
                    }
                    height={10}
                    rx={5}
                    fill="#cfe0ff"
                    opacity={0.8}
                  />
                ))
            : null}
          <rect
            x={SCREEN.x + SCREEN.w / 2 - 30}
            y={SCREEN.y + SCREEN.h + 20}
            width={60}
            height={DESK_Y - SCREEN.y - SCREEN.h - 20}
            fill="#bdb6a8"
          />
          <rect
            x={SCREEN.x + SCREEN.w / 2 - 80}
            y={DESK_Y - 12}
            width={160}
            height={14}
            rx={6}
            fill="#bdb6a8"
          />

          {/* агенты */}
          {AGENTS.map((a, i) => {
            const tr = agentTransform(frame, a, i);
            if (!tr.visible) return null;
            return (
              <g
                key={i}
                transform={`translate(${tr.x} ${tr.y}) scale(${tr.scale})`}
              >
                <Agent
                  frame={frame}
                  size={a.size}
                  seed={i}
                  squash={tr.squash}
                  hat={a.hat}
                  wave={i === 0 && frame > 96 && frame < 160}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* надписи и реплики */}
      <Sequence name="Title" durationInFrames={78}>
        <Caption text="*АГЕНТТЕР*" y={80} size={110} />
        <Sequence from={14}>
          <Caption text="2D FLAT · ДЕМО" y={215} size={44} />
        </Sequence>
      </Sequence>
      <Sequence name="Agent hello" from={100} durationInFrames={58}>
        <Bubble
          x={sx(470)}
          y={sy(1240)}
          text="Сәлем! Мен агентпін 👋"
          tail="left"
        />
      </Sequence>
      <Sequence name="Medet: what" from={166} durationInFrames={40}>
        <Bubble x={sx(800)} y={sy(760)} text="Бұл не?!" tail="left" />
      </Sequence>
      <Sequence name="Agents: we" from={206} durationInFrames={40}>
        <Bubble
          x={sx(330)}
          y={sy(1020)}
          text="Біз агентпіз!"
          tail="left"
          dark
        />
      </Sequence>
      <Sequence name="Medet: me" from={250} durationInFrames={50}>
        <Bubble
          x={sx(720)}
          y={sy(760)}
          text="Ал мен не істеймін?"
          tail="left"
        />
      </Sequence>
      <Sequence name="Caption" from={300} durationInFrames={120}>
        <Caption text="Енді бәрін *агенттер* істейді" y={90} size={76} />
      </Sequence>
      <Sequence name="Medet: bye" from={340} durationInFrames={80}>
        <Bubble x={sx(760)} y={sy(760)} text="Демалайын онда 😎" tail="left" />
      </Sequence>

      {/* звук */}
      <Sequence from={74}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
      </Sequence>
      {AGENTS.map((a, i) => (
        <Sequence key={i} from={a.at}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.8} />
        </Sequence>
      ))}
      {[100, 166, 206, 250, 340].map((f) => (
        <Sequence key={f} from={f}>
          <Audio src={staticFile("sfx/blip.wav")} volume={0.4} />
        </Sequence>
      ))}
      <Sequence durationInFrames={78}>
        <Audio src={staticFile("sfx/type.wav")} volume={0.3} loop />
      </Sequence>
      <Sequence from={300}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
