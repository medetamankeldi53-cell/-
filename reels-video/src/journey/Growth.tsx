import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Bubble, Stamp } from "../story/ui";
import { FlashIn, GOLD, Narration, PosterCard } from "./kit";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Заголовок-плашка над чатом: «БҰРЫН» / «ҚАЗІР»
const ChatHeader: React.FC<{ children: React.ReactNode; color: string }> = ({
  children,
  color,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        alignSelf: "center",
        fontFamily: "Montserrat",
        fontSize: 54,
        fontWeight: 900,
        letterSpacing: 16,
        color,
        marginBottom: 20,
        opacity: interpolate(frame, [0, 8], [0, 1], clamp),
      }}
    >
      {children}
    </div>
  );
};

const IDEAS: [string, number][] = [
  ["Той бір күн. Қарыз бір жыл.", 1],
  ["Киім — қабық қана.", 1],
  ["Әке мен бала", 0],
  ["1906 · Жер", 0],
  ["1913 · Сөз", 1],
  ["Қазір.", 0],
  ["Уақыт куәлері", 1],
  ["Киіз үйдегі әңгіме", 0],
  ["«Навигация солға бұрыл» 😅", 1],
  ["Кейіпкер картасы", 0],
  ["Бет өзгермесін!", 1],
  ["Постер сериясы", 0],
  ["Субтитр", 1],
  ["Диктор", 0],
];

// Отступ слева для каждой идеи (длинные — ближе к левому краю)
const IDEA_X = [
  80, 420, 200, 480, 90, 360, 150, 300, 100, 460, 220, 520, 130, 400,
];

const STEPS = [
  "Идея",
  "Сценарий",
  "Кейіпкер картасы",
  "Промпт",
  "Генерация",
  "Тексеру → қайта",
  "Монтаж",
];

// Ячейки воронки: x/y центра шага на экране
const STEP_TOP = 330;
const STEP_H = 128;
const STEP_GAP = 26;
const stepCenterY = (i: number) =>
  STEP_TOP + i * (STEP_H + STEP_GAP) + STEP_H / 2;

// Идеи разлетаются по экрану, затем собираются в структуру
const IdeaStorm: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {IDEAS.map(([text, who], i) => {
        const appear = 4 + i * 3;
        const p = interpolate(frame, [appear, appear + 10], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.back(1.6)),
        });
        // Стартовая точка: идеи рассыпаны по всему кадру и не перекрывают друг друга
        const x0 = IDEA_X[i];
        const y0 = 270 + i * 80;
        const drift = Math.sin((frame + i * 13) / 14) * 14;
        // Сборка в шаг воронки
        const gather = interpolate(frame, [52 + i * 2, 80 + i * 2], [0, 1], {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        });
        const target = i % STEPS.length;
        const x = x0 + (540 - 200 - x0) * gather;
        const y =
          y0 + drift * (1 - gather) + (stepCenterY(target) - 40 - y0) * gather;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontSize: 40,
              fontWeight: 700,
              padding: "16px 28px",
              borderRadius: 30,
              whiteSpace: "nowrap",
              color: who === 0 ? "#fff" : "#1b1712",
              backgroundColor: who === 0 ? "#2f6bff" : "#f4ead7",
              boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
              rotate: `${(random(`ir${i}`) - 0.5) * 16 * (1 - gather)}deg`,
              scale: String(p * interpolate(gather, [0, 1], [1, 0.35])),
              opacity: p * interpolate(gather, [0.6, 1], [1, 0], clamp),
            }}
          >
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Структура работы: шаги появляются, потом по очереди «загораются»
const Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [56, 96], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 50,
          fontWeight: 900,
          letterSpacing: 12,
          color: GOLD,
          opacity: interpolate(frame, [56, 68], [0, 1], clamp),
        }}
      >
        ЖҰМЫС ҚҰРЫЛЫМЫ
      </div>
      <div
        style={{
          position: "absolute",
          left: 222,
          top: stepCenterY(0),
          width: 6,
          height: (stepCenterY(STEPS.length - 1) - stepCenterY(0)) * line,
          backgroundColor: GOLD,
          opacity: 0.6,
        }}
      />
      {STEPS.map((step, i) => {
        const appear = 56 + i * 5;
        const p = interpolate(frame, [appear, appear + 10], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.back(1.4)),
        });
        const lit = frame >= 112 + i * 6;
        return (
          <div
            key={step}
            style={{
              position: "absolute",
              left: 170,
              top: stepCenterY(i) - STEP_H / 2,
              width: 740,
              height: STEP_H,
              display: "flex",
              alignItems: "center",
              gap: 34,
              opacity: p,
              translate: `${(1 - p) * 120}px 0px`,
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: lit ? GOLD : "#1e2130",
                border: `4px solid ${GOLD}`,
                color: lit ? "#1b1712" : GOLD,
                fontSize: 52,
                fontWeight: 900,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: lit ? `0 0 40px ${GOLD}` : undefined,
              }}
            >
              {lit ? "✓" : i + 1}
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 52,
                fontWeight: 800,
                color: lit ? "#fff" : "#cfc8b8",
              }}
            >
              {step}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 8. Как нашли общий язык с Claude: непонимание → поток идей → общая структура
export const ClaudeScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #14161f 0%, #0b0c12 100%)",
        fontFamily: "Montserrat",
      }}
    >
      <Sequence name="Before" durationInFrames={70}>
        <AbsoluteFill style={{ padding: "230px 80px 0" }}>
          <ChatHeader color="#9a917f">БҰРЫН</ChatHeader>
          <Bubble from="user" at={8}>
            Монтаж
          </Bubble>
          <Bubble from="claude" at={24}>
            Нақты не керек? 🤔
            <br />
            1… 2… 3… 4…
          </Bubble>
        </AbsoluteFill>
      </Sequence>
      <Sequence name="Ideas → structure" from={70}>
        <Pipeline />
        <IdeaStorm />
        <FlashIn length={8} />
      </Sequence>
      <Sequence from={222}>
        <Stamp at={0} color={GOLD} rotate={-8} size={96}>
          Тіл табыстық 🤝
        </Stamp>
      </Sequence>

      <Sequence name="Narration 1" durationInFrames={72}>
        <Narration text="Алғашында түсінісу ~қиын~ болды." bottom={200} />
      </Sequence>
      <Sequence name="Narration 2" from={74} durationInFrames={44}>
        <Narration text="Қаншама *идея* айттым…" bottom={200} />
      </Sequence>
      <Sequence name="Narration 3" from={120} durationInFrames={70}>
        <Narration
          text="*Бірге* — бір *құрылым* қалыптастырдық."
          bottom={200}
        />
      </Sequence>
      <Sequence name="Narration 4" from={192} durationInFrames={63}>
        <Narration text="Енді Claude-пен *тіл* *табыстық.*" bottom={200} />
      </Sequence>

      {[8, 24].map((f) => (
        <Sequence key={f} name="SFX — pop" from={f}>
          <Audio src={staticFile("sfx/pop.wav")} />
        </Sequence>
      ))}
      {IDEAS.map((_, i) => (
        <Sequence key={i} name="SFX — idea" from={70 + 4 + i * 3}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.55} />
        </Sequence>
      ))}
      <Sequence name="SFX — gather" from={120}>
        <Audio src={staticFile("sfx/whoosh.wav")} />
      </Sequence>
      {STEPS.map((step, i) => (
        <Sequence key={step} name="SFX — step lit" from={70 + 112 + i * 6}>
          <Audio src={staticFile("sfx/tick.wav")} volume={0.6} />
        </Sequence>
      ))}
      <Sequence name="SFX — stamp" from={222}>
        <Audio src={staticFile("sfx/boom.wav")} />
        <Audio src={staticFile("sfx/chime.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Горизонтальный клип в вертикальном кадре: размытый фон + чистая «плёнка» по центру
const CinemaClip: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{ filter: "blur(40px) brightness(0.45)", scale: "1.2" }}
      >
        <Video
          src={staticFile(src)}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          scale: String(interpolate(frame, [0, 90], [1.04, 1], clamp)),
        }}
      >
        <div
          style={{
            width: 1080,
            height: 608,
            boxShadow: "0 30px 90px rgba(0,0,0,0.8)",
            borderTop: `2px solid ${GOLD}55`,
            borderBottom: `2px solid ${GOLD}55`,
          }}
        >
          <Video
            src={staticFile(src)}
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 10. Последние работы: «Уақыт куәлері» — уже получается
export const LatestScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: "Montserrat" }}>
      <Sequence name="Series title" durationInFrames={50}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 300,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              letterSpacing: 22,
              color: GOLD,
              textAlign: "center",
              opacity: interpolate(frame, [2, 14], [0, 1], clamp),
              scale: String(interpolate(frame, [2, 50], [1.15, 1], clamp)),
              textShadow: `0 0 50px ${GOLD}66`,
            }}
          >
            УАҚЫТ
            <br />
            КУӘЛЕРІ
          </div>
        </AbsoluteFill>
        <Narration text="*Жақсы* *меңгере* бастадым." />
      </Sequence>
      <Sequence name="Poster — 1906" from={50} durationInFrames={40}>
        <PosterCard src="journey/poster-1906.jpg" />
        <FlashIn />
      </Sequence>
      <Sequence name="Clip — 1906" from={90} durationInFrames={75}>
        <CinemaClip src="journey/ep1906.mp4" />
        <FlashIn length={6} />
      </Sequence>
      <Sequence name="Poster — 1913" from={165} durationInFrames={40}>
        <PosterCard src="journey/poster-1913.jpg" />
        <FlashIn />
      </Sequence>
      <Sequence name="Clip — car" from={205} durationInFrames={100}>
        <CinemaClip src="journey/car.mp4" />
        <FlashIn length={6} />
      </Sequence>
      <Sequence name="Poster — ҚАЗІР" from={305} durationInFrames={55}>
        <PosterCard src="journey/poster-kazir.jpg" />
        <FlashIn />
      </Sequence>

      <Sequence name="SFX — title" from={2}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.5} />
      </Sequence>
      {[50, 165, 305].map((f) => (
        <Sequence key={f} name="SFX — poster" from={f}>
          <Audio src={staticFile("sfx/boom.wav")} />
        </Sequence>
      ))}
      {[88, 203].map((f) => (
        <Sequence key={f} name="SFX — clip" from={f}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
