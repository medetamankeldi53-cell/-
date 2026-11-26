import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  random,
  Img,
} from "remotion";
import "../fonts";
import { CITIES, KZ_PATH, MAP_H, MAP_W, ZONE_KISHI, ZONE_ULY } from "./map";
import { MAP_PTS, SHANYRAK_PTS } from "./points";

// «Қазақтың рулары» — 2D-анимация 1080×1920, диктор Alex Bell (ElevenLabs).
// Озвучка по сценам: public/ru/NN.mp3. Если файла сцены ещё нет — сцена идёт без звука
// с оценочной длительностью (поле `has` = false).

export const RU_FPS = 30;
const f = (t: number) => Math.round(t * RU_FPS);

const BG1 = "#0f1a30";
const BG2 = "#1b2c4d";
const GOLD = "#f2c46d";
const KISHI = "#3fb0a8";
const ORTA = "#e9b44c";
const ULY = "#e0623f";
const INK = "#0b1220";
const PAD = 0.7; // пауза после реплики

type Scene = { id: string; dur: number; has: boolean };
// dur — длительность озвучки (с)
export const SCENES: Scene[] = [
  { id: "00", dur: 1.7, has: false }, // ударный хук «БАҚТИЯР!» (звук из 09.mp3)
  { id: "01", dur: 3.76, has: true }, // хук
  { id: "02", dur: 5.12, has: true }, // жеті ата
  { id: "03", dur: 5.52, has: true }, // үш жүз
  { id: "04", dur: 11.68, has: true }, // Ұлы жүз
  { id: "05", dur: 7.36, has: true }, // Орта жүз
  { id: "06", dur: 4.81, has: true }, // Кіші жүз («Кіші жүз» вклеено из 03.mp3 — там произносится верно)
  { id: "07", dur: 3.74, has: true }, // төре, қожа
  { id: "09", dur: 9.04, has: true }, // ұрандар
  { id: "10", dur: 10.63, has: true }, // мәтел
  { id: "08", dur: 6.14, has: true }, // финал
];
// моменты внутри сцен (с) — по озвучке 09 и 10
const URAN_AT = [3.25, 5.69, 8.04]; // начало «Бақтияр!», «Ақжол!», «Алатау!» в 09.mp3
const MATEL_AT = [2.0, 4.85, 7.8]; // начало строк мәтела в 10.mp3
// последняя сцена держится на 1,5 с дольше, без пустого хвоста
const lens = SCENES.map((s, i) => f(s.dur + PAD + (i === SCENES.length - 1 ? 3.6 : 0)));
const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
export const RU_DURATION = lens.reduce((a, b) => a + b, 0);

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- общие элементы ----------

// Фон: градиент + орнамент «қошқар мүйіз» по краям
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 10;
  const horn = (x: number, y: number, s: number, r: number, i: number) => (
    <g
      key={i}
      transform={`translate(${x} ${y + drift * (i % 2 ? 1 : -1)}) rotate(${r}) scale(${s})`}
      opacity={0.09}
    >
      <path
        d="M0,0 C-40,-10 -60,-50 -35,-75 C-15,-95 15,-80 10,-58 C6,-42 -12,-40 -18,-52 M0,0 C40,-10 60,-50 35,-75 C15,-95 -15,-80 -10,-58 C-6,-42 12,-40 18,-52 M0,0 L0,40"
        fill="none"
        stroke={GOLD}
        strokeWidth={6}
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(180deg, ${BG1} 0%, ${BG2} 100%)` }}
    >
      <svg width={1080} height={1920}>
        {[
          [120, 180, 1.4, 0],
          [960, 260, 1.1, 20],
          [90, 1700, 1.2, -15],
          [990, 1760, 1.5, 10],
          [540, 1880, 1.0, 0],
        ].map(([x, y, s, r], i) => horn(x, y, s, r, i))}
        {/* золотая пыль */}
        {Array.from({ length: 34 }, (_, i) => {
          const sx = (i * 263) % 1080;
          const sp = 0.6 + ((i * 37) % 10) / 10;
          const y = 1920 - ((frame * sp * 1.4 + i * 151) % 2100);
          const x = sx + Math.sin(frame / 40 + i) * 18;
          return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill={GOLD} opacity={0.18 + (i % 4) * 0.06} />;
        })}
        {/* дала: два слоя холмов с параллаксом */}
        <path
          d={`M0,1700 Q180,${1640 + Math.sin(frame / 70) * 6} 360,1690 T720,1680 T1080,1670 L1080,1920 L0,1920 Z`}
          fill="#16233f"
        />
        <path
          d={`M0,1780 Q240,${1730 + Math.sin(frame / 55) * 8} 520,1775 T1080,1760 L1080,1920 L0,1920 Z`}
          fill="#111c33"
        />
      </svg>
    </AbsoluteFill>
  );
};

const Title: React.FC<{
  children: React.ReactNode;
  y: number;
  size?: number;
  delay?: number;
  color?: string;
}> = ({ children, y, size = 78, delay = 0, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 14], [0, 1], { ...clamp, easing: ease });
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
        lineHeight: 1.12,
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
        textShadow: "0 6px 24px rgba(0,0,0,0.45)",
      }}
    >
      {children}
    </div>
  );
};

// Карта Казахстана с зонами жүзов
const KzMap: React.FC<{
  draw: number; // 0..1 — прорисовка контура
  fill: [number, number, number]; // видимость зон: Кіші, Орта, Ұлы
  dim?: [number, number, number]; // 1 — зона приглушена
  x: number;
  y: number;
  scale: number;
  labels?: number; // 0..1
  cities?: number;
  glow?: string; // цвет пульсирующего свечения
}> = ({ draw, fill, dim = [0, 0, 0], x, y, scale, labels = 0, cities = 0, glow }) => {
  const frame = useCurrentFrame();
  const g = glow ? 10 + Math.sin(frame / 7) * 8 : 0;
  const len = 4200;
  const op = (i: number) => fill[i] * (1 - dim[i] * 0.75);
  return (
    <svg
      width={MAP_W * scale}
      height={MAP_H * scale}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      style={{
        position: "absolute",
        left: x,
        top: y,
        overflow: "visible",
        filter: glow ? `drop-shadow(0 0 ${g}px ${glow})` : undefined,
      }}
    >
      <defs>
        <clipPath id="kz">
          <path d={KZ_PATH} />
        </clipPath>
      </defs>
      <g clipPath="url(#kz)">
        <rect width={MAP_W} height={MAP_H} fill={ORTA} opacity={op(1)} />
        <polygon points={ZONE_KISHI} fill={BG2} opacity={fill[0] > 0 ? 1 : 0} />
        <polygon points={ZONE_KISHI} fill={KISHI} opacity={op(0)} />
        <polygon points={ZONE_ULY} fill={BG2} opacity={fill[2] > 0 ? 1 : 0} />
        <polygon points={ZONE_ULY} fill={ULY} opacity={op(2)} />
        {/* границы зон */}
        <polygon points={ZONE_KISHI} fill="none" stroke={INK} strokeWidth={3} opacity={Math.max(...fill) * 0.6} />
        <polygon points={ZONE_ULY} fill="none" stroke={INK} strokeWidth={3} opacity={Math.max(...fill) * 0.6} />
      </g>
      <path
        d={KZ_PATH}
        fill="none"
        stroke="#fff"
        strokeWidth={4}
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
      {CITIES.map(([name, cx, cy]) => (
        <g key={name} opacity={cities}>
          <circle cx={cx} cy={cy} r={6} fill="#fff" />
          <text
            x={cx + 10}
            y={cy + 6}
            fontFamily="Montserrat"
            fontWeight={600}
            fontSize={20}
            fill="#fff"
          >
            {name}
          </text>
        </g>
      ))}
      {[
        ["КІШІ ЖҮЗ", 150, 260],
        ["ОРТА ЖҮЗ", 470, 190],
        ["ҰЛЫ ЖҮЗ", 640, 400],
      ].map(([t, lx, ly], i) => (
        <text
          key={i}
          x={lx as number}
          y={ly as number}
          textAnchor="middle"
          fontFamily="Montserrat"
          fontWeight={900}
          fontSize={38}
          fill="#fff"
          stroke={INK}
          strokeWidth={8}
          paintOrder="stroke"
          opacity={labels * fill[i] * (1 - dim[i] * 0.7)}
        >
          {t as string}
        </text>
      ))}
    </svg>
  );
};

// Плашка рода, выпрыгивает пружиной
// Плашка рода: вылетает из карты (сверху), летит по дуге со светящимся шлейфом
// и «приземляется» с пружиной ровно в момент, когда диктор называет род.
const FLY = 14; // кадров полёта
const Chip: React.FC<{ text: string; color: string; delay: number; big?: boolean; index?: number }> = ({
  text,
  color,
  delay,
  big,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jx = (index % 2 ? 1 : -1) * (120 + (index * 53) % 160);
  const at = (fr: number) =>
    interpolate(fr, [delay - FLY, delay], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pos = (p: number) => ({
    x: (1 - p) * jx,
    y: (1 - p) * -560 - Math.sin(p * Math.PI) * 60,
    sc: 0.35 + 0.65 * p,
  });
  const p = at(frame);
  const land = spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 260 } });
  const bump = frame >= delay ? 1 + (1 - land) * 0.25 : 1;
  const c = pos(p);
  const base: React.CSSProperties = {
    background: color,
    color: INK,
    fontFamily: "Montserrat",
    fontWeight: 900,
    fontSize: big ? 64 : 50,
    padding: big ? "22px 44px" : "16px 32px",
    borderRadius: 60,
    whiteSpace: "nowrap",
  };
  if (p <= 0) return <div style={{ ...base, opacity: 0 }}>{text}</div>;
  return (
    <div style={{ position: "relative" }}>
      {/* шлейф */}
      {p < 1 &&
        [0.25, 0.5, 0.75].map((k) => {
          const g = pos(at(frame - k * 5));
          return (
            <div
              key={k}
              style={{
                ...base,
                position: "absolute",
                inset: 0,
                opacity: 0.25 * (1 - k),
                transform: `translate(${g.x}px, ${g.y}px) scale(${g.sc})`,
                filter: "blur(6px)",
              }}
            >
              {text}
            </div>
          );
        })}
      <div
        style={{
          ...base,
          opacity: Math.min(1, p * 2),
          transform: `translate(${c.x}px, ${c.y}px) scale(${c.sc * bump})`,
          filter: p < 1 ? `blur(${(1 - p) * 3}px)` : undefined,
          boxShadow: `0 10px 30px rgba(0,0,0,0.35), 0 0 ${frame >= delay ? (1 - land) * 50 + 8 : 30}px ${color}`,
        }}
      >
        {text}
      </div>
      <Sequence from={delay - 4} durationInFrames={30}>
        <Audio src={staticFile("ru/sfx_chip.wav")} volume={0.45} />
      </Sequence>
    </div>
  );
};

const Chips: React.FC<{
  items: string[];
  color: string;
  from: number; // с какого кадра сцены
  step: number; // кадров между плашками
  top: number;
  big?: boolean;
  at?: number[]; // точные кадры появления (по озвучке), иначе from + i·step
}> = ({ items, color, from, step, top, big, at }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 50,
      right: 50,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 22,
    }}
  >
    {items.map((t, i) => (
      <Chip key={t} text={t} color={color} delay={at ? at[i] : from + i * step} big={big} index={i} />
    ))}
  </div>
);

// Простой персонаж в қалпақе (flat)
const Person: React.FC<{ x: number; flip?: boolean; coat: string; talk: number }> = ({
  x,
  flip,
  coat,
  talk,
}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 12 + x) * 4;
  const mouth = talk * Math.abs(Math.sin(frame / 3));
  return (
    <svg
      width={360}
      height={620}
      viewBox="0 0 360 620"
      style={{
        position: "absolute",
        left: x,
        top: 1040 + bob,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      {/* шапан */}
      <path d="M60,620 L90,330 Q180,280 270,330 L300,620 Z" fill={coat} />
      <path d="M180,330 L150,620 L210,620 Z" fill="rgba(0,0,0,0.18)" />
      <path d="M120,320 Q180,370 240,320" fill="none" stroke={GOLD} strokeWidth={10} />
      {/* голова */}
      <circle cx={180} cy={235} r={78} fill="#d9a477" />
      {/* глаз и рот (смотрит вправо) */}
      <circle cx={215} cy={225} r={8} fill={INK} />
      <ellipse cx={220} cy={272} rx={16} ry={4 + mouth * 12} fill="#7a2f2a" />
      <path d="M195,198 L232,192" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {/* мұрт */}
      <path d="M200,258 Q222,250 244,258" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {/* қалпақ */}
      <path d="M92,190 Q180,30 268,190 Z" fill="#f4efe3" />
      <path d="M78,192 L282,192 L270,172 L90,172 Z" fill="#e8dcc4" />
      <path d="M78,192 L282,192" stroke="#1a1a1a" strokeWidth={8} />
      <path d="M150,110 Q180,95 210,110" fill="none" stroke="#1a1a1a" strokeWidth={5} />
    </svg>
  );
};

const Bubble: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 170 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 760,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${s})`,
          background: "#fff",
          color: INK,
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 84,
          padding: "30px 54px",
          borderRadius: 50,
          position: "relative",
          boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
        }}
      >
        {text}
        <div
          style={{
            position: "absolute",
            bottom: -34,
            left: 120,
            width: 0,
            height: 0,
            borderLeft: "24px solid transparent",
            borderRight: "24px solid transparent",
            borderTop: "40px solid #fff",
          }}
        />
      </div>
    </div>
  );
};

// Шаңырақ — символ единства (рисуется штрихом)
const Shanyrak: React.FC<{ size: number; draw: number; spin?: number }> = ({ size, draw, spin = 0 }) => {
  const L = 700;
  const st = { fill: "none", stroke: GOLD, strokeWidth: 10, strokeLinecap: "round" as const, strokeDasharray: L, strokeDashoffset: L * (1 - draw) };
  return (
    <svg width={size} height={size} viewBox="-120 -120 240 240" style={{ transform: `rotate(${spin}deg)` }}>
      {/* уықтар — лучи от шаңырақа, как в юрте */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={Math.cos(a) * 104}
            y1={Math.sin(a) * 104}
            x2={Math.cos(a) * 118}
            y2={Math.sin(a) * 118}
            stroke={GOLD}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={draw}
          />
        );
      })}
      <circle r={100} {...st} />
      <circle r={86} {...st} strokeWidth={5} />
      {[-45, 0, 45].map((d) => (
        <g key={d}>
          <path d={`M${d},-86 Q${d * 1.6},0 ${d},86`} {...st} strokeWidth={8} />
          <path d={`M-86,${d} Q0,${d * 1.6} 86,${d}`} {...st} strokeWidth={8} />
        </g>
      ))}
    </svg>
  );
};

// Бейдж «1/3» для сцен жүзов
const Badge: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [4, 16], [0, 1], { ...clamp, easing: ease });
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 60,
        padding: "10px 26px",
        borderRadius: 40,
        border: `4px solid ${color}`,
        color,
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: 40,
        opacity: p,
        transform: `translateX(${(1 - p) * 60}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ---------- «вау»-графика ----------

const ZONE_COL = [KISHI, ORTA, ULY];

// Частицы: летят из хаоса в форму (карта → шаңырақ). Координаты точек — в системе карты.
const Particles: React.FC<{
  from: "scatter" | "map";
  to: "map" | "shanyrak";
  start: number; // кадр начала перелёта
  dur: number; // длительность перелёта
  x: number;
  y: number;
  scale: number;
  tint: [number, number, number]; // 0..1 окраска по зонам (Кіші, Орта, Ұлы)
  gold?: number; // 0..1 — всё в золото
  fade?: number; // общая прозрачность
  spin?: number; // поворот вокруг центра шаңырақа (град)
}> = ({ from, to, start, dur, x, y, scale, tint, gold = 0, fade = 1, spin = 0 }) => {
  const frame = useCurrentFrame();
  const rad = (spin * Math.PI) / 180;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {MAP_PTS.map(([mx, my, z], i) => {
        const delay = Math.floor(random(`d${i}`) * dur * 0.45);
        const t = interpolate(frame, [start + delay, start + delay + dur * 0.55], [0, 1], {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        });
        const sx =
          from === "scatter" ? random(`x${i}`) * 1400 - 160 : x + mx * scale;
        const sy =
          from === "scatter" ? random(`y${i}`) * 2200 - 140 : y + my * scale;
        let tx: number;
        let ty: number;
        if (to === "map") {
          tx = x + mx * scale;
          ty = y + my * scale;
        } else {
          const [qx, qy] = SHANYRAK_PTS[i];
          const ox = qx - 450;
          const oy = qy - 248;
          tx = x + (450 + ox * Math.cos(rad) - oy * Math.sin(rad)) * scale;
          ty = y + (248 + ox * Math.sin(rad) + oy * Math.cos(rad)) * scale;
        }
        // дуга полёта
        const arc = Math.sin(t * Math.PI) * (random(`a${i}`) - 0.5) * 220;
        const px = sx + (tx - sx) * t + arc;
        const py = sy + (ty - sy) * t - Math.abs(arc) * 0.4;
        const tw = 0.7 + 0.3 * Math.sin(frame / 5 + i);
        const zc = tint[z] > 0.5 ? ZONE_COL[z] : "#ffffff";
        const col = gold > 0.5 ? GOLD : zc;
        return (
          <circle
            key={i}
            cx={px}
            cy={py}
            r={(i < 260 ? 4.2 : 3.2) * (0.8 + t * 0.4)}
            fill={col}
            opacity={fade * tw * (0.35 + t * 0.65)}
          />
        );
      })}
    </svg>
  );
};

// Объёмная карта: наклон, активная зона «поднимается» из земли
const Map3D: React.FC<{ zone: 0 | 1 | 2 }> = ({ zone }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [6, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const tilt = interpolate(frame, [0, 20], [0, 34], { ...clamp, easing: ease });
  const swing = interpolate(frame, [0, 22], [-35, 0], { ...clamp, easing: ease });
  const drop = interpolate(frame, [0, 22], [-180, 0], { ...clamp, easing: ease });
  const sway = Math.sin(frame / 45) * 4;
  const color = ZONE_COL[zone];
  const dim: [number, number, number] = [1, 1, 1];
  dim[zone] = 0;
  const id = `z${zone}`;
  const layer = (dy: number, fill: string, key: string, op = 1) => (
    <svg
      key={key}
      width={MAP_W}
      height={MAP_H}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      style={{ position: "absolute", left: 0, top: dy, overflow: "visible", opacity: op }}
    >
      <defs>
        <clipPath id={`${id}c`}>
          <path d={KZ_PATH} />
        </clipPath>
        <mask id={`${id}m`}>
          {zone === 1 ? (
            <>
              <rect width={MAP_W} height={MAP_H} fill="#fff" />
              <polygon points={ZONE_KISHI} fill="#000" />
              <polygon points={ZONE_ULY} fill="#000" />
            </>
          ) : (
            <polygon points={zone === 0 ? ZONE_KISHI : ZONE_ULY} fill="#fff" />
          )}
        </mask>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width={MAP_W} height={MAP_H} fill={fill} mask={`url(#${id}m)`} />
      </g>
    </svg>
  );
  const H = 34; // высота «подъёма»
  return (
    <div style={{ position: "absolute", left: 90, top: 210, width: MAP_W, height: MAP_H, perspective: 1300 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `translateY(${drop}px) rotateY(${swing}deg) rotateX(${tilt}deg) rotateZ(${sway}deg)`,
          transformOrigin: "50% 60%",
        }}
      >
        <KzMap draw={1} fill={[1, 1, 1]} dim={dim} x={0} y={0} scale={1} labels={0} />
        {/* тень и «толщина» поднятой зоны */}
        {Array.from({ length: 8 }, (_, k) => layer(-(k / 8) * H * rise, "#0a0f1c", `s${k}`, 0.55))}
        {layer(-H * rise, color, "top")}
        <svg
          width={MAP_W}
          height={MAP_H}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ position: "absolute", left: 0, top: -H * rise, overflow: "visible" }}
        >
          <text
            x={[150, 470, 640][zone]}
            y={[260, 190, 400][zone]}
            textAnchor="middle"
            fontFamily="Montserrat"
            fontWeight={900}
            fontSize={42}
            fill="#fff"
            stroke={INK}
            strokeWidth={8}
            paintOrder="stroke"
            opacity={rise}
          >
            {["КІШІ ЖҮЗ", "ОРТА ЖҮЗ", "ҰЛЫ ЖҮЗ"][zone]}
          </text>
        </svg>
      </div>
    </div>
  );
};

// Ударная волна и лучи для ұрана
const Shock: React.FC<{ at: number; color: string }> = ({ at, color }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 40) return null;
  const ring = (k: number) => {
    const p = interpolate(t - k * 5, [0, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    return (
      <circle key={k} cx={0} cy={0} r={60 + p * 520} fill="none" stroke={k ? "#fff" : color} strokeWidth={14 * (1 - p)} opacity={1 - p} />
    );
  };
  const raysO = interpolate(t, [0, 4, 30], [0, 0.55, 0], clamp);
  return (
    <svg width={1200} height={1200} viewBox="-600 -600 1200 1200" style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -600, marginTop: -600, pointerEvents: "none", overflow: "visible" }}>
      <g transform={`rotate(${t * 1.5})`} opacity={raysO}>
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M0,0 L-30,-560 L30,-560 Z" fill="#fff" transform={`rotate(${i * 22.5})`} opacity={0.35} />
        ))}
      </g>
      {[0, 1].map(ring)}
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + random(`s${at}${i}`);
        const d = interpolate(t, [0, 26], [80, 300 + random(`q${at}${i}`) * 200], { ...clamp, easing: Easing.out(Easing.quad) });
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={6} fill={GOLD} opacity={interpolate(t, [0, 26], [1, 0], clamp)} />;
      })}
    </svg>
  );
};

// ---------- сцены ----------

// Ударный хук: с первого кадра — ұран «БАҚТИЯР!», тряска, волна, затем вопрос
const S0Shout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 260 } });
  const shake = frame < 12 ? Math.sin(frame * 2.7) * (12 - frame) * 2.2 : 0;
  const flash = interpolate(frame, [0, 2, 8], [0, 0.7, 0], clamp);
  return (
    <>
      {/* крик из сцены ұранов: «Бақтияр!» (09.mp3, 3,25–4,23 с) */}
      <Audio src={staticFile("ru/09.mp3")} trimBefore={f(3.2)} trimAfter={f(4.3)} volume={1.1} />
      <Audio src={staticFile("ru/sfx_impact.wav")} volume={0.7} />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <div style={{ position: "absolute", top: 640, left: 0, right: 0, height: 300 }}>
          <Shock at={1} color={ULY} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 660,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: 168,
            color: "#fff",
            transform: `scale(${Math.max(0.95, 1 + (1 - s) * 0.2)})`, // с 1-го кадра слово читается целиком
            textShadow: `0 8px 0 ${INK}, 0 0 60px ${ULY}`,
          }}
        >
          БАҚТИЯР!
        </div>
      </AbsoluteFill>
      <Sequence from={f(0.75)}>
        <Title y={930} size={64}>
          Бұл не деген <span style={{ color: GOLD }}>сөз?</span>
        </Title>
      </Sequence>
      <Sequence from={f(1.25)}>
        <Title y={1030} size={42} color="rgba(255,255,255,0.85)">
          Соңына дейін көр 👇
        </Title>
      </Sequence>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />
    </>
  );
};

const S1Hook: React.FC = () => (
  <>
    <Title y={300} size={76}>
      Қазақтар танысқанда
      <br />
      бірінші <span style={{ color: GOLD }}>не сұрайды?</span>
    </Title>
    <Person x={110} coat="#3c5a8a" talk={0} />
    <Person x={610} flip coat="#7a3b2e" talk={0} />
    <Bubble text="Қай рудансың?" delay={f(1.9)} />
  </>
);

const S2Ata: React.FC = () => {
  const frame = useCurrentFrame();
  const labels = ["Сен", "Әке", "Ата", "Арғы ата", "Баба", "Арғы баба", "Түп ата"];
  return (
    <>
      <Title y={200} size={92}>
        <span style={{ color: GOLD }}>ЖЕТІ АТА</span>
      </Title>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {labels.map((l, i) => {
          const y = 1500 - i * 160;
          const p = interpolate(frame, [8 + i * 7, 20 + i * 7], [0, 1], { ...clamp, easing: ease });
          return (
            <g key={l} opacity={p}>
              {i > 0 && (
                <line x1={540} y1={y + 46} x2={540} y2={y + 114} stroke={GOLD} strokeWidth={6} />
              )}
              <circle cx={540} cy={y} r={46 * p} fill={i === 0 ? GOLD : "#2f4672"} stroke={GOLD} strokeWidth={5} />
              <text x={540} y={y + 13} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={38} fill={i === 0 ? INK : "#fff"}>
                {i + 1}
              </text>
              <text x={610} y={y + 14} fontFamily="Montserrat" fontWeight={800} fontSize={40} fill="#fff">
                {l}
              </text>
            </g>
          );
        })}
      </svg>
      <Sequence from={f(2.6)}>
        <Title y={1640} size={46} color="rgba(255,255,255,0.9)">
          Жеті атаға толмай қыз алыспаған
        </Title>
      </Sequence>
    </>
  );
};

const S3Map: React.FC = () => {
  const frame = useCurrentFrame();
  // зоны вспыхивают на словах «Ұлы жүз, Орта жүз, Кіші жүз»
  const z = (t: number) => interpolate(frame, [f(t), f(t) + 8], [0, 1], clamp);
  const solid = interpolate(frame, [f(1.5), f(2.2)], [0, 1], clamp);
  return (
    <>
      <Title y={330} size={84}>
        <span style={{ color: GOLD }}>ҮШ</span> ЖҮЗ
      </Title>
      <Audio src={staticFile("ru/sfx_shimmer.wav")} volume={0.5} />
      <div style={{ opacity: solid }}>
        <KzMap draw={1} fill={[z(4.3), z(3.4), z(2.4)]} x={0} y={760} scale={1.2} labels={1} />
      </div>
      <Particles
        from="scatter"
        to="map"
        start={0}
        dur={f(1.8)}
        x={0}
        y={760}
        scale={1.2}
        tint={[z(4.3), z(3.4), z(2.4)]}
        fade={1 - solid * 0.7}
      />
    </>
  );
};

// Раскладка сцен жүзов: где проходит хребет/горизонт на иллюстрации
const ZONE_LAYOUT: Record<number, { bg: string; titleY: number; chipsTop: number; hole: [number, number] }> = {
  0: { bg: "kishi", titleY: 985, chipsTop: 1270, hole: [540, 960] },
  1: { bg: "orta", titleY: 1040, chipsTop: 1300, hole: [540, 960] },
  2: { bg: "uly", titleY: 830, chipsTop: 1150, hole: [540, 960] },
};
const SHADE =
  "linear-gradient(180deg, rgba(8,14,30,0.55) 0%, rgba(8,14,30,0.25) 45%, rgba(8,14,30,0.15) 65%, rgba(8,14,30,0.55) 100%)";

// Передний план иллюстрации (тот же цикл, вырезан маской хребта) — то, что закрывает надпись
const Foreground: React.FC<{ bg: string }> = ({ bg }) => (
  <AbsoluteFill
    style={{
      WebkitMaskImage: `url(${staticFile(`ru/matte_${bg}.png`)})`,
      maskImage: `url(${staticFile(`ru/matte_${bg}.png`)})`,
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
    }}
  >
    <Video src={staticFile(`ru/loop_${bg}.mp4`)} loop muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
    <AbsoluteFill style={{ background: SHADE }} />
  </AbsoluteFill>
);

// Огромная надпись, которая поднимается ИЗ-ЗА гор / горизонта
const BehindTitle: React.FC<{ text: string; y: number; color: string }> = ({ text, y, color }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [24, 52], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const glow = 0.6 + 0.4 * Math.sin(frame / 10);
  return (
    <div
      style={{
        position: "absolute",
        top: y + (1 - p) * 260,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: 172,
        letterSpacing: 4,
        lineHeight: 1,
        color,
        textShadow: `0 0 ${40 * glow}px ${color}aa, 0 10px 40px rgba(0,0,0,0.5)`,
      }}
    >
      {text}
    </div>
  );
};

// Портал: тёмный экран, в нём «дыра» формы жүза растёт из карты на весь кадр
const Portal: React.FC<{ zone: 0 | 1 | 2; cx: number; cy: number }> = ({ zone, cx, cy }) => {
  const frame = useCurrentFrame();
  // 0–10: окно формы жүза в центре; 10–30: окно раскрывается на весь кадр
  const k = interpolate(frame, [0, 10, 30], [0.6, 1.4, 18], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const edge = interpolate(frame, [0, 4, 24, 30], [0, 1, 1, 0], clamp);
  if (frame > 31) return null;
  // центр зоны в координатах карты
  const [zx, zy] = [[170, 270], [470, 200], [640, 400]][zone];
  const tr = `translate(${cx} ${cy}) scale(${k}) translate(${-zx} ${-zy})`;
  const shape =
    zone === 1 ? (
      <g transform={tr}>
        <path d={KZ_PATH} fill="#000" />
        <polygon points={ZONE_KISHI} fill="#fff" />
        <polygon points={ZONE_ULY} fill="#fff" />
      </g>
    ) : (
      <g transform={tr}>
        <clipPath id={`pc${zone}`}>
          <path d={KZ_PATH} />
        </clipPath>
        <polygon points={zone === 0 ? ZONE_KISHI : ZONE_ULY} fill="#000" clipPath={`url(#pc${zone})`} />
      </g>
    );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <mask id={`pm${zone}`}>
          <rect width={1080} height={1920} fill="#fff" />
          {shape}
        </mask>
      </defs>
      <rect width={1080} height={1920} fill="#0b1326" mask={`url(#pm${zone})`} />
      {/* золотая кромка портала */}
      <g transform={tr} opacity={edge}>
        <path
          d={zone === 1 ? KZ_PATH : ""}
          fill="none"
          stroke={GOLD}
          strokeWidth={4 / k}
        />
        {zone !== 1 && (
          <polygon
            points={zone === 0 ? ZONE_KISHI : ZONE_ULY}
            fill="none"
            stroke={GOLD}
            strokeWidth={4 / k}
            clipPath={`url(#pc${zone})`}
          />
        )}
      </g>
    </svg>
  );
};

const ZoneScene: React.FC<{
  zone: 0 | 1 | 2;
  title: string;
  where: string;
  clans: string[];
  chipsFrom: number;
  chipsStep: number;
  chipsAt?: number[];
  badge: string;
}> = ({ zone, title, where, clans, chipsFrom, chipsStep, chipsAt, badge }) => {
  const color = [KISHI, ORTA, ULY][zone];
  const L = ZONE_LAYOUT[zone];
  return (
    <>
      <BehindTitle text={title} y={L.titleY} color={color} />
      <Foreground bg={L.bg} />
      <Sequence from={22}>
        <Badge text={badge} color={color} />
        <Map3D zone={zone} />
      </Sequence>
      <Portal zone={zone} cx={L.hole[0]} cy={L.hole[1]} />
      <Title y={L.titleY - 80} size={44} delay={20} color="rgba(255,255,255,0.9)">
        {where}
      </Title>
      <Chips items={clans} color={color} from={chipsFrom} step={chipsStep} top={L.chipsTop} at={chipsAt} />
    </>
  );
};

// Ұран: три карточки, слово «впечатывается» в момент крика диктора
const S9Uran: React.FC<{ at: number[] }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows: [string, string, string][] = [
    ["ҰЛЫ ЖҮЗ", "БАҚТИЯР!", ULY],
    ["ОРТА ЖҮЗ", "АҚЖОЛ!", ORTA],
    ["КІШІ ЖҮЗ", "АЛАТАУ!", KISHI],
  ];
  return (
    <>
      <Title y={260} size={80}>
        Жүздердің <span style={{ color: GOLD }}>ұраны</span>
      </Title>
      {rows.map(([z, w, c], i) => {
        const d = f(at[i]);
        const card = interpolate(frame, [d - 10, d], [0, 1], { ...clamp, easing: ease });
        const s = spring({ frame: frame - d, fps, config: { damping: 9, stiffness: 220 } });
        const shake = frame >= d && frame < d + 8 ? Math.sin(frame * 3) * (8 - (frame - d)) : 0;
        return (
          <div key={z}>
          <Sequence from={d - 2} durationInFrames={60}>
            <Audio src={staticFile("ru/sfx_impact.wav")} volume={0.55} />
          </Sequence>
          {/* волна позади карточки */}
          <div style={{ position: "absolute", top: 520 + i * 380, left: 80, right: 80, height: 320 }}>
            <Shock at={d} color={c} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 520 + i * 380,
              left: 80,
              right: 80,
              height: 320,
              borderRadius: 36,
              background: c,
              opacity: card,
              transform: `translateX(${(1 - card) * (i % 2 ? 300 : -300)}px) translateX(${shake}px)`,
              boxShadow: "0 18px 50px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 40, color: INK, letterSpacing: 6 }}>
              {z}
            </div>
            <div
              style={{
                fontFamily: "Montserrat",
                fontWeight: 900,
                fontSize: 120,
                color: "#fff",
                transform: `scale(${interpolate(s, [0, 1], [2.2, 1])})`,
                opacity: Math.min(1, s * 2),
                textShadow: `0 6px 0 ${INK}`,
              }}
            >
              {w}
            </div>
          </div>
          </div>
        );
      })}
    </>
  );
};

// Простые иконки для мәтела
const Icon: React.FC<{ kind: "syrnai" | "qalam" | "naiza"; color: string }> = ({ kind, color }) => (
  <svg width={150} height={150} viewBox="0 0 100 100">
    {kind === "syrnai" && (
      <g fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
        <path d="M15,80 L70,25" />
        <path d="M70,25 Q85,12 90,20 Q95,30 80,35 Z" fill={color} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={28 + i * 10} cy={67 - i * 10} r={2.5} fill={color} />
        ))}
      </g>
    )}
    {kind === "qalam" && (
      <g fill={color}>
        <path d="M80,10 Q55,25 30,70 L25,85 L38,75 Q70,45 80,10 Z" />
        <path d="M25,85 L20,92" stroke={color} strokeWidth={4} />
      </g>
    )}
    {kind === "naiza" && (
      <g stroke={color} strokeWidth={6} strokeLinecap="round" fill={color}>
        <path d="M15,90 L72,28" />
        <path d="M72,28 L88,8 L78,34 Z" />
        <path d="M60,42 Q50,44 52,54" fill="none" strokeWidth={4} />
      </g>
    )}
  </svg>
);

// Мәтел: три строки с иконками, по фразам диктора
const S10Matel: React.FC<{ at: number[] }> = ({ at }) => {
  const frame = useCurrentFrame();
  const rows: ["syrnai" | "qalam" | "naiza", string, string, string][] = [
    ["syrnai", "Ұлы жүзге —", "сырнай беріп, қой бақтыр", ULY],
    ["qalam", "Орта жүзге —", "қалам беріп, дау шештір", ORTA],
    ["naiza", "Кіші жүзге —", "найза беріп, жау шаптыр", KISHI],
  ];
  return (
    <>
      <Title y={260} size={76}>
        Халық <span style={{ color: GOLD }}>мәтелі</span>
      </Title>
      {rows.map(([icon, a, b, c], i) => {
        const p = interpolate(frame, [f(at[i]), f(at[i]) + 14], [0, 1], { ...clamp, easing: ease });
        return (
          <div
            key={icon}
            style={{
              position: "absolute",
              top: 540 + i * 360,
              left: 70,
              right: 70,
              display: "flex",
              alignItems: "center",
              gap: 30,
              opacity: p,
              transform: `translateY(${(1 - p) * 50}px)`,
            }}
          >
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                border: `6px solid ${c}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
                flexShrink: 0,
                transform: `rotate(${(1 - p) * -40}deg)`,
              }}
            >
              <Icon kind={icon} color={c} />
            </div>
            <div style={{ fontFamily: "Montserrat", lineHeight: 1.15 }}>
              <div style={{ fontWeight: 900, fontSize: 56, color: c }}>{a}</div>
              <div style={{ fontWeight: 800, fontSize: 48, color: "#fff" }}>{b}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

const S7Out: React.FC = () => (
  <>
    <Title y={520} size={70}>
      Ешбір жүзге
      <br />
      <span style={{ color: GOLD }}>кірмейді</span>
    </Title>
    <Chips items={["Төре", "Қожа"]} color="#cfc6ff" from={f(0.6)} step={f(0.6)} top={900} big />
  </>
);

// Созвездие «АЛАШ»: звёзды в вершинах букв, линии рисуются как в звёздной карте
const LW = 150;
const LH = 220;
const LGAP = 50;
const CX0 = (1080 - (4 * LW + 3 * LGAP)) / 2;
const CY0 = 300;
// буквы в единичной системе 0..1 (x), 0..1 (y): [точки, отрезки]
const GLYPH: Record<string, [[number, number][], [number, number][]]> = {
  А: [[[0, 1], [0.5, 0], [1, 1], [0.22, 0.62], [0.78, 0.62]], [[0, 1], [1, 2], [3, 4]]],
  Л: [[[0, 1], [0.32, 0], [1, 0], [1, 1]], [[0, 1], [1, 2], [2, 3]]],
  Ш: [[[0, 0], [0, 1], [0.5, 1], [1, 1], [1, 0], [0.5, 0]], [[0, 1], [1, 2], [2, 3], [3, 4], [5, 2]]],
};
const CONST_STARS: [number, number][] = [];
const CONST_LINES: [number, number][] = [];
Array.from("АЛАШ").forEach((ch, li) => {
  const [pts, segs] = GLYPH[ch];
  const base = CONST_STARS.length;
  pts.forEach(([u, v]) => CONST_STARS.push([CX0 + li * (LW + LGAP) + u * LW, CY0 + v * LH]));
  segs.forEach(([a, b]) => CONST_LINES.push([base + a, base + b]));
});

const Constellation: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame() - start;
  if (frame < 0) return null;
  // шаңырақ рассыпается: звёзды летят из его центра (540, 578) к своим местам
  const fly = (i: number) =>
    interpolate(frame, [i * 0.8, i * 0.8 + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {CONST_LINES.map(([a, b], i) => {
        const [x1, y1] = CONST_STARS[a];
        const [x2, y2] = CONST_STARS[b];
        const len = Math.hypot(x2 - x1, y2 - y1);
        const d = interpolate(frame, [28 + i * 3, 40 + i * 3], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#ffe9b8"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={len}
            strokeDashoffset={len * (1 - d)}
            opacity={0.75}
            style={{ filter: "drop-shadow(0 0 6px #ffd27a)" }}
          />
        );
      })}
      {CONST_STARS.map(([x, y], i) => {
        const p = fly(i);
        const sx = 540 + (x - 540) * p;
        const sy = 578 + (y - 578) * p;
        const tw = 0.7 + 0.3 * Math.sin(frame / 4 + i * 1.7);
        const r = (5 + (i % 3) * 1.5) * tw;
        return (
          <g key={i} opacity={Math.min(1, p * 3)}>
            <circle cx={sx} cy={sy} r={r * 4} fill="#ffd27a" opacity={0.18} />
            <circle cx={sx} cy={sy} r={r} fill="#fff" />
            <path d={`M${sx - r * 3},${sy} L${sx + r * 3},${sy} M${sx},${sy - r * 3} L${sx},${sy + r * 3}`} stroke="#fff" strokeWidth={1.5} opacity={0.6 * tw} />
          </g>
        );
      })}
    </svg>
  );
};

const S8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const gold = interpolate(frame, [f(1.0), f(1.6)], [0, 1], clamp);
  const lock = interpolate(frame, [f(2.0), f(2.6)], [0, 1], clamp);
  const out = interpolate(frame, [f(3.0), f(3.5)], [1, 0], clamp); // шаңырақ рассыпается в звёзды
  const spin = frame * 0.35;
  const glow = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <>
      <Sequence from={f(0.4)} durationInFrames={f(2.5)}>
        <Audio src={staticFile("ru/sfx_shimmer.wav")} volume={0.5} />
      </Sequence>
      {/* карта из частиц складывается в шаңырақ */}
      <Particles
        from="map"
        to="shanyrak"
        start={f(0.5)}
        dur={f(1.8)}
        x={90}
        y={330}
        scale={1}
        tint={[1, 1, 1]}
        gold={gold}
        spin={spin}
        fade={out}
      />
      <div
        style={{
          position: "absolute",
          top: 330 + 248 - 220,
          left: 90 + 450 - 220,
          opacity: lock * out,
          transform: `scale(${1 + (1 - out) * 0.6})`,
          filter: `drop-shadow(0 0 ${12 + glow * 18}px ${GOLD})`,
        }}
      >
        <Shanyrak size={440} draw={lock} spin={spin} />
      </div>
      <Constellation start={f(3.0)} />
      <Sequence from={f(3.0)} durationInFrames={f(3)}>
        <Audio src={staticFile("ru/sfx_shimmer.wav")} volume={0.45} />
      </Sequence>
      <Sequence from={f(4.0)} durationInFrames={f(3)}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={f(5.2)}>
        <Title y={590} size={40} color="rgba(255,233,184,0.95)">
          Бәріміз — бір Алаштың баласымыз
        </Title>
      </Sequence>
      <Title y={940} size={88}>
        Рулар көп —
        <br />
        <span style={{ color: GOLD }}>халық біреу</span>
      </Title>
      <Sequence from={f(3.3)}>
        <Title y={1300} size={66}>
          Сен қай рудансың?
        </Title>
        <Title y={1400} size={48} delay={6} color="rgba(255,255,255,0.85)">
          Комментарийге жаз 👇
        </Title>
      </Sequence>
    </>
  );
};

// ---------- сборка ----------

// Фон-иллюстрация сцены: медленный подъём камеры, без наездов (масштаб постоянный),
// плюс затемнение сверху и снизу, чтобы карта и текст читались.
const Backdrop: React.FC<{ img: string }> = ({ img }) => {
  // ожившая иллюстрация: статичная камера, бесшовный цикл (public/ru/loop_*.mp4)
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        src={staticFile(`ru/loop_${img}.mp4`)}
        loop
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
      {SUN[img] && <SunFlare x={SUN[img][0]} y={SUN[img][1]} />}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,14,30,0.55) 0%, rgba(8,14,30,0.25) 45%, rgba(8,14,30,0.15) 65%, rgba(8,14,30,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Солнце на иллюстрации: тёплое свечение и горизонтальный блик (координаты в кадре 1080×1920)
const SUN: Record<string, [number, number]> = { orta: [493, 1232], kishi: [132, 1183] };
const SunFlare: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const pulse = 0.75 + 0.25 * Math.sin(frame / 14);
  return (
    <div style={{ position: "absolute", left: x - 400, top: y - 400, width: 800, height: 800, pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,190,90,${0.55 * pulse}) 0%, rgba(255,140,60,${0.18 * pulse}) 25%, rgba(0,0,0,0) 60%)` }} />
      <div style={{ position: "absolute", left: -300, right: -300, top: 396, height: 8, background: `linear-gradient(90deg, rgba(0,0,0,0), rgba(255,210,140,${0.5 * pulse}), rgba(0,0,0,0))`, filter: "blur(2px)" }} />
    </div>
  );
};

// Плёнка: зерно + виньетка (поверх всего)
const FilmLook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// Тёплая вспышка света на смене сцен
const LightLeak: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, 26], [0, 0.45, 0], clamp);
  const x = seed % 2 ? 1080 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: o }}>
      <div style={{ position: "absolute", left: x - 700, top: 200 + (seed * 377) % 1200, width: 1400, height: 1400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,170,80,0.9) 0%, rgba(255,90,40,0.35) 35%, rgba(0,0,0,0) 70%)" }} />
    </AbsoluteFill>
  );
};

// фон для каждой сцены по порядку SCENES
const BG = ["uly", "yurt", "yurt", "orta", "uly", "orta", "kishi", "kishi", "uly", "yurt", "yurt"];

const SceneWrap: React.FC<{ children: React.ReactNode; bg: string; first?: boolean }> = ({ children, bg, first }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // мягкий переход: плавное появление и угасание через фон
  const o = Math.min(
    first ? 1 : interpolate(frame, [0, 10], [0, 1], clamp), // первый кадр ролика — сразу в полную силу
    interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp),
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Backdrop img={bg} />
      {children}
    </AbsoluteFill>
  );
};

export const Ru: React.FC = () => {
  const views = [
    <S0Shout key="0" />,
    <S1Hook key="1" />,
    <S2Ata key="2" />,
    <S3Map key="3" />,
    <ZoneScene
      key="4"
      zone={2}
      badge="1 / 3"
      title="ҰЛЫ ЖҮЗ"
      where="Жетісу мен оңтүстік"
      clans={["Үйсін", "Дулат", "Албан", "Суан", "Шапырашты", "Ысты", "Ошақты", "Жалайыр", "Қаңлы"]}
      chipsFrom={f(2.3)}
      chipsStep={f(0.6)}
      // начало каждого названия в 04.mp3 (silencedetect)
      chipsAt={[3.2, 4.15, 5.18, 5.9, 6.85, 8.01, 8.87, 9.84, 10.89].map(f)}
    />,
    <ZoneScene
      key="5"
      zone={1}
      badge="2 / 3"
      title="ОРТА ЖҮЗ"
      where="Сарыарқа мен шығыс"
      clans={["Арғын", "Найман", "Керей", "Уақ", "Қыпшақ", "Қоңырат"]}
      chipsFrom={f(2.6)}
      chipsStep={f(0.72)}
    />,
    <ZoneScene
      key="6"
      zone={0}
      badge="3 / 3"
      title="КІШІ ЖҮЗ"
      where="Батыс өңір"
      clans={["Әлімұлы", "Байұлы", "Жетіру"]}
      chipsFrom={f(1.7)}
      chipsStep={f(0.8)}
    />,
    <S7Out key="7" />,
    <S9Uran key="9" at={URAN_AT} />,
    <S10Matel key="10" at={MATEL_AT} />,
    <S8Outro key="8" />,
  ];
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map((s, i) => (
        <Sequence key={s.id} name={`S${s.id}`} from={starts[i]} durationInFrames={lens[i]}>
          <SceneWrap bg={BG[i]} first={i === 0}>{views[i]}</SceneWrap>
          {s.has && <Audio src={staticFile(`ru/${s.id}.mp3`)} />}
          {i > 0 && <Audio src={staticFile("sfx/whoosh.wav")} volume={0.08} />}
        </Sequence>
      ))}
      {starts.slice(1).map((st, i) => (
        <Sequence key={`leak${st}`} from={st - 6} durationInFrames={28}>
          <LightLeak seed={i} />
        </Sequence>
      ))}
      <FilmLook />
      <Audio
        src={staticFile("ru/music.mp3")}
        volume={(fr) =>
          interpolate(fr, [0, 20, RU_DURATION - 45, RU_DURATION], [0, 0.22, 0.22, 0], clamp)
        }
      />
    </AbsoluteFill>
  );
};

// Обложка для Reels: надпись за горами Алатау, карта жүзов сверху
export const RuCover: React.FC = () => {
  const mask = {
    WebkitMaskImage: `url(${staticFile("ru/matte_uly.png")})`,
    maskImage: `url(${staticFile("ru/matte_uly.png")})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
  const bg = (
    <>
      <Img src={staticFile("ru/bg_uly.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
      <AbsoluteFill style={{ background: SHADE }} />
    </>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: BG1 }}>
      <AbsoluteFill>{bg}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 790,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Montserrat",
          fontWeight: 900,
          lineHeight: 0.95,
          color: GOLD,
          textShadow: `0 0 40px ${GOLD}99, 0 10px 40px rgba(0,0,0,0.5)`,
        }}
      >
        <div style={{ fontSize: 118, color: "#fff" }}>ҚАЗАҚТЫҢ</div>
        <div style={{ fontSize: 190 }}>РУЛАРЫ</div>
      </div>
      <AbsoluteFill style={mask}>{bg}</AbsoluteFill>
      <KzMap draw={1} fill={[1, 1, 1]} x={140} y={170} scale={0.9} labels={1} />
      <div
        style={{
          position: "absolute",
          bottom: 250,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {(
          [
            ["ҰЛЫ ЖҮЗ", ULY],
            ["ОРТА ЖҮЗ", ORTA],
            ["КІШІ ЖҮЗ", KISHI],
          ] as const
        ).map(([t, c]) => (
          <div
            key={t}
            style={{
              background: c,
              color: INK,
              fontFamily: "Montserrat",
              fontWeight: 900,
              fontSize: 40,
              padding: "14px 26px",
              borderRadius: 50,
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Montserrat",
          fontWeight: 800,
          fontSize: 46,
          color: "#fff",
          textShadow: "0 4px 18px rgba(0,0,0,0.8)",
        }}
      >
        Сен қай рудансың? 👇
      </div>
    </AbsoluteFill>
  );
};
