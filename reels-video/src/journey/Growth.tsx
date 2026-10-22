import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
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

// 8. Как нашли общий язык с Claude: «раньше» и «сейчас»
export const ClaudeScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #14161f 0%, #0b0c12 100%)",
        fontFamily: "Montserrat",
      }}
    >
      <Sequence name="Before" durationInFrames={100}>
        <AbsoluteFill style={{ padding: "230px 80px 0" }}>
          <ChatHeader color="#9a917f">БҰРЫН</ChatHeader>
          <Bubble from="user" at={10}>
            Монтаж
          </Bubble>
          <Bubble from="claude" at={28}>
            Нақты не керек? 🤔
            <br />
            1… 2… 3… 4…
          </Bubble>
        </AbsoluteFill>
      </Sequence>
      <Sequence name="Now" from={100}>
        <AbsoluteFill style={{ padding: "230px 80px 0" }}>
          <ChatHeader color={GOLD}>ҚАЗІР</ChatHeader>
          <Bubble from="user" at={8}>
            Бесшовный переход через наезд
          </Bubble>
          <Bubble from="claude" at={24}>
            Дайын 🎬 ✓
          </Bubble>
          <Bubble from="user" at={46}>
            Қазақша істей аласың ба?
          </Bubble>
          <Bubble from="claude" at={60}>
            Иә, жасаймын! ✓
          </Bubble>
        </AbsoluteFill>
        <FlashIn length={8} />
      </Sequence>
      <Sequence from={186}>
        <Stamp at={0} color={GOLD} rotate={-8} size={96}>
          Тіл табыстық 🤝
        </Stamp>
      </Sequence>

      <Sequence name="Narration 1" durationInFrames={100}>
        <Narration text="Алғашында түсінісу қиын болды." bottom={240} />
      </Sequence>
      <Sequence name="Narration 2" from={104} durationInFrames={136}>
        <Narration text="Қазір — Claude-пен тіл табыстық." gold bottom={240} />
      </Sequence>

      {[10, 28, 108, 124, 146, 160].map((f) => (
        <Sequence key={f} name="SFX — pop" from={f}>
          <Audio src={staticFile("sfx/pop.wav")} />
        </Sequence>
      ))}
      <Sequence name="SFX — switch" from={98}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
      </Sequence>
      <Sequence name="SFX — done" from={124}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.6} />
      </Sequence>
      <Sequence name="SFX — stamp" from={186}>
        <Audio src={staticFile("sfx/boom.wav")} />
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
      <Sequence name="Series title" durationInFrames={80}>
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
              opacity: interpolate(frame, [6, 26], [0, 1], clamp),
              scale: String(interpolate(frame, [6, 80], [1.15, 1], clamp)),
              textShadow: `0 0 50px ${GOLD}66`,
            }}
          >
            УАҚЫТ
            <br />
            КУӘЛЕРІ
          </div>
        </AbsoluteFill>
        <Narration text="Кішкене болса да — жақсы меңгере бастадым." />
      </Sequence>
      <Sequence name="Poster — 1906" from={80} durationInFrames={65}>
        <PosterCard src="journey/poster-1906.jpg" />
        <FlashIn />
      </Sequence>
      <Sequence name="Clip — 1906" from={145} durationInFrames={105}>
        <CinemaClip src="journey/ep1906.mp4" />
        <FlashIn length={6} />
      </Sequence>
      <Sequence name="Poster — 1913" from={250} durationInFrames={65}>
        <PosterCard src="journey/poster-1913.jpg" />
        <FlashIn />
      </Sequence>
      <Sequence name="Clip — car" from={315} durationInFrames={135}>
        <CinemaClip src="journey/car.mp4" />
        <FlashIn length={6} />
      </Sequence>
      <Sequence name="Poster — ҚАЗІР" from={450} durationInFrames={90}>
        <PosterCard src="journey/poster-kazir.jpg" />
        <FlashIn />
      </Sequence>

      <Sequence name="SFX — title" from={6}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.5} />
      </Sequence>
      {[80, 250, 450].map((f) => (
        <Sequence key={f} name="SFX — poster" from={f}>
          <Audio src={staticFile("sfx/boom.wav")} />
        </Sequence>
      ))}
      {[143, 313].map((f) => (
        <Sequence key={f} name="SFX — clip" from={f}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
