import { AbsoluteFill, Img, staticFile } from "remotion";
import "../fonts";
import { GOLD } from "./kit";

const SERIF = "'Cormorant Garamond', serif";

// Обложка Reels «Уақыт» на синем фоне в стиле постеров «Уақыт куәлері»
export const JourneyCover: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 42%, #1d3f78 0%, #102a57 45%, #071631 100%)",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Фактура холста */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", opacity: 0.22, mixBlendMode: "overlay" }}
      >
        <filter id="canvas">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.03"
            numOctaves="4"
            seed={7}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#canvas)" />
      </svg>

      <div
        style={{
          marginTop: 250,
          fontFamily: "Montserrat",
          fontSize: 34,
          fontWeight: 600,
          letterSpacing: 20,
          color: GOLD,
        }}
      >
        УАҚЫТ КУӘЛЕРІ
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: SERIF,
          fontSize: 250,
          fontWeight: 700,
          lineHeight: 1,
          color: "#f4efe4",
          letterSpacing: 6,
          textShadow: "0 10px 40px rgba(0,0,0,0.45)",
        }}
      >
        УАҚЫТ
      </div>
      <div
        style={{
          marginTop: 4,
          fontFamily: SERIF,
          fontSize: 76,
          fontWeight: 700,
          color: GOLD,
          textShadow: "0 6px 30px rgba(0,0,0,0.5)",
        }}
      >
        бір жолдың тарихы
      </div>

      {/* Первое фото: свет над отцом и сыном, края растворяются в синем */}
      <div
        style={{
          position: "absolute",
          top: 660,
          left: 0,
          right: 0,
          height: 820,
          WebkitMaskImage:
            "radial-gradient(ellipse 52% 50% at 50% 50%, #000 55%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 52% 50% at 50% 50%, #000 55%, transparent 100%)",
        }}
      >
        <Img
          src={staticFile("journey/first.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "52% 40%",
            scale: "1.15",
            filter: "contrast(1.08) saturate(0.9)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 1500,
          fontFamily: "Montserrat",
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: 6,
          color: "#f4efe4",
        }}
      >
        1 СУРЕТ <span style={{ color: GOLD }}>·</span> 1247 ӘРЕКЕТ{" "}
        <span style={{ color: GOLD }}>·</span> ТҮНДЕР
      </div>
      <div
        style={{
          position: "absolute",
          top: 1580,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 58,
          fontWeight: 500,
          color: "#d9d2c3",
        }}
      >
        Уақыт кетті. Бірақ бекер емес.
      </div>
    </AbsoluteFill>
  );
};
