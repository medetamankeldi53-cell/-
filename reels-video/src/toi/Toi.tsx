import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, clamp } from "../flat/characters";
import { GOLD } from "./parts";
import {
  SceneChat,
  SceneCouple,
  SceneDoor,
  SceneEnvelopes,
  SceneHall,
  SceneIdea,
  SceneList,
  SceneLoan,
  SceneMoral,
  SceneNews,
  SceneReveal,
  SceneRole,
  SceneToast,
} from "./scenes";

// «Агенттер той жасайды» — 2D flat, голос ElevenLabs (Alex Bell), концовка роботом
export const TOI_DURATION = 1590;

// Субтитры по фразам голоса: [начало, конец (кадры), текст]; *слово* — акцент
const SUBS: [number, number, string][] = [
  [0, 73, "ҚЫСҚАСЫ, ІНІМ *ҮЙЛЕНЕТІН* БОЛДЫ."],
  [73, 123, "ТОЙ — *БІР* *АЙДАН* КЕЙІН."],
  [123, 152, "МЕН ОЙЛАДЫМ:"],
  [152, 236, "НЕГЕ ӘУРЕ БОЛАМЫН? БӘРІН *АГЕНТТЕРГЕ* БЕРЕМІН!"],
  [236, 280, "*АСАБАҒА* — АГЕНТ."],
  [280, 338, "*ШАҚЫРУ* ЖАЗУҒА — АГЕНТ."],
  [338, 385, "*МӘЗІРГЕ* — АГЕНТ."],
  [385, 475, "БІР АГЕНТ ТЕК АПАЛАРҒА *«МӘШАЛЛА»* ДЕП ЖАЗАДЫ."],
  [475, 567, "ТАҒЫ БІРЕУІ — КІМ ҚАНША *КОНВЕРТ* САЛҒАНЫН САНАЙДЫ."],
  [567, 641, "ТОЙДЫҢ КҮНІ КЕЛДІ. *ЗАЛ* ТОЛЫ."],
  [641, 685, "ҚОНАҚТАРДЫҢ БӘРІ…"],
  [685, 719, "*АГЕНТТЕР.*"],
  [719, 778, "АСАБА-АГЕНТ *ТОСТ* АЙТЫП ЖАТЫР."],
  [778, 816, "*ҮШ* *САҒАТ* БОЙЫ!"],
  [816, 906, "*КҮЙЕУ* — АГЕНТ. *КЕЛІН* ДЕ — АГЕНТ."],
  [906, 947, "АЛ *ІНІМ* ҚАЙДА?"],
  [947, 1051, "ІНІМДІ АГЕНТТЕР *«VIP* *ЕМЕС»* ДЕП СЫЗЫП ТАСТАПТЫ!"],
  [1051, 1087, "МЕНІ ДЕ *КІРГІЗБЕДІ.*"],
  [1087, 1123, "ЕСІКТЕГІ АГЕНТ:"],
  [1123, 1173, "*«СІЗ* *ТІЗІМДЕ* *ЖОҚСЫЗ».*"],
  [1173, 1219, "СОСЫН НЕ БОЛДЫ, БІЛЕСІЗ БЕ?"],
  [1219, 1292, "АГЕНТТЕР ТОЙҒА *ҚАРЫЗ* АЛЫПТЫ."],
  [1292, 1330, "ТОЙ — *БІР* *КҮН.*"],
  [1330, 1376, "ҚАРЫЗ — *БІР* *ЖЫЛ.*"],
  [1376, 1420, "ТӨЛЕЙТІН — *МЕН.*"],
  [1420, 1454, "МЕН *АГЕНТПІН.*"],
  [1454, 1510, "БҰЛ ТОЙДЫ *МЕН* ҰЙЫМДАСТЫРДЫМ."],
  [1510, 1565, "КЕЛЕСІ ТОЙ — *СІЗДІКІ* *МЕ?*"],
];

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 5], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.8)),
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <div
        style={{
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 62,
          lineHeight: 1.15,
          textAlign: "center",
          color: "#fff",
          scale: String(interpolate(p, [0, 1], [0.7, 1])),
          opacity: p,
          textShadow: `0 0 2px ${C.ink}, 5px 5px 0 ${C.ink}, -2px -2px 0 ${C.ink}, 2px -2px 0 ${C.ink}, -2px 2px 0 ${C.ink}`,
        }}
      >
        {text.split(" ").map((w, i) => {
          const m = /^\*(.+)\*([,.!?:…]*)$/.exec(w);
          return (
            <span key={i}>
              {m ? <span style={{ color: GOLD }}>{m[1]}</span> : w}
              {m ? m[2] : null}{" "}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Раскадровка: [начало (кадр), конец, сцена]
const SCENES: [number, number, React.ReactNode, string][] = [
  [0, 121, <SceneNews key="n" />, "Жаңалық"],
  [121, 235, <SceneIdea key="i" />, "Идея"],
  [
    235,
    280,
    <SceneRole key="a" role="asaba" label="АСАБА" a="#c2410c" b="#ea580c" />,
    "Асаба",
  ],
  [
    280,
    337,
    <SceneRole key="v" role="invite" label="ШАҚЫРУ" a="#1d4ed8" b="#2563eb" />,
    "Шақыру",
  ],
  [
    337,
    384,
    <SceneRole key="m" role="menu" label="МӘЗІР" a="#15803d" b="#16a34a" />,
    "Мәзір",
  ],
  [384, 474, <SceneChat key="c" />, "Апалар чаты"],
  [474, 567, <SceneEnvelopes key="e" />, "Конверттер"],
  [567, 719, <SceneHall key="h" />, "Тойхана"],
  [719, 816, <SceneToast key="t" />, "Тост"],
  [816, 906, <SceneCouple key="k" />, "Күйеу мен келін"],
  [906, 1050, <SceneList key="l" />, "Тізім"],
  [1050, 1172, <SceneDoor key="d" />, "Есік"],
  [1172, 1292, <SceneLoan key="q" />, "Несие"],
  [1292, 1418, <SceneMoral key="o" />, "Той бір күн"],
  [1418, TOI_DURATION, <SceneReveal key="r" />, "Агент"],
];

// Звуки: [кадр, файл, громкость]
const SFX: [number, string, number][] = [
  [10, "pop", 0.6],
  [73, "pop", 0.8],
  [127, "chime", 0.5],
  ...[152, 158, 164, 170, 176, 182, 188].map((f): [number, string, number] => [
    f,
    "pop",
    0.6,
  ]),
  [235, "whoosh", 0.6],
  [280, "whoosh", 0.6],
  [337, "whoosh", 0.6],
  [384, "blip", 0.5],
  [474, "whoosh", 0.6],
  [567, "chime", 0.4],
  [685, "boom", 0.8],
  [778, "riser", 0.4],
  [816, "chime", 0.6],
  [996, "boom", 0.7],
  [1123, "error8", 0.6],
  [1219, "buzz", 0.5],
  [1292, "boom", 0.6],
  [1330, "boom", 0.6],
  [1376, "boom", 0.8],
  [1418, "glitch", 0.7],
];

export const Toi: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SCENES.map(([from, to, node, name]) => (
        <Sequence
          key={name}
          name={name}
          from={from}
          durationInFrames={to - from}
        >
          {node}
        </Sequence>
      ))}

      {SUBS.map(([from, to, text], i) => (
        <Sequence
          key={i}
          name={`Sub ${i}`}
          from={from}
          durationInFrames={to - from}
        >
          <Subtitle text={text} />
        </Sequence>
      ))}

      {SFX.map(([f, name, vol], i) => (
        <Sequence key={i} name={`SFX ${name}`} from={f}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
      <Audio src={staticFile("toi/voice.mp3")} />
    </AbsoluteFill>
  );
};
