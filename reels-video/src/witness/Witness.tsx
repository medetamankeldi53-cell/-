import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { GOLD, Narration, PosterCard } from "../journey/kit";
import { CinemaLook } from "../story/ui";
import { ArchivePrint, FilmFlicker, SERIF, YearCard } from "./parts";
import { WitnessVoiceover } from "./Voiceover";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Заставка: «УАҚЫТ КУӘЛАРЫ · 1906 — 1916»
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07070a",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Montserrat",
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: 22,
          color: GOLD,
          opacity: interpolate(frame, [10, 30], [0, 1], clamp),
        }}
      >
        УАҚЫТ КУӘЛАРЫ
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: SERIF,
          fontSize: 150,
          fontWeight: 700,
          color: "#f4efe4",
          opacity: interpolate(frame, [36, 48], [0, 1], clamp),
          scale: String(interpolate(frame, [36, 120], [1.12, 1], clamp)),
        }}
      >
        1906 — 1916
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 54,
          fontWeight: 500,
          color: "#d9d2c3",
          opacity: interpolate(frame, [60, 75], [0, 1], clamp),
        }}
      >
        архив куәландырады
      </div>
      <Sequence name="SFX — title" from={36}>
        <Audio src={staticFile("sfx/boom.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Финал: «Олар — уақыттың куәлары. Біз — олардың жалғасы.» + источники
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#07070a" }}>
      <AbsoluteFill style={{ opacity: 0.22, filter: "blur(3px) sepia(0.5)" }}>
        <ArchivePrint src="witness/nomads1911.jpg" ratio={1.076} caption="" />
      </AbsoluteFill>
      <Sequence durationInFrames={78}>
        <Narration text="Олар — *уақыттың* *куәлары.*" size={84} bottom={900} />
      </Sequence>
      <Sequence from={78}>
        <Narration text="Біз — олардың *жалғасы.*" size={84} bottom={900} />
      </Sequence>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 200,
          textAlign: "center",
          opacity: interpolate(frame, [20, 40], [0, 1], clamp),
        }}
      >
        <div
          style={{
            fontFamily: "Montserrat",
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: 18,
            color: GOLD,
          }}
        >
          УАҚЫТ КУӘЛАРЫ
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.35,
            color: "#a9a191",
            padding: "0 90px",
          }}
        >
          Архив: С. Прокудин-Горский (1911), С. Дудин (1899), «Қазақ» газеті
          (1913) — Wikimedia Commons, public domain. Постерлер — AI.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// «Уақыт куәлары: 1906–1916» — документальный монтаж из архивных фото
// 150 + 180 + 237 + 347 + 440 + 150 = 1504 кадров ≈ 50 с
export const Witness: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        <Series.Sequence name="Intro" durationInFrames={150}>
          <Intro />
        </Series.Sequence>

        {/* Дала */}
        <Series.Sequence name="Steppe" durationInFrames={180}>
          <Sequence name="Nomads 1911" durationInFrames={90}>
            <ArchivePrint
              src="witness/nomads1911.jpg"
              ratio={1.076}
              caption="Көшпелі отбасы. Мырзашөл, 1911 · С. Прокудин-Горский"
              rotate={-1.5}
            />
          </Sequence>
          <Sequence name="Eagle hunter" from={90} durationInFrames={45}>
            <ArchivePrint
              src="witness/eagle.jpg"
              ratio={1.433}
              caption="Бүркітші · С. Дудин"
              rotate={1.2}
              bw
            />
          </Sequence>
          <Sequence name="Bride" from={135} durationInFrames={45}>
            <ArchivePrint
              src="witness/saukele1899.jpg"
              ratio={0.65}
              caption="Сәукелелі қалыңдық, 1899 · С. Дудин"
              rotate={-1}
              bw
            />
          </Sequence>
          <Narration text="XX ғасырдың басы. *Қазақ* *даласы.*" bottom={230} />
        </Series.Sequence>

        {/* 1906 · Жер */}
        <Series.Sequence name="1906 Land" durationInFrames={237}>
          <Sequence name="Year" durationInFrames={66}>
            <YearCard year="1906" word="ЖЕР" />
          </Sequence>
          <Sequence name="Settlers" from={66} durationInFrames={105}>
            <ArchivePrint
              src="witness/settlers1911.jpg"
              ratio={1.052}
              caption="Қоныс аударушылар үйі, 1911 · С. Прокудин-Горский"
              rotate={1}
            />
            <Narration
              text="Столыпин реформасы. *Қоныс* *аудару* басталды."
              bottom={230}
            />
          </Sequence>
          <Sequence name="Poster 1906" from={171} durationInFrames={66}>
            <PosterCard src="journey/poster-1906.jpg" />
          </Sequence>
          <Sequence name="SFX — year">
            <Audio src={staticFile("sfx/boom.wav")} />
          </Sequence>
          <Sequence name="SFX — poster" from={171}>
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
          </Sequence>
        </Series.Sequence>

        {/* 1913 · Сөз */}
        <Series.Sequence name="1913 Word" durationInFrames={347}>
          <Sequence name="Year" durationInFrames={66}>
            <YearCard year="1913" word="СӨЗ" />
          </Sequence>
          <Sequence name="Qazaq newspaper" from={66} durationInFrames={76}>
            <ArchivePrint
              src="witness/qazaq1913.jpg"
              ratio={1.166}
              caption="«Қазақ» газетінің белгісі, 1913"
              rotate={-1}
              bw
            />
            <Narration text="2 ақпан. *«Қазақ»* газеті шықты." bottom={230} />
          </Sequence>
          <Sequence name="Baitursynov" from={142} durationInFrames={75}>
            <ArchivePrint
              src="witness/baitursynov1913.jpg"
              ratio={0.75}
              caption="Ахмет Байтұрсынұлы, 1913"
              rotate={1.2}
              bw
            />
            <Narration
              text="Редакторы — *Ахмет* *Байтұрсынұлы.*"
              bottom={230}
            />
          </Sequence>
          <Sequence name="Teacher" from={217} durationInFrames={56}>
            <ArchivePrint
              src="witness/teacher.jpg"
              ratio={1.393}
              caption="Ұстаз бен шәкірттер · С. Дудин"
              rotate={-1.2}
              bw
            />
            <Narration text="Сөз — *ұлтты* оятты." bottom={230} />
          </Sequence>
          <Sequence name="Poster 1913" from={273} durationInFrames={74}>
            <PosterCard src="journey/poster-1913.jpg" />
          </Sequence>
          <Sequence name="SFX — year">
            <Audio src={staticFile("sfx/boom.wav")} />
          </Sequence>
          <Sequence name="SFX — poster" from={273}>
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
          </Sequence>
        </Series.Sequence>

        {/* 1916 · Көтеріліс */}
        <Series.Sequence name="1916 Uprising" durationInFrames={440}>
          <Sequence name="Year" durationInFrames={45}>
            <YearCard year="1916" word="КӨТЕРІЛІС" />
          </Sequence>
          <Sequence name="Map" from={45} durationInFrames={80}>
            <ArchivePrint
              src="witness/map1916.jpg"
              ratio={0.634}
              caption="1916 жылғы Жетісу көтерілісінің картасы, 1917"
              rotate={-0.8}
            />
            <Narration text="25 маусым. *Патша* *жарлығы.*" bottom={230} />
          </Sequence>
          <Sequence name="Cossack" from={125} durationInFrames={145}>
            <ArchivePrint
              src="witness/cossack1911.jpg"
              ratio={1.088}
              caption="Жетісу казагы, 1911 · С. Прокудин-Горский"
              rotate={1}
            />
            <Narration
              text="19–43 жастағы ер-азаматтарды *тыл* *жұмысына* алу бұйырылды."
              bottom={230}
            />
          </Sequence>
          <Sequence name="Rise" from={270} durationInFrames={50}>
            <AbsoluteFill style={{ backgroundColor: "#07070a" }} />
            <Narration text="Дала *көтерілді.*" size={110} bottom={880} />
          </Sequence>
          <Sequence name="SFX — year">
            <Audio src={staticFile("sfx/boom.wav")} />
          </Sequence>
          <Sequence name="Poster 1916 — Себеп" from={320} durationInFrames={60}>
            <PosterCard src="journey/poster-1916-sebep.jpg" />
          </Sequence>
          <Sequence name="Poster 1916 — Тізім" from={380} durationInFrames={60}>
            <PosterCard src="journey/poster-1916-tizim.jpg" />
          </Sequence>
          <Sequence name="SFX — poster sebep" from={320}>
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
          </Sequence>
          <Sequence name="SFX — poster tizim" from={380}>
            <Audio src={staticFile("sfx/boom.wav")} />
          </Sequence>
          <Sequence name="SFX — rise" from={270}>
            <Audio src={staticFile("sfx/boom.wav")} />
          </Sequence>
        </Series.Sequence>

        <Series.Sequence name="Outro" durationInFrames={150}>
          <Outro />
        </Series.Sequence>
      </Series>

      <FilmFlicker />
      <CinemaLook />

      <Audio src={staticFile("sfx/drone.wav")} volume={0.3} loop />
      <WitnessVoiceover />
      <Audio src={staticFile("sfx/projector.wav")} volume={0.22} loop />
      <Sequence name="SFX — outro" from={1354}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
