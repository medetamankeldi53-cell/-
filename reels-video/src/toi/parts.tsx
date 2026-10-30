import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Agent, C, clamp, Medet, MedetPose, Skyline } from "../flat/characters";
import "../fonts";

export const GOLD = "#f2c14e";

export const pop = (frame: number, at = 0, len = 8) =>
  interpolate(frame, [at, at + len], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.8)),
  });

export const POSE: MedetPose = {
  mouth: 0,
  surprise: 0,
  typing: 0,
  shrug: 0,
  wave: 0,
  lookX: 0,
};

// Сцена в 1080×1920: SVG-холст с лёгким «дыханием» камеры
export const Stage: React.FC<{
  bg?: string;
  zoom?: number;
  children: React.ReactNode;
}> = ({ bg = "#1d2244", zoom = 0, children }) => {
  const frame = useCurrentFrame();
  const z = 1 + zoom * interpolate(frame, [0, 150], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <svg
        viewBox="0 0 1080 1920"
        width="100%"
        height="100%"
        style={{ position: "absolute", scale: String(z) }}
      >
        {children}
      </svg>
    </AbsoluteFill>
  );
};

// Вращающиеся лучи (фон «презентации» агентов)
export const Rays: React.FC<{ a: string; b: string }> = ({ a, b }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`rotate(${frame * 0.6} 540 820)`}>
      <circle cx={540} cy={820} r={1500} fill={a} />
      {new Array(16).fill(0).map((_, i) => (
        <path
          key={i}
          d="M 540 820 L 2540 690 L 2540 950 Z"
          fill={b}
          transform={`rotate(${i * 22.5} 540 820)`}
        />
      ))}
    </g>
  );
};

// Ночная комната с окном
export const Room: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect width={1080} height={1920} fill="#1d2244" />
    <rect x={130} y={210} width={820} height={680} rx={14} fill="#3b2c2a" />
    <defs>
      <clipPath id="roomwin">
        <rect x={150} y={230} width={780} height={640} />
      </clipPath>
      <linearGradient id="roomsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b2152" />
        <stop offset="1" stopColor="#4a3a7a" />
      </linearGradient>
    </defs>
    <g clipPath="url(#roomwin)">
      <rect x={150} y={230} width={780} height={640} fill="url(#roomsky)" />
      <circle cx={820} cy={330} r={46} fill="#fff4d6" />
      <g transform="translate(150 250)">
        <Skyline frame={frame} />
      </g>
    </g>
    <rect x={530} y={230} width={20} height={640} fill="#3b2c2a" />
    <rect x={0} y={1360} width={1080} height={60} fill="#8a5432" />
    <rect x={0} y={1420} width={1080} height={500} fill="#5e3822" />
  </g>
);

// Тойхана: бордовые стены, золотые гирлянды, люстра
export const Hall: React.FC<{ frame: number; dim?: number }> = ({
  frame,
  dim = 0,
}) => (
  <g>
    <rect width={1080} height={1920} fill="#6d1d36" />
    <rect y={1180} width={1080} height={740} fill="#4a1426" />
    {[0, 1, 2, 3].map((i) => (
      <path
        key={i}
        d={`M ${-40 + i * 300} 260 Q ${110 + i * 300} ${400 + Math.sin(frame / 20 + i) * 8} ${260 + i * 300} 260`}
        stroke={GOLD}
        strokeWidth={10}
        fill="none"
      />
    ))}
    {new Array(14).fill(0).map((_, i) => (
      <circle
        key={i}
        cx={40 + i * 75}
        cy={330 + Math.sin(i) * 40}
        r={9}
        fill={i % 2 ? "#ffe08a" : "#ff9db0"}
        opacity={0.5 + 0.5 * Math.abs(Math.sin(frame / 8 + i))}
      />
    ))}
    {/* люстра */}
    <rect x={536} y={0} width={8} height={140} fill={GOLD} />
    <path d="M 420 150 Q 540 260 660 150 Z" fill={GOLD} />
    {[440, 490, 540, 590, 640].map((x, i) => (
      <circle key={i} cx={x} cy={175 + (i % 2) * 18} r={14} fill="#fff6c8" />
    ))}
    <rect width={1080} height={1920} fill="#000" opacity={dim} />
  </g>
);

// Агент в точке (x, y) — y это «пол» под ногами
export const At: React.FC<{
  x: number;
  y: number;
  s?: number;
  children: React.ReactNode;
}> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{children}</g>
);

export const Bot: React.FC<{
  frame: number;
  size?: number;
  seed?: number;
  hop?: number;
  wave?: boolean;
  hat?: "detective" | "police" | "headset";
}> = ({ frame, size = 160, seed = 0, hop = 0, wave, hat }) => {
  const h = hop * Math.max(0, Math.sin((frame + seed * 9) / 5)) * 26;
  return (
    <g transform={`translate(0 ${-h})`}>
      <Agent frame={frame} size={size} seed={seed} wave={wave} hat={hat} />
    </g>
  );
};

// Медет (или брат) в точке; ноги скрыты — рисуем от пояса
export const Person: React.FC<{
  frame: number;
  x: number;
  y: number;
  s?: number;
  pose?: Partial<MedetPose>;
  brother?: boolean;
}> = ({ frame, x, y, s = 1, pose = {}, brother }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Medet
      frame={frame}
      pose={{ ...POSE, ...pose }}
      look={
        brother
          ? { shirt: "#3f6db0", shirtShade: "#335a93", beard: false }
          : undefined
      }
    />
  </g>
);

// Наклейка-заголовок (как в «Агенттер»)
export const Tag: React.FC<{
  frame: number;
  at?: number;
  x: number;
  y: number;
  rotate?: number;
  size?: number;
  color?: string;
  children: React.ReactNode;
}> = ({
  frame,
  at = 0,
  x,
  y,
  rotate = -4,
  size = 64,
  color = "#fff",
  children,
}) => {
  const p = pop(frame, at);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        rotate: `${rotate}deg`,
        scale: String(p),
        backgroundColor: color,
        border: `7px solid ${C.ink}`,
        boxShadow: `10px 10px 0 ${C.ink}`,
        padding: "12px 30px",
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: size,
        color: C.ink,
        whiteSpace: "nowrap",
        textAlign: "center",
        lineHeight: 1.1,
      }}
    >
      {children}
    </div>
  );
};

// Реплика в пузыре
export const Say: React.FC<{
  frame: number;
  at?: number;
  x: number;
  y: number;
  dark?: boolean;
  children: React.ReactNode;
}> = ({ frame, at = 0, x, y, dark, children }) => {
  const p = pop(frame, at, 7);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -100%",
        scale: String(p),
        backgroundColor: dark ? C.ink : "#fff",
        color: dark ? "#fff" : C.ink,
        border: `6px solid ${C.ink}`,
        borderRadius: 36,
        padding: "18px 32px",
        fontFamily: "Montserrat",
        fontWeight: 900,
        fontSize: 50,
        whiteSpace: "nowrap",
        boxShadow: "8px 8px 0 rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
};
