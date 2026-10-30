import { interpolate, random } from "remotion";

// Плоские (2D flat) персонажи на SVG. Всё рисуется кодом, без картинок.

export const C = {
  skin: "#d9a477",
  skinShade: "#c48f63",
  hair: "#1d1a1f",
  shirt: "#6f7d3c",
  shirtShade: "#5c6831",
  gold: "#e0b45a",
  pants: "#efe6d2",
  orange: "#ff8a3d",
  orangeTop: "#ffad73",
  orangeSide: "#e06f25",
  ink: "#141218",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Моргание: короткое закрытие глаз раз в ~3 секунды
const blink = (frame: number, seed: number) => {
  const t = (frame + seed * 37) % 95;
  return t < 4 ? interpolate(t, [0, 2, 4], [1, 0.1, 1]) : 1;
};

export type MedetPose = {
  mouth: number; // 0 — закрыт, 1 — широко открыт
  surprise: number; // 0..1 — брови вверх, глаза шире
  typing: number; // 0..1 — руки бегают по клавиатуре
  shrug: number; // 0..1 — плечи и руки вверх
  wave: number; // 0..1 — правая рука машет
  lookX: number; // -1..1 — куда смотрят зрачки
};

// Медет: вид спереди, сидит за столом (видна верхняя часть тела)
// Внешность: по умолчанию Медет; для младшего брата — другая рубашка и без бороды
export type Look = { shirt?: string; shirtShade?: string; beard?: boolean };

export const Medet: React.FC<{
  frame: number;
  pose: MedetPose;
  look?: Look;
}> = ({ frame, pose, look = {} }) => {
  const shirt = look.shirt ?? C.shirt;
  const shirtShade = look.shirtShade ?? C.shirtShade;
  const beard = look.beard ?? true;
  const { mouth, surprise, typing, shrug, wave, lookX } = pose;
  const b = blink(frame, 1);
  const breathe = Math.sin(frame / 18) * 3;
  const tapL = typing * Math.abs(Math.sin(frame / 2.2)) * 14;
  const tapR = typing * Math.abs(Math.sin(frame / 2.2 + 1.3)) * 14;
  const sh = shrug * 26;
  const eyeR = 13 + surprise * 4;
  const brow = surprise * 16 + shrug * 8;
  const px = lookX * 6;
  // правая рука (зрителю слева) — машет
  const waveAng = wave * (Math.sin(frame / 3) * 18 + 140);

  return (
    <g transform={`translate(0 ${breathe})`}>
      {/* шея */}
      <rect
        x={-34}
        y={-150}
        width={68}
        height={70}
        rx={20}
        fill={C.skinShade}
      />
      {/* торс */}
      <path
        d={`M -170 ${-60 - sh} Q -175 -95 -110 -105 L 110 -105 Q 175 -95 170 ${-60 - sh} L 185 260 L -185 260 Z`}
        fill={shirt}
      />
      {/* планка-воротник стойка */}
      <path d="M -52 -108 L 52 -108 L 46 -78 L -46 -78 Z" fill={shirtShade} />
      <path
        d="M 0 -78 L 28 -78 L 28 60 L 0 60 Z"
        fill={shirtShade}
        opacity={0.55}
      />
      <circle cx={14} cy={-20} r={6} fill={shirtShade} />
      <circle cx={14} cy={30} r={6} fill={shirtShade} />

      {/* левая рука (зрителю справа) — печатает или пожимает плечами */}
      <g>
        <path
          d={`M 150 ${-60 - sh} Q ${215 + shrug * 30} ${40 - sh * 2} ${150 + shrug * 70} ${170 - tapR - shrug * 150}`}
          stroke={shirt}
          strokeWidth={70}
          strokeLinecap="round"
          fill="none"
        />
        <path d="M 168 30 l 14 -16 l 14 16 l -14 16 Z" fill={C.gold} />
        <circle
          cx={150 + shrug * 70}
          cy={182 - tapR - shrug * 150}
          r={30}
          fill={C.skin}
        />
      </g>

      {/* правая рука (зрителю слева) — печатает или машет */}
      <g transform={`rotate(${waveAng} -150 ${-60 - sh})`}>
        <path
          d={`M -150 ${-60 - sh} Q ${-215 - shrug * 30} ${40 - sh * 2} ${-150 - shrug * 70} ${170 - tapL - shrug * 150}`}
          stroke={shirt}
          strokeWidth={70}
          strokeLinecap="round"
          fill="none"
        />
        <circle
          cx={-150 - shrug * 70}
          cy={182 - tapL - shrug * 150}
          r={30}
          fill={C.skin}
        />
      </g>

      {/* голова */}
      <g transform="translate(0 -250)">
        <ellipse cx={-118} cy={10} rx={22} ry={30} fill={C.skinShade} />
        <ellipse cx={118} cy={10} rx={22} ry={30} fill={C.skinShade} />
        <ellipse cx={0} cy={0} rx={118} ry={135} fill={C.skin} />
        {/* волосы: зачёсаны назад */}
        <path
          d="M -118 -10 Q -128 -150 0 -150 Q 128 -150 118 -10 Q 108 -95 40 -100 Q 0 -122 -50 -96 Q -108 -88 -118 -10 Z"
          fill={C.hair}
        />
        <path
          d="M -40 -118 Q 10 -138 70 -112"
          stroke="#3a3540"
          strokeWidth={6}
          fill="none"
        />
        {/* брови */}
        <rect
          x={-78}
          y={-40 - brow}
          width={52}
          height={11}
          rx={5}
          fill={C.hair}
          transform={`rotate(${-surprise * 6} -52 ${-35 - brow})`}
        />
        <rect
          x={26}
          y={-40 - brow}
          width={52}
          height={11}
          rx={5}
          fill={C.hair}
          transform={`rotate(${surprise * 6} 52 ${-35 - brow})`}
        />
        {/* глаза */}
        <g transform={`translate(-50 0) scale(1 ${b})`}>
          <ellipse cx={0} cy={0} rx={eyeR + 6} ry={eyeR} fill="#fff" />
          <circle cx={px} cy={1} r={eyeR * 0.62} fill={C.ink} />
          <circle cx={px + 3} cy={-3} r={3} fill="#fff" />
        </g>
        <g transform={`translate(50 0) scale(1 ${b})`}>
          <ellipse cx={0} cy={0} rx={eyeR + 6} ry={eyeR} fill="#fff" />
          <circle cx={px} cy={1} r={eyeR * 0.62} fill={C.ink} />
          <circle cx={px + 3} cy={-3} r={3} fill="#fff" />
        </g>
        {/* нос */}
        <path
          d="M 0 10 Q 14 42 -4 46"
          stroke={C.skinShade}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
        {/* борода и усы */}
        {beard ? (
          <>
            <path
              d="M -78 62 Q -70 128 0 136 Q 70 128 78 62 Q 50 98 0 100 Q -50 98 -78 62 Z"
              fill={C.hair}
            />
            <path
              d="M -44 62 Q 0 46 44 62 Q 22 70 0 66 Q -22 70 -44 62 Z"
              fill={C.hair}
            />
          </>
        ) : null}
        {/* рот */}
        <ellipse
          cx={0}
          cy={82}
          rx={22 + mouth * 6}
          ry={3 + mouth * 20}
          fill="#5a2320"
        />
        {mouth > 0.3 ? (
          <rect
            x={-14}
            y={70 - mouth * 4}
            width={28}
            height={7}
            rx={3}
            fill="#fff"
          />
        ) : null}
      </g>
    </g>
  );
};

// Агент: оранжевый кубик. squash — сплющивание при прыжке, wave — машет лапкой
export const Agent: React.FC<{
  frame: number;
  size?: number;
  seed?: number;
  squash?: number;
  wave?: boolean;
  hat?: "detective" | "police" | "headset";
}> = ({ frame, size = 120, seed = 0, squash = 0, wave = false, hat }) => {
  const s = size;
  const b = blink(frame, seed + 3);
  const lx = Math.sin((frame + seed * 13) / 9) * 2;
  const arm = wave
    ? Math.sin(frame / 3) * 30 - 30
    : Math.sin((frame + seed * 7) / 6) * 10;
  return (
    <g transform={`scale(${1 + squash * 0.18} ${1 - squash * 0.18})`}>
      {/* ножки */}
      <rect
        x={-s * 0.28}
        y={-s * 0.05}
        width={s * 0.12}
        height={s * 0.3}
        rx={s * 0.05}
        fill={C.orangeSide}
      />
      <rect
        x={s * 0.16}
        y={-s * 0.05}
        width={s * 0.12}
        height={s * 0.3}
        rx={s * 0.05}
        fill={C.orangeSide}
      />
      {/* ручки */}
      <rect
        x={-s * 0.62}
        y={-s * 0.55}
        width={s * 0.12}
        height={s * 0.32}
        rx={s * 0.05}
        fill={C.orangeSide}
        transform={`rotate(${20} ${-s * 0.5} ${-s * 0.5})`}
      />
      <rect
        x={s * 0.5}
        y={-s * 0.55}
        width={s * 0.12}
        height={s * 0.32}
        rx={s * 0.05}
        fill={C.orangeSide}
        transform={`rotate(${arm} ${s * 0.5} ${-s * 0.52})`}
      />
      {/* тело: передняя грань + верхняя */}
      <path
        d={`M ${-s / 2} ${-s * 0.95} L ${-s * 0.36} ${-s * 1.12} L ${s * 0.64} ${-s * 1.12} L ${s / 2} ${-s * 0.95} Z`}
        fill={C.orangeTop}
      />
      <path
        d={`M ${s / 2} ${-s * 0.95} L ${s * 0.64} ${-s * 1.12} L ${s * 0.64} ${-s * 0.17} L ${s / 2} 0 Z`}
        fill={C.orangeSide}
      />
      <rect
        x={-s / 2}
        y={-s * 0.95}
        width={s}
        height={s * 0.95}
        rx={s * 0.08}
        fill={C.orange}
      />
      {/* глаза */}
      <g transform={`translate(${lx} 0)`}>
        <rect
          x={-s * 0.24}
          y={-s * 0.62}
          width={s * 0.11}
          height={s * 0.2 * b}
          rx={s * 0.04}
          fill={C.ink}
        />
        <rect
          x={s * 0.12}
          y={-s * 0.62}
          width={s * 0.11}
          height={s * 0.2 * b}
          rx={s * 0.04}
          fill={C.ink}
        />
      </g>
      {hat === "detective" ? (
        <g>
          <ellipse
            cx={s * 0.07}
            cy={-s * 1.1}
            rx={s * 0.6}
            ry={s * 0.1}
            fill="#7a5a3a"
          />
          <path
            d={`M ${-s * 0.32} ${-s * 1.1} Q ${s * 0.07} ${-s * 1.6} ${s * 0.46} ${-s * 1.1} Z`}
            fill="#8d6a46"
          />
        </g>
      ) : null}
      {hat === "police" ? (
        <g>
          <rect
            x={-s * 0.44}
            y={-s * 1.32}
            width={s * 1.0}
            height={s * 0.26}
            rx={s * 0.06}
            fill="#26355e"
          />
          <rect
            x={-s * 0.5}
            y={-s * 1.1}
            width={s * 1.14}
            height={s * 0.07}
            rx={s * 0.03}
            fill="#111"
          />
          <circle cx={s * 0.07} cy={-s * 1.2} r={s * 0.06} fill={C.gold} />
        </g>
      ) : null}
      {hat === "headset" ? (
        <g>
          <path
            d={`M ${-s * 0.48} ${-s * 0.7} Q ${s * 0.07} ${-s * 1.6} ${s * 0.62} ${-s * 0.7}`}
            stroke="#333"
            strokeWidth={s * 0.06}
            fill="none"
          />
          <rect
            x={-s * 0.58}
            y={-s * 0.78}
            width={s * 0.14}
            height={s * 0.22}
            rx={s * 0.05}
            fill="#333"
          />
        </g>
      ) : null}
    </g>
  );
};

// Ночной город за окном: окна в зданиях мерцают
export const Skyline: React.FC<{ frame: number }> = ({ frame }) => {
  const buildings = new Array(9).fill(0).map((_, i) => ({
    x: i * 100 - 20 + random(`bx${i}`) * 30,
    w: 70 + random(`bw${i}`) * 40,
    h: 180 + random(`bh${i}`) * 260,
  }));
  return (
    <g>
      {buildings.map((bd, i) => (
        <g key={i}>
          <rect
            x={bd.x}
            y={620 - bd.h}
            width={bd.w}
            height={bd.h}
            fill={i % 2 ? "#232a52" : "#2b3463"}
          />
          {new Array(Math.floor(bd.h / 34)).fill(0).map((__, r) =>
            new Array(3).fill(0).map((___, c) => {
              const on = random(`w${i}-${r}-${c}`) > 0.45;
              const tw =
                random(`t${i}-${r}-${c}-${Math.floor(frame / 40)}`) > 0.93;
              return on !== tw ? (
                <rect
                  key={`${r}-${c}`}
                  x={bd.x + 10 + (c * (bd.w - 20)) / 3}
                  y={620 - bd.h + 16 + r * 34}
                  width={12}
                  height={16}
                  fill="#ffd27a"
                  opacity={0.85}
                />
              ) : null;
            }),
          )}
        </g>
      ))}
    </g>
  );
};

export { clamp };
