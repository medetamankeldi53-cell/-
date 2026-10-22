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
import { Bubble, EpisodeTitle, GOLD } from "./ui";

const CAPTION = "СМОТРИ НА ПИДЖАК 👀";

// Надпись, которая разлетается по буквам на кадре `explodeAt`
const ExplodingCaption: React.FC<{ explodeAt: number }> = ({ explodeAt }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - explodeAt);
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 58,
        fontWeight: 900,
        color: "#fff",
        textShadow: "0 4px 18px rgba(0,0,0,0.6)",
        padding: "0 30px",
      }}
    >
      {CAPTION.split(" ").map((word, w) => (
        <span key={w} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {Array.from(word + " ").map((ch, c) => {
            const i = w * 100 + c;
            return (
              <span
                key={c}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  translate: `${(random(`x${i}`) - 0.5) * 60 * t}px ${(random(`y${i}`) - 0.8) * 50 * t + 3 * t * t}px`,
                  rotate: `${(random(`r${i}`) - 0.5) * 70 * t}deg`,
                  opacity: interpolate(t, [10, 22], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

// Эпизод III: правки режиссёра, по одной
export const EditScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Плитки «1» и «2» на таймлайне съезжаются в одну
  const merge = interpolate(frame, [135, 155], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Наезд в превью перед полноэкранным клипом
  const zoomIn = interpolate(frame, [182, 198], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #14161f 0%, #0b0c12 100%)",
          fontFamily: "Montserrat",
          alignItems: "center",
          paddingTop: 170,
        }}
      >
        <div
          style={{
            width: 540,
            height: 960,
            borderRadius: 36,
            overflow: "hidden",
            position: "relative",
            border: `4px solid ${GOLD}`,
            boxShadow: "0 30px 90px rgba(0,0,0,0.7)",
            scale: String(interpolate(zoomIn, [0, 1], [1, 2.6])),
            filter: `blur(${interpolate(zoomIn, [0, 1], [0, 22])}px)`,
          }}
        >
          <Video
            src={staticFile("clips/swap-1.mp4")}
            muted
            loop
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
          <ExplodingCaption explodeAt={90} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: interpolate(merge, [0, 1], [60, 0]),
            marginTop: 40,
            height: 110,
          }}
        >
          {["1", "2"].map((n, i) => (
            <div
              key={n}
              style={{
                width: interpolate(merge, [0, 1], [240, 270]),
                height: 110,
                backgroundColor: i === 0 ? "#2f6bff" : "#ff3d6e",
                borderTopLeftRadius:
                  i === 0 ? 22 : interpolate(merge, [0, 1], [22, 0]),
                borderBottomLeftRadius:
                  i === 0 ? 22 : interpolate(merge, [0, 1], [22, 0]),
                borderTopRightRadius:
                  i === 1 ? 22 : interpolate(merge, [0, 1], [22, 0]),
                borderBottomRightRadius:
                  i === 1 ? 22 : interpolate(merge, [0, 1], [22, 0]),
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 56,
                fontWeight: 900,
                color: "#fff",
                boxShadow: `0 0 ${interpolate(merge, [0, 1], [0, 60])}px ${GOLD}`,
              }}
            >
              {merge > 0.95 && i === 0
                ? "ОДИН"
                : merge > 0.95
                  ? "РОЛИК"
                  : `Клип ${n}`}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 150,
            height: 440,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            overflow: "hidden",
          }}
        >
          <Bubble from="user" at={70}>
            Надписи убери
          </Bubble>
          <Bubble from="user" at={118}>
            1 и 2 — как 1 ролик
          </Bubble>
          <Bubble from="user" at={165}>
            Бесшовный переход через наезд
          </Bubble>
        </div>
      </AbsoluteFill>

      {/* Влетаем в клип: полноэкранный клип выходит из того же наезда */}
      <Sequence name="Fullscreen clip" from={192}>
        <FullscreenClip />
      </Sequence>
      <Sequence name="Flash" from={223} durationInFrames={12}>
        <AbsoluteFill
          style={{
            backgroundColor: "#fff",
            opacity: interpolate(frame, [223, 225, 233], [0, 0.85, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </Sequence>
      <Sequence durationInFrames={42}>
        <EpisodeTitle episode="ЭПИЗОД III" title="Монтаж" />
      </Sequence>

      <Sequence name="SFX — pop" from={70}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — explode" from={88}>
        <Audio src={staticFile("sfx/whoosh.wav")} />
      </Sequence>
      <Sequence name="SFX — pop" from={118}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — merge" from={152}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.6} />
      </Sequence>
      <Sequence name="SFX — pop" from={165}>
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence name="SFX — zoom" from={180}>
        <Audio src={staticFile("sfx/whoosh.wav")} />
      </Sequence>
      <Sequence name="SFX — swap boom" from={223}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

const FullscreenClip: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, 6], [0, 1], {
          extrapolateRight: "clamp",
        }),
        scale: String(
          interpolate(frame, [0, 18], [2.6, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateRight: "clamp",
          }),
        ),
        filter: `blur(${interpolate(frame, [0, 18], [22, 0], {
          easing: Easing.out(Easing.cubic),
          extrapolateRight: "clamp",
        })}px)`,
      }}
    >
      <Video
        src={staticFile("clips/swap-2.mp4")}
        trimBefore={60}
        volume={0.6}
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          filter: "contrast(1.1) saturate(1.2)",
        }}
      />
    </AbsoluteFill>
  );
};
