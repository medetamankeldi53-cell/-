import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp } from "../flat/characters";
import { Slide } from "./types";

export const T = {
  bg: "#13173a",
  card: "#1d2352",
  text: "#f4f1ea",
  muted: "#a9adc9",
  gold: "#f2c14e",
  orange: C.orange,
  good: "#3ccf8e",
  bad: "#ff5d6c",
};

const font = "Montserrat";
const mono = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";

const appear = (frame: number, at: number, len = 10) =>
  interpolate(frame, [at, at + len], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.6)),
  });

// Элементы списка появляются равномерно по ходу слайда
const stagger = (i: number, n: number, dur: number) =>
  Math.round(12 + (i * (dur * 0.7)) / Math.max(1, n));

const Heading: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const p = appear(frame, 0);
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: 900,
        fontSize: 88,
        lineHeight: 1.1,
        color: T.text,
        marginBottom: 50,
        opacity: p,
        translate: `0px ${(1 - p) * 30}px`,
      }}
    >
      {text}
    </div>
  );
};

const Card: React.FC<{
  at: number;
  children: React.ReactNode;
  border?: string;
  style?: React.CSSProperties;
}> = ({ at, children, border = "transparent", style }) => {
  const frame = useCurrentFrame();
  const p = appear(frame, at);
  return (
    <div
      style={{
        backgroundColor: T.card,
        border: `5px solid ${border}`,
        borderRadius: 34,
        padding: "34px 40px",
        opacity: p,
        scale: String(interpolate(p, [0, 1], [0.92, 1])),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SlideView: React.FC<{ slide: Slide }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();

  if (slide.type === "title") {
    const p = appear(frame, 4, 14);
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: font,
            fontWeight: 900,
            fontSize: 128,
            lineHeight: 1.05,
            color: T.text,
            scale: String(interpolate(p, [0, 1], [1.3, 1])),
            opacity: p,
          }}
        >
          {slide.title}
        </div>
        {slide.subtitle ? (
          <div
            style={{
              marginTop: 40,
              fontFamily: font,
              fontWeight: 700,
              fontSize: 50,
              color: T.gold,
              opacity: appear(frame, 22),
            }}
          >
            {slide.subtitle}
          </div>
        ) : null}
      </div>
    );
  }

  if (slide.type === "bullets" || slide.type === "summary") {
    const items = slide.items;
    return (
      <div>
        <Heading text={slide.heading} />
        {items.map((it, i) => {
          const at = stagger(i, items.length, dur);
          const p = appear(frame, at);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                marginBottom: 34,
                opacity: p,
                translate: `${(1 - p) * 60}px 0px`,
              }}
            >
              <div
                style={{
                  flex: "0 0 70px",
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: slide.type === "summary" ? T.good : T.gold,
                  color: T.bg,
                  fontFamily: font,
                  fontWeight: 900,
                  fontSize: 40,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {slide.type === "summary" ? "✓" : i + 1}
              </div>
              <div
                style={{
                  fontFamily: font,
                  fontWeight: 700,
                  fontSize: 60,
                  color: T.text,
                  lineHeight: 1.2,
                }}
              >
                {it}
              </div>
            </div>
          );
        })}
        {slide.type === "summary" && slide.next ? (
          <div
            style={{
              marginTop: 50,
              fontFamily: font,
              fontWeight: 800,
              fontSize: 44,
              color: T.gold,
              opacity: appear(frame, Math.round(dur * 0.75)),
            }}
          >
            ➜ {slide.next}
          </div>
        ) : null}
      </div>
    );
  }

  if (slide.type === "compare") {
    const second = Math.round(dur * 0.4);
    const badCross = interpolate(frame, [second - 10, second], [0, 1], clamp);
    return (
      <div>
        <Heading text={slide.heading} />
        <Card
          at={8}
          border={T.bad}
          style={{ marginBottom: 40, position: "relative" }}
        >
          <div
            style={{
              fontFamily: font,
              fontWeight: 900,
              fontSize: 40,
              color: T.bad,
            }}
          >
            ✗ {slide.bad.label}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 56,
              color: T.text,
              marginTop: 16,
            }}
          >
            {slide.bad.text}
          </div>
          <div
            style={{
              position: "absolute",
              left: 30,
              right: 30,
              top: "62%",
              height: 8,
              borderRadius: 4,
              backgroundColor: T.bad,
              scale: `${badCross} 1`,
              transformOrigin: "left",
            }}
          />
        </Card>
        <Card at={second} border={T.good}>
          <div
            style={{
              fontFamily: font,
              fontWeight: 900,
              fontSize: 40,
              color: T.good,
            }}
          >
            ✓ {slide.good.label}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 53,
              color: T.text,
              marginTop: 16,
              lineHeight: 1.35,
            }}
          >
            {slide.good.text}
          </div>
        </Card>
      </div>
    );
  }

  if (slide.type === "prompt") {
    const all = slide.lines.join("\n");
    const n = Math.floor(
      interpolate(frame, [12, dur * 0.75], [0, all.length], clamp),
    );
    const shown = all.slice(0, n).split("\n");
    return (
      <div>
        <Heading text={slide.heading} />
        <Card at={4} border={T.gold}>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: c,
                }}
              />
            ))}
          </div>
          {shown.map((l, i) => (
            <div
              key={i}
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 53,
                color: T.text,
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: T.gold }}>› </span>
              {l}
              {i === shown.length - 1 ? (
                <span
                  style={{ opacity: frame % 16 < 8 ? 1 : 0, color: T.gold }}
                >
                  ▍
                </span>
              ) : null}
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (slide.type === "steps") {
    const steps = slide.steps;
    const active = Math.min(
      steps.length - 1,
      Math.floor(
        interpolate(frame, [10, dur * 0.85], [0, steps.length], clamp),
      ),
    );
    return (
      <div>
        <Heading text={slide.heading} />
        {steps.map((s, i) => {
          const on = i <= active;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  flex: "0 0 84px",
                  height: 84,
                  borderRadius: 42,
                  border: `6px solid ${T.gold}`,
                  backgroundColor: on ? T.gold : "transparent",
                  color: on ? T.bg : T.gold,
                  fontFamily: font,
                  fontWeight: 900,
                  fontSize: 42,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  scale:
                    i === active
                      ? String(1 + 0.08 * Math.abs(Math.sin(frame / 6)))
                      : "1",
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  fontFamily: font,
                  fontWeight: 800,
                  fontSize: 62,
                  color: on ? T.text : T.muted,
                }}
              >
                {s}
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginLeft: 38,
            marginTop: -6,
            fontFamily: font,
            fontWeight: 900,
            fontSize: 60,
            color: T.gold,
            rotate: `${frame * 4}deg`,
            width: 60,
            textAlign: "center",
          }}
        >
          ↻
        </div>
      </div>
    );
  }

  // quiz
  const reveal = Math.round(dur * (slide.revealAt ?? 0.55));
  const shown = frame >= reveal;
  return (
    <div>
      <Heading text={slide.question} />
      {slide.options.map((o, i) => {
        const ok = i === slide.correct;
        const border = shown ? (ok ? T.good : T.bad) : "#3a417a";
        return (
          <Card
            key={i}
            at={10 + i * 12}
            border={border}
            style={{ marginBottom: 34, opacity: shown && !ok ? 0.55 : 1 }}
          >
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div
                style={{
                  fontFamily: font,
                  fontWeight: 900,
                  fontSize: 50,
                  color: T.gold,
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 44,
                  color: T.text,
                  lineHeight: 1.35,
                  flex: 1,
                }}
              >
                {o}
              </div>
              {shown ? (
                <div
                  style={{
                    fontFamily: font,
                    fontWeight: 900,
                    fontSize: 56,
                    color: ok ? T.good : T.bad,
                    scale: String(appear(frame, reveal, 8)),
                  }}
                >
                  {ok ? "✓" : "✗"}
                </div>
              ) : null}
            </div>
          </Card>
        );
      })}
      {!shown ? (
        <div
          style={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: 44,
            color: T.muted,
          }}
        >
          ⏳ {Math.max(1, Math.ceil((reveal - frame) / 30))}…
        </div>
      ) : null}
    </div>
  );
};
