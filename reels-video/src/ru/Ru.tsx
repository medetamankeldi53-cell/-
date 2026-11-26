import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { CITIES, KZ_PATH, MAP_H, MAP_W, ZONE_KISHI, ZONE_ULY } from "./map";

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
  { id: "01", dur: 3.76, has: true }, // хук
  { id: "02", dur: 5.12, has: true }, // жеті ата
  { id: "03", dur: 5.52, has: true }, // үш жүз
  { id: "04", dur: 8.0, has: false }, // Ұлы жүз
  { id: "05", dur: 7.36, has: true }, // Орта жүз
  { id: "06", dur: 4.8, has: true }, // Кіші жүз
  { id: "07", dur: 3.2, has: false }, // төре, қожа
  { id: "08", dur: 5.0, has: false }, // финал
];
const lens = SCENES.map((s) => f(s.dur + PAD));
const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
export const RU_DURATION = lens.reduce((a, b) => a + b, 0) + f(1.0);

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
}> = ({ draw, fill, dim = [0, 0, 0], x, y, scale, labels = 0, cities = 0 }) => {
  const len = 4200;
  const op = (i: number) => fill[i] * (1 - dim[i] * 0.75);
  return (
    <svg
      width={MAP_W * scale}
      height={MAP_H * scale}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      style={{ position: "absolute", left: x, top: y, overflow: "visible" }}
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
const Chip: React.FC<{ text: string; color: string; delay: number; big?: boolean }> = ({
  text,
  color,
  delay,
  big,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <div
      style={{
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 1.5),
        background: color,
        color: INK,
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: big ? 64 : 50,
        padding: big ? "22px 44px" : "16px 32px",
        borderRadius: 60,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      {text}
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
}> = ({ items, color, from, step, top, big }) => (
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
      <Chip key={t} text={t} color={color} delay={from + i * step} big={big} />
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

// ---------- сцены ----------

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
  const draw = interpolate(frame, [0, f(1.4)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // зоны вспыхивают на словах «Ұлы жүз, Орта жүз, Кіші жүз»
  const z = (t: number) => interpolate(frame, [f(t), f(t) + 8], [0, 1], clamp);
  return (
    <>
      <Title y={330} size={84}>
        <span style={{ color: GOLD }}>ҮШ</span> ЖҮЗ
      </Title>
      <KzMap
        draw={draw}
        fill={[z(4.3), z(3.4), z(2.4)]}
        x={0}
        y={760}
        scale={1.2}
        labels={1}
      />
    </>
  );
};

const ZoneScene: React.FC<{
  zone: 0 | 1 | 2;
  title: string;
  where: string;
  clans: string[];
  chipsFrom: number;
  chipsStep: number;
}> = ({ zone, title, where, clans, chipsFrom, chipsStep }) => {
  const color = [KISHI, ORTA, ULY][zone];
  const dim: [number, number, number] = [1, 1, 1];
  dim[zone] = 0;
  return (
    <>
      <KzMap draw={1} fill={[1, 1, 1]} dim={dim} x={90} y={170} scale={1} labels={1} />
      <Title y={760} size={96} color={color}>
        {title}
      </Title>
      <Title y={880} size={44} delay={5} color="rgba(255,255,255,0.85)">
        {where}
      </Title>
      <Chips items={clans} color={color} from={chipsFrom} step={chipsStep} top={1020} />
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
    <Chips items={["Төре", "Қожа"]} color="#cfc6ff" from={f(0.5)} step={f(0.5)} top={900} big />
  </>
);

const S8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const merge = interpolate(frame, [f(0.3), f(1.6)], [0, 1], { ...clamp, easing: ease });
  return (
    <>
      <svg
        width={MAP_W * 1.1}
        height={MAP_H * 1.1}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        style={{ position: "absolute", left: 45, top: 300 }}
      >
        <path d={KZ_PATH} fill={GOLD} opacity={0.25 + merge * 0.75} stroke="#fff" strokeWidth={4} />
      </svg>
      <Title y={940} size={88}>
        Рулар көп —
        <br />
        <span style={{ color: GOLD }}>халық біреу</span>
      </Title>
      <Sequence from={f(2.4)}>
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

const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const Ru: React.FC = () => {
  const views = [
    <S1Hook key="1" />,
    <S2Ata key="2" />,
    <S3Map key="3" />,
    <ZoneScene
      key="4"
      zone={2}
      title="ҰЛЫ ЖҮЗ"
      where="Жетісу мен оңтүстік"
      clans={["Үйсін", "Дулат", "Албан", "Суан", "Шапырашты", "Ысты", "Ошақты", "Жалайыр", "Қаңлы"]}
      chipsFrom={f(2.3)}
      chipsStep={f(0.6)}
    />,
    <ZoneScene
      key="5"
      zone={1}
      title="ОРТА ЖҮЗ"
      where="Сарыарқа мен шығыс"
      clans={["Арғын", "Найман", "Керей", "Уақ", "Қыпшақ", "Қоңырат"]}
      chipsFrom={f(2.6)}
      chipsStep={f(0.72)}
    />,
    <ZoneScene
      key="6"
      zone={0}
      title="КІШІ ЖҮЗ"
      where="Батыс өңір"
      clans={["Әлімұлы", "Байұлы", "Жетіру"]}
      chipsFrom={f(1.7)}
      chipsStep={f(0.8)}
    />,
    <S7Out key="7" />,
    <S8Outro key="8" />,
  ];
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map((s, i) => (
        <Sequence key={s.id} name={`S${s.id}`} from={starts[i]} durationInFrames={lens[i]}>
          <SceneWrap>{views[i]}</SceneWrap>
          {s.has && <Audio src={staticFile(`ru/${s.id}.mp3`)} />}
          {i > 0 && <Audio src={staticFile("sfx/whoosh.wav")} volume={0.25} />}
        </Sequence>
      ))}
      <Audio src={staticFile("sfx/drone.wav")} volume={0.12} loop />
    </AbsoluteFill>
  );
};
