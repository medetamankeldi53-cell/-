import { Composition, Folder } from "remotion";
import { Montage } from "./montage/Montage";
import { ReelsVideo } from "./ReelsVideo";
import { CtaScene } from "./scenes/CtaScene";
import { HookScene } from "./scenes/HookScene";
import { PointScene } from "./scenes/PointScene";

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
      {/* Монтаж из двух клипов: 60 + (68+75+48) + (52+60+75) − 6 − 8 = 424 кадра ≈ 14.1 с */}
      <Composition
        id="Montage"
        component={Montage}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={424}
      />
    </>
  );
};
