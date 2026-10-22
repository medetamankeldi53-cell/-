import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Stamp } from "../story/ui";
import { Clock, FlashIn, Glitch, GOLD, Narration, Photo } from "./kit";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// 3. Персонажи: листы персонажей и карусель образов
export const CharactersScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence name="Character 1" durationInFrames={80}>
        <Photo src="journey/char1.jpg" zoom={[1.08, 1]} />
        <FlashIn />
      </Sequence>
      <Sequence name="Character 2" from={80} durationInFrames={80}>
        <Photo src="journey/char2.jpg" zoom={[1.08, 1]} />
        <FlashIn />
      </Sequence>
      <Sequence name="Look — green" from={160} durationInFrames={27}>
        <Photo
          src="journey/char3.jpg"
          zoom={[1.15, 1.05]}
          pos={["20% 30%", "20% 30%"]}
        />
        <FlashIn length={6} />
      </Sequence>
      <Sequence name="Look — white" from={187} durationInFrames={26}>
        <Photo
          src="journey/char2-white.jpg"
          zoom={[1.15, 1.05]}
          pos={["50% 15%", "50% 25%"]}
        />
        <FlashIn length={6} />
      </Sequence>
      <Sequence name="Look — coat" from={213} durationInFrames={27}>
        <Photo src="journey/char2-coat.jpg" zoom={[1.15, 1.05]} />
        <FlashIn length={6} />
      </Sequence>

      <Sequence name="Narration 1" from={6} durationInFrames={150}>
        <Narration text="Сосын кейіпкерлер пайда болды." />
      </Sequence>
      <Sequence name="Narration 2" from={162} durationInFrames={78}>
        <Narration text="Әр образ — жаңа идея." />
      </Sequence>

      <Sequence name="SFX — char 1">
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
      <Sequence name="SFX — char 2" from={80}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
      <Sequence name="SFX — look 1" from={158}>
        <Audio src={staticFile("sfx/whoosh.wav")} />
      </Sequence>
      <Sequence name="SFX — look 2" from={185}>
        <Audio src={staticFile("sfx/whoosh.wav")} />
      </Sequence>
      <Sequence name="SFX — look 3" from={211}>
        <Audio src={staticFile("sfx/whoosh.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

const PROMPTS = [
  "cinematic portrait, Kazakh man, black cap, 35mm",
  "same character, side profile, SAME face",
  "man and boy, spotlight, dark studio, film grain",
  "yurt interior, two men talking, warm light",
  "poster: «Той бір күн. Қарыз бір жыл.»",
  "fix the hands. fix the face. again.",
  "make it more cinematic",
  "keep the same face!!!",
  "vertical 9:16, natural Kazakh speech",
  "no extra people in background, please",
  "one more time…",
  "ok, last version (v27)",
];

const AI_NAMES: [string, string, number][] = [
  ["CLAUDE", "#d97757", 0],
  ["GEMINI", "#6b9bff", 12],
  ["ChatGPT", "#10a37f", 24],
];

// 4. Исследование: Claude / Gemini / ChatGPT и поток промптов
export const PromptsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shrink = interpolate(frame, [44, 60], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const shown = Math.max(0, Math.floor((frame - 50) / 11) + 1);
  const scroll =
    Math.max(0, interpolate(frame, [50, 50 + 11 * 12], [0, 12], clamp) - 6) *
    64;
  const count = Math.floor(
    interpolate(frame, [60, 185], [1, 999], {
      ...clamp,
      easing: Easing.in(Easing.exp),
    }),
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 30%, #121628 0%, #050507 70%)",
        fontFamily: "Montserrat",
        alignItems: "center",
      }}
    >
      <div
        style={{
          marginTop: interpolate(shrink, [0, 1], [430, 170]),
          scale: String(interpolate(shrink, [0, 1], [1, 0.55])),
          textAlign: "center",
        }}
      >
        {AI_NAMES.map(([name, color, at]) => {
          const p = interpolate(frame, [at, at + 7], [0, 1], {
            ...clamp,
            easing: Easing.in(Easing.cubic),
          });
          return (
            <div
              key={name}
              style={{
                fontSize: 140,
                fontWeight: 900,
                lineHeight: 1.1,
                color,
                opacity: p,
                scale: String(interpolate(p, [0, 1], [2.2, 1])),
                textShadow: `0 0 50px ${color}99`,
              }}
            >
              {name}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 660,
          left: 70,
          right: 70,
          height: 470,
          overflow: "hidden",
          borderRadius: 26,
          backgroundColor: "rgba(10,11,16,0.9)",
          border: "2px solid #272a38",
          opacity: interpolate(frame, [46, 56], [0, 1], clamp),
        }}
      >
        <div
          style={{
            padding: "26px 32px",
            translate: `0px ${-scroll}px`,
            fontFamily: "'JetBrains Mono', 'DejaVu Sans Mono', monospace",
            fontSize: 34,
            lineHeight: "64px",
            color: "#d8d2c4",
          }}
        >
          {PROMPTS.slice(0, shown).map((line, i) => {
            const typed = Math.floor(
              interpolate(
                frame,
                [50 + i * 11, 58 + i * 11],
                [0, line.length],
                clamp,
              ),
            );
            return (
              <div key={i} style={{ whiteSpace: "nowrap" }}>
                <span style={{ color: GOLD }}>›</span> {line.slice(0, typed)}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1170,
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: 10,
          color: "#9a917f",
          opacity: interpolate(frame, [58, 66], [0, 1], clamp),
        }}
      >
        ПРОМПТ №
      </div>
      <div
        style={{
          position: "absolute",
          top: 1215,
          fontSize: frame >= 186 ? 200 : 150,
          lineHeight: 1,
          fontWeight: 900,
          color: frame >= 186 ? GOLD : "#ffffff",
          textShadow: frame >= 186 ? `0 0 60px ${GOLD}` : undefined,
          opacity: interpolate(frame, [58, 66], [0, 1], clamp),
        }}
      >
        {frame >= 186 ? "∞" : count}
      </div>

      <Sequence name="Narration 1" durationInFrames={98}>
        <Narration
          text="Claude, Gemini, GPT — зерттеу басталды."
          bottom={250}
        />
      </Sequence>
      <Sequence name="Narration 2" from={102} durationInFrames={108}>
        <Narration text="Қаншама промпт жазылды…" bottom={250} />
      </Sequence>

      {AI_NAMES.map(([name, , at]) => (
        <Sequence key={name} name={`SFX — ${name}`} from={at + 6}>
          <Audio src={staticFile("sfx/boom.wav")} volume={0.55} />
        </Sequence>
      ))}
      <Sequence name="SFX — typing" from={50} durationInFrames={136}>
        <Audio src={staticFile("sfx/type.wav")} loop volume={0.25} />
      </Sequence>
      <Sequence name="SFX — infinity" from={186}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.7} />
      </Sequence>
    </AbsoluteFill>
  );
};

// 5. Брак: глитчи, «ҚАТЕ», вечная перегенерация
export const FailsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [142, 194], [0, 99], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const failed = frame >= 196;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: "Montserrat" }}>
      <Sequence name="Fail — bench" durationInFrames={70}>
        <Glitch
          active={(f) => (f >= 18 && f < 28) || (f >= 44 && f < 52) || f >= 62}
        >
          <Video
            src={staticFile("journey/bench.mp4")}
            muted
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </Glitch>
      </Sequence>
      <Sequence name="Fail — warped" from={70} durationInFrames={72}>
        <Glitch active={(f) => f < 10 || (f >= 40 && f < 54) || f >= 64}>
          <AbsoluteFill
            style={{
              scale: `${interpolate(frame, [70, 140], [1.0, 1.7])} ${interpolate(frame, [70, 140], [1.0, 0.7])}`,
              transform: `skewX(${interpolate(frame, [70, 140], [0, 14])}deg)`,
            }}
          >
            <Photo src="journey/char2-coat.jpg" zoom={[1, 1]} />
          </AbsoluteFill>
        </Glitch>
      </Sequence>

      <Sequence name="Regenerate" from={142}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 45%, #15182a 0%, #050507 70%)",
            alignItems: "center",
            paddingTop: 620,
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              border: "14px solid #272a38",
              borderTopColor: failed ? "#ff4d5e" : GOLD,
              rotate: `${frame * 14}deg`,
            }}
          />
          <div
            style={{
              marginTop: 60,
              fontSize: 56,
              fontWeight: 800,
              color: failed ? "#ff4d5e" : "#e9e2d4",
            }}
          >
            {failed ? "Қате. Қайтадан…" : "Генерация…"}
          </div>
          <div
            style={{
              marginTop: 40,
              width: 760,
              height: 26,
              borderRadius: 13,
              backgroundColor: "#272a38",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${failed ? 0 : progress}%`,
                height: "100%",
                backgroundColor: GOLD,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 44,
              fontWeight: 700,
              color: "#9a917f",
            }}
          >
            {failed ? "0%" : `${Math.floor(progress)}%`}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={20} durationInFrames={50}>
        <Stamp at={0} color="#ff4d5e" rotate={-9} size={170}>
          ҚАТЕ
        </Stamp>
      </Sequence>
      <Sequence from={96} durationInFrames={46}>
        <Stamp at={0} color="#ff4d5e" rotate={8} size={120}>
          Тағы қате
        </Stamp>
      </Sequence>

      <Sequence name="Narration 1" durationInFrames={104}>
        <Narration text="Кейде бәрі қисық шықты…" />
      </Sequence>
      <Sequence name="Narration 2" from={108} durationInFrames={102}>
        <Narration text="Қайта. Тағы қайта." gold />
      </Sequence>

      <Sequence name="SFX — glitch 1" from={18}>
        <Audio src={staticFile("sfx/glitch.wav")} />
      </Sequence>
      <Sequence name="SFX — error 1" from={20}>
        <Audio src={staticFile("sfx/buzz.wav")} />
      </Sequence>
      <Sequence name="SFX — glitch 2" from={70}>
        <Audio src={staticFile("sfx/glitch.wav")} />
      </Sequence>
      <Sequence name="SFX — error 2" from={96}>
        <Audio src={staticFile("sfx/buzz.wav")} />
        <Audio src={staticFile("sfx/boom.wav")} volume={0.6} />
      </Sequence>
      <Sequence name="SFX — glitch 3" from={134}>
        <Audio src={staticFile("sfx/glitch.wav")} />
      </Sequence>
      <Sequence name="SFX — fail at 99%" from={196}>
        <Audio src={staticFile("sfx/buzz.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

// 6. Ночи: часы бегут с 23:00 до утра
export const NightsScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence name="Road" durationInFrames={95}>
        <Photo
          src="journey/road.jpg"
          zoom={[1.05, 1.2]}
          pos={["30% 50%", "45% 50%"]}
          filter="brightness(0.6) saturate(0.7)"
        />
        <AbsoluteFill
          style={{
            backgroundColor: "rgba(15,30,90,0.45)",
            mixBlendMode: "multiply",
          }}
        />
      </Sequence>
      <Sequence name="Room" from={95}>
        <Photo
          src="journey/room.jpg"
          zoom={[1.05, 1.18]}
          filter="brightness(0.8)"
        />
        <FlashIn length={8} />
      </Sequence>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
        <Clock minutes={23 * 60 + frame * 1.85} size={150} />
      </AbsoluteFill>

      <Sequence name="Narration 1" from={5} durationInFrames={88}>
        <Narration text="Күн сайын — түнгі уақытымды арнадым." />
      </Sequence>
      <Sequence name="Narration 2" from={98} durationInFrames={82}>
        <Narration text="Жақсы меңгеру үшін." gold />
      </Sequence>

      <Audio
        src={staticFile("sfx/tick.wav")}
        loop
        volume={0.7}
        playbackRate={2}
      />
      <Sequence name="SFX — room" from={93}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
