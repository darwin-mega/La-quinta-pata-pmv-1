import fs from "fs";
import path from "path";

const sampleRate = 44100;
const outDir = path.join(process.cwd(), "public", "audio");
fs.mkdirSync(outDir, { recursive: true });

const clamp = (value) => Math.max(-1, Math.min(1, value));
const sine = (freq, t) => Math.sin(2 * Math.PI * freq * t);
const triangle = (freq, t) => (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * t));
const saw = (freq, t) => 2 * (freq * t - Math.floor(freq * t + 0.5));
const square = (freq, t) => Math.sign(sine(freq, t));
const sweep = (fromFreq, toFreq, t, duration) => {
  const safeDuration = Math.max(duration, 0.001);
  return Math.sin(2 * Math.PI * (fromFreq * t + ((toFreq - fromFreq) / (2 * safeDuration)) * t * t));
};
const envelope = (t, duration, attack = 0.01, curve = 1.8) => {
  if (t < attack) return t / Math.max(attack, 0.001);
  const tail = Math.max(0, 1 - (t - attack) / Math.max(duration - attack, 0.001));
  return Math.pow(tail, curve);
};
const softNoise = () => (Math.random() * 2 - 1) * 0.08;

function writeWav(fileName, durationSec, sampleFn) {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const dataSize = totalSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const sample = clamp(sampleFn(t, i, totalSamples));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(outDir, fileName), buffer);
}

writeWav("button.wav", 0.16, (t) => {
  const env = envelope(t, 0.16, 0.008, 2.2);
  return 0.22 * env * (0.7 * sine(720, t) + 0.3 * sine(1080, t));
});

writeWav("phase-change.wav", 0.38, (t) => {
  const env = envelope(t, 0.38, 0.015, 1.9);
  return 0.18 * env * (0.6 * sweep(380, 620, t, 0.38) + 0.4 * sweep(520, 780, t, 0.38));
});

writeWav("tick.wav", 0.11, (t) => {
  const env = envelope(t, 0.11, 0.004, 2.4);
  return 0.15 * env * (0.8 * square(950, t) + 0.2 * sine(1400, t));
});

writeWav("timeout.wav", 0.48, (t) => {
  const notes = [880, 740, 520];
  const segment = 0.14;
  let sum = 0;
  notes.forEach((freq, index) => {
    const localT = t - index * 0.1;
    if (localT >= 0 && localT <= segment) {
      sum += 0.12 * envelope(localT, segment, 0.01, 2.1) * triangle(freq, localT);
    }
  });
  return sum;
});

writeWav("turn.wav", 0.55, (t) => {
  const env = envelope(t, 0.55, 0.02, 1.6);
  const lead = sweep(440, 880, Math.min(t, 0.18), 0.18);
  const pad = sine(660, t) * 0.45;
  return 0.2 * env * (0.65 * lead + pad);
});

writeWav("fallacy.wav", 0.5, (t) => {
  const env = envelope(t, 0.5, 0.012, 1.7);
  const dissonance = 0.55 * saw(300, t) + 0.45 * square(312, t);
  const downSweep = 0.5 * sweep(320, 110, Math.min(t, 0.34), 0.34);
  return 0.17 * env * (dissonance + downSweep);
});

writeWav("victory.wav", 1.8, (t) => {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  let sum = 0;
  notes.forEach((freq, index) => {
    const start = index * 0.16;
    const localT = t - start;
    if (localT >= 0 && localT <= 1.1) {
      const env = envelope(localT, 1.1, 0.03, 1.5);
      sum += 0.11 * env * (0.7 * sine(freq, localT) + 0.3 * sine(freq * 2, localT));
    }
  });
  return sum;
});

writeWav("ambience-loop.wav", 12, (t) => {
  const chords = [
    [130.81, 196.0, 261.63],
    [146.83, 220.0, 293.66],
    [164.81, 246.94, 329.63],
    [174.61, 261.63, 349.23],
  ];
  const section = Math.floor(t / 3) % chords.length;
  const [root, mid, top] = chords[section];
  const globalBed = Math.sin((Math.PI * t) / 12) ** 1.2;
  const shimmer = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.08 * t);

  return (
    globalBed * (
      0.06 * sine(root, t) +
      0.045 * sine(mid, t) +
      0.03 * sine(top, t) +
      0.018 * triangle(root / 2, t) +
      0.012 * shimmer * sine(top * 2, t) +
      0.01 * softNoise()
    )
  );
});

console.log("Audio WAV files generated in public/audio:");
for (const fileName of fs.readdirSync(outDir)) {
  const { size } = fs.statSync(path.join(outDir, fileName));
  console.log(`- ${fileName} (${Math.round(size / 1024)} KB)`);
}
