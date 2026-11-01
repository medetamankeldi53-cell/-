// Считает длительность озвучки каждого слайда и громкость по кадрам (для рта учителя)
// и записывает их в JSON урока.
//
//   node scripts/lesson-audio.mjs prompt-101
//
// Ожидает файлы public/lessons/<id>/01.mp3, 02.mp3, … (по одному на слайд).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/lesson-audio.mjs <lesson-id>");
  process.exit(1);
}
const jsonPath = `src/lesson/lessons/${id}.json`;
const lesson = JSON.parse(readFileSync(jsonPath, "utf8"));
const fps = lesson.fps ?? 30;
const PAD = 0.6; // пауза после фразы, секунд

lesson.slides.forEach((slide, i) => {
  const file = `public/lessons/${id}/${String(i + 1).padStart(2, "0")}.mp3`;
  if (!existsSync(file)) {
    console.warn(`нет озвучки: ${file} — слайд будет 4 с без голоса`);
    slide.durationSec = 4;
    slide.mouth = [];
    return;
  }
  const dur = Number(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
    ]).toString(),
  );
  // моно 16 кГц, s16le — считаем RMS на каждый кадр видео
  const pcm = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
    { maxBuffer: 1 << 28 },
  );
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length / 2);
  const per = Math.round(16000 / fps);
  const rms = [];
  for (let s = 0; s < samples.length; s += per) {
    let acc = 0;
    const end = Math.min(samples.length, s + per);
    for (let k = s; k < end; k++) acc += (samples[k] / 32768) ** 2;
    rms.push(Math.sqrt(acc / Math.max(1, end - s)));
  }
  const peak = Math.max(...rms, 1e-6);
  slide.mouth = rms.map((v) => Math.round(Math.min(1, (v / peak) * 1.6) * 100) / 100);
  slide.durationSec = Math.round((dur + PAD) * 100) / 100;
  console.log(`${file}: ${dur.toFixed(2)} c`);
});

writeFileSync(jsonPath, JSON.stringify(lesson, null, 2) + "\n");
const total = lesson.slides.reduce((a, s) => a + s.durationSec, 0);
console.log(`итого: ${total.toFixed(1)} c, записано в ${jsonPath}`);
