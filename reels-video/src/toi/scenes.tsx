import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { C, clamp, Medet } from "../flat/characters";
import {
  At,
  Bot,
  GOLD,
  Hall,
  Person,
  pop,
  POSE,
  Rays,
  Room,
  Say,
  Stage,
  Tag,
} from "./parts";

const talk = (f: number, from: number, to: number) =>
  f >= from && f < to ? Math.abs(Math.sin((f - from) / 2.6)) : 0;

// 1. «Інім үйленетін болды. Той — бір айдан кейін»
export const SceneNews: React.FC = () => {
  const f = useCurrentFrame();
  const card = pop(f, 73, 10);
  return (
    <AbsoluteFill>
      <Stage zoom={0.04}>
        <Room frame={f} />
        <Person
          frame={f}
          x={330}
          y={1180}
          s={0.85}
          pose={{ mouth: talk(f, 0, 64), lookX: 1 }}
        />
        <Person
          frame={f}
          x={790}
          y={1200}
          s={0.8}
          brother
          pose={{ wave: interpolate(f, [10, 18], [0, 1], clamp), lookX: -0.6 }}
        />
        {new Array(6).fill(0).map((_, i) => {
          const t = (f - 14 - i * 6) / 40;
          if (t < 0 || t > 1) return null;
          return (
            <path
              key={i}
              d="M 0 0 C -30 -30 -60 10 0 50 C 60 10 30 -30 0 0 Z"
              fill="#ff5d7a"
              transform={`translate(${790 + Math.sin(i * 2) * 120} ${700 - t * 400}) scale(${0.8 + t * 0.6})`}
              opacity={1 - t}
            />
          );
        })}
        {/* открытка-приглашение */}
        <g
          transform={`translate(540 1560) rotate(${-6 + card * 6}) scale(${card})`}
        >
          <rect
            x={-300}
            y={-150}
            width={600}
            height={300}
            rx={20}
            fill="#fff7e6"
            stroke={GOLD}
            strokeWidth={12}
          />
          <circle
            cx={-200}
            cy={0}
            r={46}
            fill="none"
            stroke={GOLD}
            strokeWidth={12}
          />
          <circle
            cx={-150}
            cy={0}
            r={46}
            fill="none"
            stroke={GOLD}
            strokeWidth={12}
          />
        </g>
      </Stage>
      {card > 0.5 ? (
        <div
          style={{
            position: "absolute",
            left: 600,
            top: 1515,
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: 64,
            color: "#7a1d33",
            lineHeight: 1,
            scale: String(card),
          }}
        >
          ТОЙ
          <div style={{ fontSize: 36, color: C.ink, marginTop: 10 }}>
            30 КҮННЕН КЕЙІН
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// 2. «Мен ойладым… бәрін агенттерге беремін!»
export const SceneIdea: React.FC = () => {
  const f = useCurrentFrame();
  const bulb = pop(f, 6, 10);
  const spots = [
    [240, 1500, 31],
    [840, 1520, 37],
    [140, 1720, 43],
    [520, 1760, 49],
    [940, 1760, 55],
    [360, 1880, 61],
    [720, 1890, 67],
  ];
  return (
    <AbsoluteFill>
      <Stage>
        <Rays a="#2b2f6b" b="#343a80" />
        <Person
          frame={f}
          x={540}
          y={1280}
          s={1.05}
          pose={{
            mouth: talk(f, 30, 110),
            surprise: interpolate(f, [0, 8, 28, 34], [0, 0.6, 0.6, 0], clamp),
            shrug: interpolate(f, [70, 80], [0, 1], clamp),
            lookX: Math.sin(f / 10) * 0.4,
          }}
        />
        {/* лампочка-идея */}
        <g transform={`translate(800 520) scale(${bulb})`}>
          {new Array(8).fill(0).map((_, i) => (
            <rect
              key={i}
              x={-6}
              y={-150}
              width={12}
              height={40}
              rx={6}
              fill={GOLD}
              transform={`rotate(${i * 45 + f * 2})`}
              opacity={0.8}
            />
          ))}
          <circle r={80} fill="#ffe38a" />
          <rect x={-36} y={70} width={72} height={50} rx={10} fill="#9a9aa8" />
        </g>
        {spots.map(([x, y, at], i) =>
          f >= at ? (
            <At key={i} x={x} y={y} s={pop(f, at, 8)}>
              <Bot frame={f} size={130} seed={i} hop={1} wave={i % 2 === 0} />
            </At>
          ) : null,
        )}
      </Stage>
    </AbsoluteFill>
  );
};

// 3–5. Агенты-специалисты: асаба, приглашения, меню
export const SceneRole: React.FC<{
  role: "asaba" | "invite" | "menu";
  label: string;
  a: string;
  b: string;
}> = ({ role, label, a, b }) => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 8);
  return (
    <AbsoluteFill>
      <Stage>
        <Rays a={a} b={b} />
        <At x={540} y={1300} s={s * 3.2}>
          <Bot frame={f} size={160} seed={role.length} hop={0.4} />
          {role === "asaba" ? (
            <g>
              {/* бабочка и микрофон */}
              <path
                d="M -30 -40 L 0 -28 L 30 -40 L 30 -16 L 0 -28 L -30 -16 Z"
                fill="#c8102e"
              />
              <g transform={`rotate(${Math.sin(f / 4) * 10} 110 -90)`}>
                <rect
                  x={100}
                  y={-110}
                  width={16}
                  height={80}
                  rx={6}
                  fill="#333"
                />
                <circle cx={108} cy={-120} r={22} fill="#555" />
              </g>
            </g>
          ) : null}
          {role === "invite" ? (
            <g>
              {new Array(5).fill(0).map((_, i) => {
                const t = ((f + i * 9) % 45) / 45;
                return (
                  <g
                    key={i}
                    transform={`translate(${60 + t * 260} ${-80 - t * 260 + Math.sin(i) * 30}) rotate(${t * 200})`}
                  >
                    <rect
                      x={-40}
                      y={-26}
                      width={80}
                      height={52}
                      rx={6}
                      fill="#fff"
                      stroke="#c8a24a"
                      strokeWidth={4}
                    />
                    <path
                      d="M -40 -26 L 0 6 L 40 -26"
                      stroke="#c8a24a"
                      strokeWidth={4}
                      fill="none"
                    />
                  </g>
                );
              })}
            </g>
          ) : null}
          {role === "menu" ? (
            <g>
              {/* поварской колпак и бешбармак */}
              <rect x={-44} y={-232} width={88} height={60} fill="#fff" />
              <circle cx={-30} cy={-240} r={34} fill="#fff" />
              <circle cx={10} cy={-256} r={38} fill="#fff" />
              <circle cx={40} cy={-236} r={30} fill="#fff" />
              <ellipse
                cx={0}
                cy={-20}
                rx={130}
                ry={34}
                fill="#f4efe4"
                stroke="#c9b48a"
                strokeWidth={6}
              />
              {new Array(7).fill(0).map((_, i) => (
                <rect
                  key={i}
                  x={-90 + i * 26}
                  y={-44 + (i % 2) * 8}
                  width={30}
                  height={20}
                  rx={4}
                  fill="#f2dfb0"
                />
              ))}
              <ellipse cx={0} cy={-48} rx={50} ry={20} fill="#9b4a2c" />
              {[0, 1, 2].map((k) => (
                <path
                  key={k}
                  d={`M ${-30 + k * 30} -80 q 10 -20 0 -40 q -10 -20 0 -40`}
                  stroke="#fff"
                  strokeWidth={6}
                  fill="none"
                  opacity={0.4 + 0.3 * Math.sin(f / 6 + k)}
                />
              ))}
            </g>
          ) : null}
        </At>
      </Stage>
      <Tag frame={f} at={3} x={540} y={430} size={92} color={GOLD}>
        {label}
      </Tag>
    </AbsoluteFill>
  );
};

// 6. Чат с апайками: агент отвечает «Мәшалла» на всё
export const SceneChat: React.FC = () => {
  const f = useCurrentFrame();
  const msgs: { at: number; me: boolean; text: string }[] = [
    { at: 0, me: false, text: "🌹 Қайырлы таң, балалар!" },
    { at: 14, me: true, text: "Мәшалла 🙏" },
    { at: 26, me: false, text: "🌷 Немерем 1 жаста болды" },
    { at: 38, me: true, text: "Мәшалла 🙏" },
    { at: 50, me: false, text: "🍲 Бүгін палау жасадым" },
    { at: 60, me: true, text: "Мәшалла 🙏" },
    { at: 70, me: false, text: "Ауа райы суық екен" },
    { at: 78, me: true, text: "Мәшалла 🙏" },
  ];
  const shown = msgs.filter((m) => f >= m.at);
  const scroll = Math.max(0, shown.length - 5) * 150;
  const count = Math.floor(
    interpolate(f, [10, 88], [1, 999], {
      ...clamp,
      easing: Easing.in(Easing.cubic),
    }),
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#2b2f6b" }}>
      {/* телефон */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 230,
          width: 780,
          height: 1250,
          borderRadius: 70,
          backgroundColor: "#111",
          padding: 24,
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 50,
            backgroundColor: "#e9dfd3",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              backgroundColor: "#1f8a5a",
              color: "#fff",
              fontFamily: "Montserrat",
              fontWeight: 900,
              fontSize: 44,
              padding: "40px 40px 26px",
            }}
          >
            👵 Апалар чаты
            <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.85 }}>
              147 қатысушы
            </div>
          </div>
          <div style={{ padding: "24px 26px", translate: `0px ${-scroll}px` }}>
            {shown.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.me ? "flex-end" : "flex-start",
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    scale: String(pop(f, m.at, 6)),
                    transformOrigin: m.me ? "right" : "left",
                    backgroundColor: m.me ? "#d6f5c6" : "#fff",
                    borderRadius: 26,
                    padding: "18px 26px",
                    fontFamily: "Montserrat",
                    fontWeight: 700,
                    fontSize: 38,
                    color: C.ink,
                    maxWidth: 560,
                    boxShadow: "0 3px 0 rgba(0,0,0,0.12)",
                  }}
                >
                  {!m.me ? (
                    <div
                      style={{
                        fontSize: 26,
                        color: "#c0392b",
                        fontWeight: 900,
                      }}
                    >
                      Сәуле апай
                    </div>
                  ) : null}
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Stage bg="transparent">
        <At x={900} y={1640} s={1.6}>
          <Bot frame={f} size={150} seed={4} hat="headset" />
        </At>
      </Stage>
      <Tag
        frame={f}
        at={30}
        x={330}
        y={1610}
        size={70}
        color={GOLD}
        rotate={-6}
      >
        «МӘШАЛЛА» ×{count}
      </Tag>
    </AbsoluteFill>
  );
};

// 7. Конверты: агент-бухгалтер считает
export const SceneEnvelopes: React.FC = () => {
  const f = useCurrentFrame();
  const sum =
    Math.floor(interpolate(f, [5, 85], [0, 4750000], clamp) / 5000) * 5000;
  return (
    <AbsoluteFill>
      <Stage>
        <Rays a="#14532d" b="#196b3a" />
        {new Array(10).fill(0).map((_, i) => {
          const t = ((f + i * 9) % 30) / 30;
          const x = 100 + random(`ex${i}`) * 880;
          return (
            <g
              key={i}
              transform={`translate(${x + (540 - x) * t} ${300 + t * 820}) rotate(${(1 - t) * 160}) scale(${1.4 - t * 0.6})`}
            >
              <rect
                x={-60}
                y={-40}
                width={120}
                height={80}
                rx={8}
                fill="#fff"
                stroke="#c8a24a"
                strokeWidth={5}
              />
              <path
                d="M -60 -40 L 0 10 L 60 -40"
                stroke="#c8a24a"
                strokeWidth={5}
                fill="none"
              />
            </g>
          );
        })}
        {/* коробка для конвертов */}
        <rect
          x={360}
          y={1120}
          width={360}
          height={220}
          rx={16}
          fill="#8a5432"
        />
        <rect x={360} y={1120} width={360} height={40} fill="#6b3f24" />
        <At x={250} y={1500} s={2}>
          <Bot frame={f} size={150} seed={7} hop={0.6} />
          <rect x={60} y={-150} width={110} height={150} rx={14} fill="#333" />
          <rect x={72} y={-138} width={86} height={40} rx={6} fill="#a8e6a0" />
          {new Array(9).fill(0).map((_, k) => (
            <rect
              key={k}
              x={74 + (k % 3) * 28}
              y={-88 + Math.floor(k / 3) * 28}
              width={22}
              height={20}
              rx={4}
              fill={(f / 3 + k) % 9 < 1 ? GOLD : "#777"}
            />
          ))}
        </At>
      </Stage>
      <div
        style={{
          position: "absolute",
          top: 230,
          width: "100%",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
          fontSize: 110,
          color: "#fff",
          textShadow: `6px 6px 0 ${C.ink}`,
        }}
      >
        {sum.toLocaleString("ru-RU")} ₸
      </div>
    </AbsoluteFill>
  );
};

// 8. Тойхана: свет гаснет, зажигается — а гости все агенты
export const SceneHall: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = 118; // «агенттер»
  const dim =
    f < reveal
      ? interpolate(f, [70, 85], [0, 0.72], clamp)
      : interpolate(f, [reveal, reveal + 4], [0.72, 0], clamp);
  const pan = interpolate(f, [0, 150], [0, -120], clamp);
  return (
    <AbsoluteFill>
      <Stage>
        <g transform={`translate(${pan} 0)`}>
          <Hall frame={f} />
          {/* длинный стол */}
          <rect x={-100} y={1240} width={1400} height={60} fill="#fff" />
          <rect x={-100} y={1300} width={1400} height={300} fill="#f1e8e8" />
          {new Array(9).fill(0).map((_, i) => (
            <g key={i}>
              <ellipse
                cx={-20 + i * 160}
                cy={1250}
                rx={52}
                ry={16}
                fill="#f4d29a"
              />
              {new Array(5).fill(0).map((__, k) => (
                <circle
                  key={k}
                  cx={-40 + i * 160 + k * 10}
                  cy={1238 - (k % 2) * 8}
                  r={10}
                  fill="#d9a35c"
                />
              ))}
            </g>
          ))}
          {/* гости */}
          {new Array(8).fill(0).map((_, i) => (
            <At
              key={i}
              x={20 + i * 160}
              y={1250}
              s={f >= reveal ? 1 + 0.12 * pop(f, reveal + i * 2, 6) - 0.12 : 1}
            >
              <Bot
                frame={f}
                size={150}
                seed={i}
                hop={f >= reveal ? 1 : 0}
                wave={f >= reveal && i % 2 === 1}
                hat={i === 3 ? "detective" : i === 6 ? "headset" : undefined}
              />
            </At>
          ))}
        </g>
        <rect width={1080} height={1920} fill="#000" opacity={dim} />
        {f >= 70 && f < reveal ? (
          <circle
            cx={540}
            cy={760}
            r={260}
            fill="#fff6c8"
            opacity={0.08 + 0.05 * Math.sin(f)}
          />
        ) : null}
      </Stage>
      {f >= reveal ? (
        <AbsoluteFill
          style={{
            backgroundColor: "#fff",
            opacity: interpolate(f, [reveal, reveal + 6], [0.7, 0], clamp),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// 9. Тост на три часа: часы крутятся, гости засыпают
export const SceneToast: React.FC = () => {
  const f = useCurrentFrame();
  const fast = interpolate(f, [58, 96], [0, 1], clamp);
  const minutes = 19 * 60 + fast * 180 + f * 0.2;
  const hh = Math.floor(minutes / 60);
  const mm = Math.floor(minutes % 60);
  return (
    <AbsoluteFill>
      <Stage>
        <Hall frame={f} />
        {/* сцена */}
        <rect x={180} y={1050} width={720} height={60} fill="#3a0f1d" />
        <At x={540} y={1060} s={2.3}>
          <Bot frame={f} size={150} seed={2} hop={0.3} />
          <path
            d="M -28 -38 L 0 -26 L 28 -38 L 28 -14 L 0 -26 L -28 -14 Z"
            fill="#c8102e"
          />
          <g transform={`rotate(${Math.sin(f / 3) * 14} 104 -84)`}>
            <rect x={96} y={-104} width={16} height={80} rx={6} fill="#333" />
            <circle cx={104} cy={-114} r={22} fill="#555" />
          </g>
        </At>
        {/* засыпающие гости */}
        {new Array(5).fill(0).map((_, i) => (
          <g key={i}>
            <At x={120 + i * 210} y={1640} s={1.1}>
              <g transform={`rotate(${fast * (i % 2 ? 18 : -18)})`}>
                <Bot frame={f} size={150} seed={i + 3} />
              </g>
            </At>
            {fast > 0.3
              ? [0, 1, 2].map((k) => {
                  const t = ((f + k * 10 + i * 5) % 30) / 30;
                  return (
                    <text
                      key={k}
                      x={150 + i * 210 + t * 40}
                      y={1420 - t * 120}
                      fontFamily="Montserrat"
                      fontWeight={900}
                      fontSize={40 + k * 8}
                      fill="#fff"
                      opacity={(1 - t) * fast}
                    >
                      z
                    </text>
                  );
                })
              : null}
          </g>
        ))}
      </Stage>
      <div
        style={{
          position: "absolute",
          top: 420,
          width: "100%",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
          fontSize: 120,
          color: fast > 0.95 ? "#ff5d5d" : "#fff",
          textShadow: `6px 6px 0 ${C.ink}`,
          scale: String(1 + fast * 0.15),
        }}
      >
        ⏰ {String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

// 10. Жених и невеста — тоже агенты
export const SceneCouple: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage>
        <Rays a="#7a1d33" b="#8f2440" />
        {/* арка */}
        <path
          d="M 160 1500 L 160 700 Q 540 300 920 700 L 920 1500"
          stroke={GOLD}
          strokeWidth={26}
          fill="none"
        />
        {new Array(12).fill(0).map((_, i) => {
          const a = Math.PI * (i / 11);
          return (
            <circle
              key={i}
              cx={540 - Math.cos(a) * 380}
              cy={700 - Math.sin(a) * 330}
              r={22}
              fill={i % 2 ? "#ffffff" : "#ff9db0"}
            />
          );
        })}
        {/* жених */}
        <At x={380} y={1450} s={2.4 * pop(f, 0, 8)}>
          <Bot frame={f} size={150} seed={1} />
          <path d="M -22 -34 L 0 -10 L 22 -34 Z" fill="#111" />
          <rect x={-60} y={-232} width={150} height={20} rx={6} fill="#111" />
          <rect x={-36} y={-290} width={100} height={64} rx={8} fill="#111" />
        </At>
        {/* невеста: фата и саукеле */}
        <At x={720} y={1450} s={2.4 * pop(f, 40, 8)}>
          <path
            d="M -60 -150 Q -120 -40 -100 30 L 120 30 Q 140 -40 80 -150 Z"
            fill="#ffffff"
            opacity={0.75}
          />
          <Bot frame={f} size={150} seed={5} />
          <path
            d="M -40 -170 L 10 -330 L 60 -170 Z"
            fill="#ffffff"
            stroke={GOLD}
            strokeWidth={6}
          />
          <circle cx={10} cy={-335} r={12} fill={GOLD} />
          <rect x={-40} y={-190} width={100} height={22} fill={GOLD} />
        </At>
        {new Array(8).fill(0).map((_, i) => {
          const t = ((f + i * 11) % 60) / 60;
          return (
            <path
              key={i}
              d="M 0 0 C -30 -30 -60 10 0 50 C 60 10 30 -30 0 0 Z"
              fill="#ff5d7a"
              transform={`translate(${200 + random(`hx${i}`) * 680} ${1500 - t * 900}) scale(${0.6 + t})`}
              opacity={1 - t}
            />
          );
        })}
      </Stage>
      <Tag frame={f} at={4} x={380} y={600} size={54} rotate={-6}>
        КҮЙЕУ
      </Tag>
      <Tag frame={f} at={42} x={720} y={560} size={54} rotate={5}>
        КЕЛІН
      </Tag>
    </AbsoluteFill>
  );
};

// 11. Список гостей: брата вычеркнули, штамп «VIP ЕМЕС»
export const SceneList: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    "Агент №1",
    "Агент №2",
    "Агент №3",
    "Агент-асаба",
    "Агент-заңгер",
    "Інім",
    "Агент №7",
  ];
  const strike = interpolate(f, [70, 86], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const stamp = interpolate(f, [96, 102], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#3a2a5a" }}>
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 260,
          width: 820,
          height: 1240,
          backgroundColor: "#fffaf0",
          rotate: "-2deg",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          padding: "70px 70px",
          fontFamily: "Montserrat",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 62,
            color: "#7a1d33",
            marginBottom: 40,
          }}
        >
          ҚОНАҚТАР ТІЗІМІ
        </div>
        {rows.map((r, i) => {
          const isBro = r === "Інім";
          const show = pop(f, i * 5, 6);
          return (
            <div
              key={r}
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 800,
                fontSize: 56,
                color: C.ink,
                margin: "26px 0",
                opacity: show,
                translate: `${(1 - show) * 40}px 0px`,
              }}
            >
              <span>
                {i + 1}. {r}
              </span>
              <span style={{ color: isBro ? "#c0392b" : "#1f8a5a" }}>
                {isBro ? (strike > 0.9 ? "✗" : "") : "✓"}
              </span>
              {isBro ? (
                <div
                  style={{
                    position: "absolute",
                    left: -10,
                    top: "52%",
                    height: 12,
                    width: `${strike * 82}%`,
                    backgroundColor: "#c0392b",
                    borderRadius: 6,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {f >= 96 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1150,
            translate: "-50% -50%",
            rotate: "-14deg",
            scale: String(interpolate(stamp, [0, 1], [3, 1])),
            opacity: stamp,
            border: "14px solid #c0392b",
            borderRadius: 24,
            color: "#c0392b",
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: 140,
            padding: "6px 40px",
            backgroundColor: "rgba(255,250,240,0.6)",
          }}
        >
          VIP ЕМЕС
        </div>
      ) : null}
      <Stage bg="transparent">
        <Person
          frame={f}
          x={850}
          y={1720}
          s={0.7}
          brother
          pose={{
            surprise: interpolate(f, [86, 96], [0, 1], clamp),
            mouth: f > 100 ? 0.6 : 0,
          }}
        />
      </Stage>
    </AbsoluteFill>
  );
};

// 12. Фейс-контроль у входа
export const SceneDoor: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage>
        <rect width={1080} height={1920} fill="#2b1a2e" />
        <rect x={190} y={400} width={700} height={1150} fill="#6d1d36" />
        <rect
          x={250}
          y={520}
          width={580}
          height={1030}
          fill="#ffd27a"
          opacity={0.25 + 0.05 * Math.sin(f / 5)}
        />
        <rect x={170} y={380} width={740} height={40} fill={GOLD} />
        <rect x={0} y={1550} width={1080} height={370} fill="#1b1220" />
        {/* красная дорожка */}
        <path
          d="M 380 1550 L 700 1550 L 900 1920 L 180 1920 Z"
          fill="#b3122e"
        />
        {/* охранник */}
        <At x={560} y={1500} s={2.6}>
          <Bot frame={f} size={150} seed={9} hat="police" />
          <rect x={-60} y={-108} width={140} height={34} rx={14} fill="#111" />
          <g
            transform={`rotate(${interpolate(f, [20, 28], [0, -70], clamp)} 82 -80)`}
          >
            <rect
              x={82}
              y={-90}
              width={22}
              height={90}
              rx={9}
              fill={C.orangeSide}
            />
          </g>
        </At>
        {/* Медет со спины не видно — стоит сбоку, удивлён */}
        <Person
          frame={f}
          x={150}
          y={1700}
          s={0.75}
          pose={{
            surprise: interpolate(f, [70, 78], [0, 1], clamp),
            lookX: 1,
            mouth: f > 74 ? 0.5 : 0,
          }}
        />
      </Stage>
      <div
        style={{
          position: "absolute",
          top: 260,
          width: "100%",
          textAlign: "center",
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 78,
          color: GOLD,
          letterSpacing: 8,
          textShadow: `5px 5px 0 ${C.ink}`,
        }}
      >
        ТОЙХАНА
      </div>
      <Say frame={f} at={72} x={700} y={820} dark>
        Сіз тізімде жоқсыз ✋
      </Say>
    </AbsoluteFill>
  );
};

// 13. Кредит на той
export const SceneLoan: React.FC = () => {
  const f = useCurrentFrame();
  const sum =
    Math.floor(
      interpolate(f, [40, 100], [0, 15000000], {
        ...clamp,
        easing: Easing.out(Easing.cubic),
      }) / 50000,
    ) * 50000;
  const sign = interpolate(f, [45, 75], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#203a5f" }}>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 300,
          width: 780,
          height: 1050,
          backgroundColor: "#fff",
          rotate: "3deg",
          padding: 70,
          fontFamily: "Montserrat",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 72, color: "#203a5f" }}>
          НЕСИЕ ШАРТЫ
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 36,
            color: "#555",
            marginTop: 10,
          }}
        >
          Мақсаты: ТОЙ 🎉
        </div>
        {new Array(6).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              height: 18,
              width: `${90 - (i % 3) * 15}%`,
              backgroundColor: "#e3e3e3",
              borderRadius: 9,
              marginTop: 34,
            }}
          />
        ))}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
            fontSize: 86,
            color: "#c0392b",
            marginTop: 60,
          }}
        >
          {sum.toLocaleString("ru-RU")} ₸
        </div>
        <svg width={420} height={120} style={{ marginTop: 40 }}>
          <path
            d="M 10 80 C 60 0 90 120 140 60 S 220 0 260 70 S 340 100 400 40"
            stroke="#1f3fbf"
            strokeWidth={8}
            fill="none"
            strokeDasharray={600}
            strokeDashoffset={600 * (1 - sign)}
          />
        </svg>
        <div style={{ fontWeight: 700, fontSize: 30, color: "#777" }}>
          Қолы: Агент
        </div>
      </div>
      <Stage bg="transparent">
        <At x={860} y={1500} s={1.9}>
          <Bot frame={f} size={150} seed={3} hop={0.5} wave />
        </At>
        <Person
          frame={f}
          x={230}
          y={1760}
          s={0.7}
          pose={{
            surprise: interpolate(f, [45, 55], [0, 1], clamp),
            mouth: f > 50 ? 0.9 : 0,
          }}
        />
      </Stage>
    </AbsoluteFill>
  );
};

// 14. «Той — бір күн. Қарыз — бір жыл. Төлейтін — мен.»
export const SceneMoral: React.FC = () => {
  const f = useCurrentFrame();
  const lines: [number, string, string][] = [
    [0, "ТОЙ", "1 КҮН"],
    [37, "ҚАРЫЗ", "1 ЖЫЛ"],
    [83, "ТӨЛЕЙТІН", "МЕН"],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#141218" }}>
      <Stage bg="transparent">
        <Person
          frame={f}
          x={540}
          y={1640}
          s={0.95}
          pose={{
            shrug: interpolate(f, [83, 92], [0, 1], clamp),
            mouth: 0.15,
            lookX: 0,
          }}
        />
        {/* пустой кошелёк и моль */}
        {f > 90
          ? [0, 1].map((k) => {
              const t = (f - 90 - k * 8) / 30;
              return t > 0 ? (
                <g
                  key={k}
                  transform={`translate(${520 + k * 80 + Math.sin(t * 8) * 30} ${1380 - t * 300})`}
                >
                  <ellipse
                    rx={20}
                    ry={10}
                    fill="#ccc"
                    transform={`rotate(${Math.sin(f) * 30})`}
                  />
                  <ellipse
                    rx={20}
                    ry={10}
                    fill="#bbb"
                    transform={`rotate(${-Math.sin(f) * 30})`}
                  />
                </g>
              ) : null;
            })
          : null}
      </Stage>
      {lines.map(([at, a, b], i) => {
        const s = interpolate(f, [at, at + 6], [0, 1], {
          ...clamp,
          easing: Easing.in(Easing.cubic),
        });
        return f >= at ? (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 200 + i * 260,
              width: "100%",
              textAlign: "center",
              fontFamily: "Montserrat",
              fontWeight: 900,
              fontSize: 120,
              color: "#fff",
              opacity: s,
              scale: String(interpolate(s, [0, 1], [2.4, 1])),
              textShadow: `6px 6px 0 #000`,
            }}
          >
            {a} — <span style={{ color: i === 2 ? "#ff5d5d" : GOLD }}>{b}</span>
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

// 15. Разоблачение: агент в бумажной маске Медета ведёт съёмку
export const SceneReveal: React.FC = () => {
  const f = useCurrentFrame();
  const gl = random(`g${Math.floor(f / 2)}`) > 0.75;
  return (
    <AbsoluteFill>
      <Stage>
        <Room frame={f} />
        <g
          transform={
            gl ? `translate(${(random(`gx${f}`) - 0.5) * 40} 0)` : undefined
          }
        >
          <At x={480} y={1360} s={2.6}>
            <Bot frame={f} size={150} seed={8} wave />
          </At>
          {/* маска: лицо Медета на листе бумаги */}
          <g
            transform={`translate(${480 + Math.sin(f / 7) * 6} 1060) rotate(${-6 + Math.sin(f / 9) * 3})`}
          >
            <rect
              x={-160}
              y={-190}
              width={320}
              height={380}
              rx={12}
              fill="#fffaf0"
              stroke="#d8cfbf"
              strokeWidth={4}
            />
            <defs>
              <clipPath id="maskface">
                <rect x={-150} y={-180} width={300} height={360} />
              </clipPath>
            </defs>
            <g clipPath="url(#maskface)">
              <g transform="translate(0 250) scale(0.95)">
                <Medet frame={0} pose={POSE} />
              </g>
            </g>
          </g>
        </g>
        {/* камера и кольцевая лампа */}
        <circle
          cx={880}
          cy={1240}
          r={150}
          fill="none"
          stroke="#fff6c8"
          strokeWidth={26}
          opacity={0.9}
        />
        <rect x={800} y={1190} width={160} height={100} rx={14} fill="#222" />
        <circle cx={880} cy={1240} r={34} fill="#444" />
        <rect x={872} y={1290} width={16} height={400} fill="#333" />
        <circle
          cx={70}
          cy={160}
          r={22}
          fill="#ff2a2a"
          opacity={f % 30 < 18 ? 1 : 0.2}
        />
        <text
          x={110}
          y={176}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={800}
          fontSize={46}
          fill="#fff"
        >
          REC
        </text>
      </Stage>
      {gl ? (
        <AbsoluteFill
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(255,0,60,0.16) 0px, rgba(255,0,60,0.16) 3px, rgba(0,255,255,0.1) 3px, rgba(0,255,255,0.1) 6px)",
            mixBlendMode: "screen",
          }}
        />
      ) : null}
      {f > 140 ? (
        <div
          style={{
            position: "absolute",
            top: 1560,
            width: "100%",
            textAlign: "center",
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: 60,
            letterSpacing: 10,
            color: GOLD,
            opacity: interpolate(f, [140, 152], [0, 1], clamp),
            textShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          ЖАЛҒАСЫ БАР…
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
