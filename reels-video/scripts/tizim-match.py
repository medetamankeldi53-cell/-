"""«1916. Тізім»: подгоняем новые реплики под звук самого видео, чтобы не звучали «наложенными».

Для каждой реплики:
  1. EQ-матчинг: средний спектр (LTAS) старой речи в этом кадре / средний спектр новой
     реплики → сглаженная кривая усиления (±9 дБ), применяется FFT-фильтром.
  2. Пространство: короткий синтетический «уличный» отклик (ранние отражения + хвост),
     доля «мокрого» сигнала зависит от крупности плана.
  3. Громкость: RMS новой реплики приводится к RMS старой речи в этом окне.

Запуск (из reels-video/):  python3 -I scripts/tizim-match.py
Читает public/tizim/src.mp4 и A*.mp3, пишет public/tizim/A*m.wav.
"""

import subprocess

import numpy as np

SR = 48000
DIR = "public/tizim/"

# файл: (окно старой речи в исходнике, доля реверба, доп. затухание ВЧ для общего плана)
LINES = {
    "A1": ((1.8, 4.7), 0.10, 0.0),  # средний план
    "A2": ((7.2, 9.4), 0.20, 1.0),  # общий план — дальше и «воздушнее»
    "A3": ((10.1, 13.8), 0.06, 0.0),  # крупный, шёпот
    "A4": ((15.9, 19.4), 0.08, 0.0),  # крупный
    "A5": ((21.3, 23.1), 0.10, 0.0),  # средний
}


def load(path: str) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def ltas(x: np.ndarray, n: int = 2048) -> np.ndarray:
    hop = n // 2
    win = np.hanning(n)
    frames = [x[i : i + n] * win for i in range(0, len(x) - n, hop)]
    spec = np.abs(np.fft.rfft(np.array(frames), axis=1)) ** 2
    # только «громкие» кадры — это речь, а не тишина между словами
    energy = spec.sum(axis=1)
    keep = energy > np.percentile(energy, 40)
    return spec[keep].mean(axis=0) + 1e-12


def smooth_octave(g_db: np.ndarray, freqs: np.ndarray, frac: float = 1 / 3) -> np.ndarray:
    out = np.empty_like(g_db)
    for i, fr in enumerate(freqs):
        lo, hi = fr * 2 ** (-frac / 2), fr * 2 ** (frac / 2)
        m = (freqs >= lo) & (freqs <= hi)
        out[i] = g_db[m].mean() if m.any() else g_db[i]
    return out


def outdoor_ir(seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    tail = rng.standard_normal(n) * np.exp(-t / 0.07)
    tail[: int(0.012 * SR)] = 0
    for d, a in [(0.011, 0.5), (0.019, 0.35), (0.031, 0.25), (0.047, 0.15)]:
        tail[int(d * SR)] += a * 6
    # хвост темнее: простое сглаживание
    k = np.ones(12) / 12
    tail = np.convolve(tail, k, mode="same")
    return tail / np.sqrt((tail**2).sum())


def rms(x: np.ndarray) -> float:
    a = np.abs(x)
    loud = x[a > np.percentile(a, 60)]
    return float(np.sqrt((loud**2).mean()))


src = load(DIR + "src.mp4")
for i, (name, ((a, b), wet, dark)) in enumerate(LINES.items()):
    old = src[int(a * SR) : int(b * SR)]
    new = load(DIR + f"{name}.mp3")

    n = 2048
    freqs = np.fft.rfftfreq(n, 1 / SR)
    g_db = 10 * np.log10(ltas(old, n) / ltas(new, n))
    g_db -= np.median(g_db[(freqs > 300) & (freqs < 3000)])
    g_db = smooth_octave(g_db, freqs)
    g_db = np.clip(g_db * 0.7, -6, 6)  # 70 % кривой: тембр ближе, но без «телефона»
    g_db[freqs < 80] = -12
    if dark:
        g_db -= dark * np.clip((freqs - 4000) / 4000, 0, 1) * 6

    # применяем кривую ко всему файлу одним FFT
    N = len(new)
    spec = np.fft.rfft(new)
    f_all = np.fft.rfftfreq(N, 1 / SR)
    gain = 10 ** (np.interp(f_all, freqs, g_db) / 20)
    eq = np.fft.irfft(spec * gain, n=N)

    ir = outdoor_ir(i)
    rev = np.convolve(eq, ir)[: N + len(ir)]
    rev = np.pad(rev, (0, N + len(ir) - len(rev)))
    dry = np.concatenate([eq, np.zeros(len(ir))])
    out = dry * (1 - wet) + rev * wet * 0.6

    out *= rms(old) / rms(out)
    peak = np.abs(out).max()
    if peak > 0.95:
        out *= 0.95 / peak

    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-ac", "2", DIR + f"{name}m.wav"],
        input=out.astype(np.float32).tobytes(),
        check=True,
    )
    print(name, f"gain {20*np.log10(rms(old)/rms(eq)):+.1f} dB",
          "eq@200/1k/3k/6k:", [round(float(np.interp(x, freqs, g_db)), 1) for x in (200, 1000, 3000, 6000)])
