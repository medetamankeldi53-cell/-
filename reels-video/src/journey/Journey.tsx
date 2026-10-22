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
import { ClaudeScene, LatestScene } from "./Growth";
import { TrashScene } from "./Trash";
import { Voiceover } from "./Voiceover";

// «Уақыт» — ролик о пути: от первого фото до готовых работ.
// 90 + 125 + 185 + 165 + 170 + 165 + 140 + 255 + 145 + 540 + 150 = 2130 кадров = 71 с
export const Journey: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        <Series.Sequence name="1 Night" durationInFrames={90}>
          <NightScene />
        </Series.Sequence>
        <Series.Sequence name="2 First photo" durationInFrames={125}>
          <FirstPhotoScene />
        </Series.Sequence>
        <Series.Sequence name="3 Characters" durationInFrames={185}>
          <CharactersScene />
        </Series.Sequence>
        <Series.Sequence name="4 Prompts" durationInFrames={165}>
          <PromptsScene />
        </Series.Sequence>
        <Series.Sequence name="5 Fails" durationInFrames={170}>
          <FailsScene />
        </Series.Sequence>
        <Series.Sequence name="6 Trash" durationInFrames={165}>
          <TrashScene />
        </Series.Sequence>
        <Series.Sequence name="7 Nights" durationInFrames={140}>
          <NightsScene />
        </Series.Sequence>
        <Series.Sequence name="8 Claude" durationInFrames={255}>
          <ClaudeScene />
        </Series.Sequence>
        <Series.Sequence name="9 Payoff" durationInFrames={145}>
          <PayoffScene />
        </Series.Sequence>
        <Series.Sequence name="10 Latest works" durationInFrames={540}>
          <LatestScene />
        </Series.Sequence>
        <Series.Sequence name="11 Finale" durationInFrames={150}>
          <FinaleScene />
        </Series.Sequence>
      </Series>

      <CinemaLook />

      <Audio src={staticFile("sfx/drone.wav")} volume={0.35} loop />
      <Voiceover />
      <Sequence name="SFX — riser to payoff" from={1250}>
        <Audio src={staticFile("sfx/riser.wav")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
