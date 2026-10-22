import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, Series, staticFile } from "remotion";
import { CinemaLook } from "../story/ui";
import { FirstPhotoScene, NightScene } from "./Opening";
import { FinaleScene, PayoffScene } from "./Payoff";
import {
  CharactersScene,
  FailsScene,
  NightsScene,
  PromptsScene,
} from "./Process";
import { TrashScene } from "./Trash";

// «Уақыт» — ролик о пути: от первого фото до готовых работ.
// 120 + 180 + 240 + 210 + 210 + 210 + 180 + 420 + 150 = 1920 кадров = 64 с
export const Journey: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        <Series.Sequence name="1 Night" durationInFrames={120}>
          <NightScene />
        </Series.Sequence>
        <Series.Sequence name="2 First photo" durationInFrames={180}>
          <FirstPhotoScene />
        </Series.Sequence>
        <Series.Sequence name="3 Characters" durationInFrames={240}>
          <CharactersScene />
        </Series.Sequence>
        <Series.Sequence name="4 Prompts" durationInFrames={210}>
          <PromptsScene />
        </Series.Sequence>
        <Series.Sequence name="5 Fails" durationInFrames={210}>
          <FailsScene />
        </Series.Sequence>
        <Series.Sequence name="6 Trash" durationInFrames={210}>
          <TrashScene />
        </Series.Sequence>
        <Series.Sequence name="7 Nights" durationInFrames={180}>
          <NightsScene />
        </Series.Sequence>
        <Series.Sequence name="8 Payoff" durationInFrames={420}>
          <PayoffScene />
        </Series.Sequence>
        <Series.Sequence name="9 Finale" durationInFrames={150}>
          <FinaleScene />
        </Series.Sequence>
      </Series>

      <CinemaLook />

      <Audio src={staticFile("sfx/drone.wav")} volume={0.55} loop />
      <Sequence name="SFX — riser to payoff" from={1305}>
        <Audio src={staticFile("sfx/riser.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
