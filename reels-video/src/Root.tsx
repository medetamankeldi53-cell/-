import { Composition, Folder, Still } from "remotion";
import { Montage } from "./montage/Montage";
import { JourneyCover } from "./journey/Cover";
import { Journey } from "./journey/Journey";
import { Agents, AGENTS_DURATION } from "./agents/Agents";
import { FLAT_DURATION, FlatDemo } from "./flat/FlatDemo";
import { Toi, TOI_DURATION } from "./toi/Toi";
import { ReelsVideo } from "./ReelsVideo";
import { Witness } from "./witness/Witness";
import { CtaScene } from "./scenes/CtaScene";
import { HookScene } from "./scenes/HookScene";
import { PointScene } from "./scenes/PointScene";
import { ChatScene } from "./story/ChatScene";
import { EditScene } from "./story/EditScene";
import { Finale } from "./story/Finale";
import { GitScene } from "./story/GitScene";
import { Prologue } from "./story/Prologue";
import { Story } from "./story/Story";

// Reels / Shorts / TikTok: 1080×1920, 30 fps.
// Длительность основного ролика: 75 + 90×3 + 90 − 12×4 (переходы) = 387 кадров ≈ 12.9 c
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Reels-Scenes">
        <Composition
          id="Hook"
          component={HookScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={75}
        />
        <Composition
          id="Point"
          component={PointScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            number: 1,
            title: "Нет хука",
            text: "Первые 2 секунды решают всё. Начинай с вопроса или сильного заявления.",
            color: "#ff3d6e",
          }}
        />
        <Composition
          id="CTA"
          component={CtaScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={90}
        />
      </Folder>
      <Composition
        id="Reels"
        component={ReelsVideo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={387}
      />
      {/* Монтаж из двух клипов: 60 + (68+75+48) + (52+60+75) − 6 − 14 = 418 кадров ≈ 13.9 с */}
      <Composition
        id="Montage"
        component={Montage}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={418}
      />
      <Folder name="Story-Scenes">
        <Composition
          id="Prologue"
          component={Prologue}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={120}
        />
        <Composition
          id="EpisodeChat"
          component={ChatScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={165}
        />
        <Composition
          id="EpisodeGit"
          component={GitScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={225}
        />
        <Composition
          id="EpisodeEdit"
          component={EditScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={250}
        />
        <Composition
          id="Finale"
          component={Finale}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={150}
        />
      </Folder>
      {/* Трейлер «Монтаж с Claude»: 120 + 165 + 225 + 250 + 150 − 4 × 10 = 870 кадров ≈ 29 с */}
      <Composition
        id="Story"
        component={Story}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={870}
        defaultProps={{ lang: "ru" }}
      />
      {/* Казахская версия трейлера */}
      <Composition
        id="StoryKZ"
        component={Story}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={870}
        defaultProps={{ lang: "kk" }}
      />
      {/* «Уақыт» — путь от первого фото до готовых работ: 2050 кадров ≈ 68 с */}
      <Composition
        id="Journey"
        component={Journey}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={2050}
      />
      {/* Обложка Reels «Уақыт» */}
      <Still
        id="JourneyCover"
        component={JourneyCover}
        width={1080}
        height={1920}
      />
      {/* «Уақыт куәлары: 1906–1916» — архивный документальный монтаж, 1589 кадров ≈ 53 с */}
      <Composition
        id="Witness"
        component={Witness}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1589}
      />
      {/* «Агенттер» — казахская версия ролика @kireev.voice, пиксель-арт */}
      <Composition
        id="Agents"
        component={Agents}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={AGENTS_DURATION}
      />
      {/* 2D flat демо: персонажи нарисованы кодом (SVG) */}
      <Composition
        id="FlatDemo"
        component={FlatDemo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={FLAT_DURATION}
      />
      {/* «Агенттер той жасайды» — 2D flat, полный ролик */}
      <Composition
        id="Toi"
        component={Toi}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={TOI_DURATION}
      />
    </>
  );
};
