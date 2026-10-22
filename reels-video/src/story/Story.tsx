import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { ChatScene } from "./ChatScene";
import { EditScene } from "./EditScene";
import { Finale } from "./Finale";
import { GitScene } from "./GitScene";
import { Prologue } from "./Prologue";
import { Lang, LangProvider } from "./i18n";
import { CinemaLook } from "./ui";

// Трейлер «Монтаж с Claude» — как мы монтировали ролики.
// Сцены: 120 + 165 + 225 + 250 + 150 − 4 перехода × 10 = 870 кадров ≈ 29 с
export const Story: React.FC<{ lang: Lang }> = ({ lang }) => {
  return (
    <LangProvider value={lang}>
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <TransitionSeries>
          <TransitionSeries.Sequence name="Prologue" durationInFrames={120}>
            <Prologue />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: 10 })}
          />
          <TransitionSeries.Sequence
            name="Episode I — chat"
            durationInFrames={165}
          >
            <ChatScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: 10 })}
          />
          <TransitionSeries.Sequence
            name="Episode II — git"
            durationInFrames={225}
          >
            <GitScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: 10 })}
          />
          <TransitionSeries.Sequence
            name="Episode III — edit"
            durationInFrames={250}
          >
            <EditScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: 10 })}
          />
          <TransitionSeries.Sequence name="Finale" durationInFrames={150}>
            <Finale />
          </TransitionSeries.Sequence>
        </TransitionSeries>

        <CinemaLook />

        <Audio src={staticFile("sfx/drone.wav")} volume={0.5} />
        <Sequence name="SFX — riser to finale" from={688}>
          <Audio src={staticFile("sfx/riser.wav")} volume={0.6} />
        </Sequence>
      </AbsoluteFill>
    </LangProvider>
  );
};
