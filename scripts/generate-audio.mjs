import fs from "fs";
import path from "path";

// 32 kHz preserves the useful spectrum for game UI audio while keeping the
// free-hosting and mobile payload materially smaller than CD-rate WAV files.
const sampleRate = 32000;
const outDir = path.join(process.cwd(), "public", "audio");
fs.mkdirSync(outDir, { recursive: true });

const TAU = Math.PI * 2;
const clamp = (value, min = -1, max = 1) => Math.max(min, Math.min(max, value));
const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const panGains = (pan) => [Math.cos((pan + 1) * Math.PI / 4), Math.sin((pan + 1) * Math.PI / 4)];
const smoothstep = (value) => {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
};

function createBuffer(duration) {
  const length = Math.ceil(duration * sampleRate);
  return { left: new Float64Array(length), right: new Float64Array(length), duration };
}

function envelope(t, duration, attack = 0.01, release = 0.15) {
  if (t < 0 || t > duration) return 0;
  const inGain = smoothstep(t / Math.max(attack, 0.001));
  const outGain = smoothstep((duration - t) / Math.max(release, 0.001));
  return Math.min(inGain, outGain);
}

function addTone(buffer, {
  start = 0,
  duration,
  frequency,
  endFrequency = frequency,
  gain = 0.2,
  attack = 0.01,
  release = 0.15,
  pan = 0,
  harmonics = [1],
  vibrato = 0,
  vibratoRate = 5,
}) {
  const first = Math.max(0, Math.floor(start * sampleRate));
  const last = Math.min(buffer.left.length, Math.ceil((start + duration) * sampleRate));
  const [leftPan, rightPan] = panGains(pan);
  let phase = 0;

  for (let i = first; i < last; i += 1) {
    const t = i / sampleRate - start;
    const progress = t / duration;
    const baseFrequency = frequency * (endFrequency / frequency) ** progress;
    const currentFrequency = baseFrequency * (1 + vibrato * Math.sin(TAU * vibratoRate * t));
    phase += TAU * currentFrequency / sampleRate;
    let sample = 0;
    let harmonicWeight = 0;

    harmonics.forEach((weight, index) => {
      harmonicWeight += Math.abs(weight);
      sample += weight * Math.sin(phase * (index + 1));
    });

    sample = harmonicWeight ? sample / harmonicWeight : sample;
    const value = sample * gain * envelope(t, duration, attack, release);
    buffer.left[i] += value * leftPan;
    buffer.right[i] += value * rightPan;
  }
}

function addNoise(buffer, {
  start = 0,
  duration,
  gain = 0.08,
  attack = 0.003,
  release = 0.08,
  pan = 0,
  color = 0.35,
  seed = 12345,
}) {
  const first = Math.max(0, Math.floor(start * sampleRate));
  const last = Math.min(buffer.left.length, Math.ceil((start + duration) * sampleRate));
  const [leftPan, rightPan] = panGains(pan);
  let state = seed >>> 0;
  let filtered = 0;

  for (let i = first; i < last; i += 1) {
    state = (1664525 * state + 1013904223) >>> 0;
    const white = (state / 0xffffffff) * 2 - 1;
    filtered += color * (white - filtered);
    const t = i / sampleRate - start;
    const value = filtered * gain * envelope(t, duration, attack, release);
    buffer.left[i] += value * leftPan;
    buffer.right[i] += value * rightPan;
  }
}

function addDelay(buffer, delaySeconds, feedback = 0.18, cross = 0.25) {
  const delay = Math.floor(delaySeconds * sampleRate);
  for (let i = delay; i < buffer.left.length; i += 1) {
    const delayedLeft = buffer.left[i - delay];
    const delayedRight = buffer.right[i - delay];
    buffer.left[i] += feedback * ((1 - cross) * delayedLeft + cross * delayedRight);
    buffer.right[i] += feedback * ((1 - cross) * delayedRight + cross * delayedLeft);
  }
}

function softenAndNormalize(buffer, target = 0.86) {
  let peak = 0;
  for (let i = 0; i < buffer.left.length; i += 1) {
    buffer.left[i] = Math.tanh(buffer.left[i] * 1.18);
    buffer.right[i] = Math.tanh(buffer.right[i] * 1.18);
    peak = Math.max(peak, Math.abs(buffer.left[i]), Math.abs(buffer.right[i]));
  }

  const scale = peak > 0 ? target / peak : 1;
  for (let i = 0; i < buffer.left.length; i += 1) {
    buffer.left[i] *= scale;
    buffer.right[i] *= scale;
  }
}

function writeStereoWav(fileName, buffer, target = 0.86) {
  softenAndNormalize(buffer, target);
  const channels = 2;
  const bytesPerSample = 2;
  const dataSize = buffer.left.length * channels * bytesPerSample;
  const wav = Buffer.alloc(44 + dataSize);

  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + dataSize, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(channels, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  wav.writeUInt16LE(channels * bytesPerSample, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < buffer.left.length; i += 1) {
    wav.writeInt16LE(Math.round(clamp(buffer.left[i]) * 32767), 44 + i * 4);
    wav.writeInt16LE(Math.round(clamp(buffer.right[i]) * 32767), 46 + i * 4);
  }

  fs.writeFileSync(path.join(outDir, fileName), wav);
}

function makeButton(fileName, note, seed, pan) {
  const sound = createBuffer(0.19);
  addNoise(sound, { duration: 0.045, gain: 0.32, release: 0.04, color: 0.52, seed, pan });
  addTone(sound, { start: 0.012, duration: 0.13, frequency: midi(note), endFrequency: midi(note + 3), gain: 0.22, attack: 0.003, release: 0.11, pan, harmonics: [1, 0.28, 0.12] });
  addTone(sound, { start: 0.025, duration: 0.1, frequency: midi(note + 12), gain: 0.08, attack: 0.002, release: 0.09, pan: -pan });
  writeStereoWav(fileName, sound, 0.58);
}

makeButton("button.wav", 74, 1701, -0.1);
makeButton("button-soft.wav", 72, 2903, 0.08);
makeButton("button-bright.wav", 77, 4109, 0.16);

const phase = createBuffer(0.82);
addNoise(phase, { duration: 0.55, gain: 0.13, attack: 0.16, release: 0.18, color: 0.08, seed: 8301, pan: -0.35 });
addTone(phase, { start: 0.08, duration: 0.58, frequency: midi(55), endFrequency: midi(67), gain: 0.2, attack: 0.04, release: 0.22, pan: -0.25, harmonics: [1, 0.35, 0.18] });
addTone(phase, { start: 0.17, duration: 0.54, frequency: midi(62), endFrequency: midi(74), gain: 0.15, attack: 0.04, release: 0.2, pan: 0.3, harmonics: [1, 0.24] });
addTone(phase, { start: 0.48, duration: 0.25, frequency: midi(79), gain: 0.11, attack: 0.008, release: 0.2, pan: 0.55, harmonics: [1, 0.15, 0.08] });
addDelay(phase, 0.105, 0.16, 0.7);
writeStereoWav("phase-change.wav", phase, 0.72);

function makeTick(fileName, note, seed, pan) {
  const sound = createBuffer(0.12);
  addNoise(sound, { duration: 0.025, gain: 0.24, release: 0.02, color: 0.72, seed, pan });
  addTone(sound, { duration: 0.105, frequency: midi(note), endFrequency: midi(note - 1), gain: 0.19, attack: 0.002, release: 0.09, pan, harmonics: [1, 0.45, 0.2, 0.08] });
  writeStereoWav(fileName, sound, 0.46);
}

makeTick("tick.wav", 81, 5113, -0.08);
makeTick("tick-alt.wav", 79, 6121, 0.08);

const timeout = createBuffer(1.08);
[69, 65, 60].forEach((note, index) => {
  addTone(timeout, { start: index * 0.19, duration: 0.31, frequency: midi(note), endFrequency: midi(note - 2), gain: 0.24, attack: 0.008, release: 0.23, pan: index === 1 ? 0.18 : -0.12, harmonics: [1, 0.48, 0.2] });
});
addTone(timeout, { start: 0.52, duration: 0.5, frequency: midi(38), endFrequency: midi(33), gain: 0.28, attack: 0.008, release: 0.42, harmonics: [1, 0.3] });
addNoise(timeout, { start: 0.51, duration: 0.16, gain: 0.18, release: 0.14, color: 0.18, seed: 7013 });
addDelay(timeout, 0.13, 0.12, 0.55);
writeStereoWav("timeout.wav", timeout, 0.8);

const turn = createBuffer(1.24);
addTone(turn, { duration: 0.34, frequency: midi(38), endFrequency: midi(35), gain: 0.28, attack: 0.006, release: 0.28, harmonics: [1, 0.25] });
addNoise(turn, { duration: 0.12, gain: 0.22, attack: 0.002, release: 0.1, color: 0.15, seed: 8111 });
[62, 66, 69].forEach((note, index) => {
  addTone(turn, { start: 0.1 + index * 0.13, duration: 0.72, frequency: midi(note), gain: 0.17, attack: 0.025, release: 0.48, pan: [-0.4, 0.05, 0.4][index], harmonics: [1, 0.42, 0.18, 0.08], vibrato: 0.002, vibratoRate: 5.2 });
});
addTone(turn, { start: 0.48, duration: 0.62, frequency: midi(74), gain: 0.12, attack: 0.018, release: 0.5, pan: 0.2, harmonics: [1, 0.22] });
addDelay(turn, 0.16, 0.17, 0.62);
writeStereoWav("turn.wav", turn, 0.78);

const fallacy = createBuffer(1.05);
addNoise(fallacy, { duration: 0.28, gain: 0.29, attack: 0.004, release: 0.2, color: 0.12, seed: 9311, pan: -0.15 });
addTone(fallacy, { duration: 0.42, frequency: midi(61), endFrequency: midi(38), gain: 0.25, attack: 0.005, release: 0.2, pan: -0.18, harmonics: [1, 0.62, 0.34, 0.18] });
addTone(fallacy, { start: 0.09, duration: 0.38, frequency: midi(62), endFrequency: midi(39), gain: 0.19, attack: 0.005, release: 0.2, pan: 0.2, harmonics: [1, 0.7, 0.3] });
[76, 72].forEach((note, index) => {
  addTone(fallacy, { start: 0.5 + index * 0.16, duration: 0.22, frequency: midi(note), gain: 0.14, attack: 0.004, release: 0.18, pan: index ? 0.3 : -0.3, harmonics: [1, 0.5, 0.2] });
});
addDelay(fallacy, 0.095, 0.1, 0.7);
writeStereoWav("fallacy.wav", fallacy, 0.76);

const victory = createBuffer(3.35);
addTone(victory, { duration: 0.5, frequency: midi(38), endFrequency: midi(36), gain: 0.22, attack: 0.008, release: 0.42, harmonics: [1, 0.28] });
addNoise(victory, { duration: 0.18, gain: 0.19, attack: 0.004, release: 0.15, color: 0.17, seed: 10301 });
[62, 66, 69, 74].forEach((note, index) => {
  addTone(victory, { start: 0.08 + index * 0.17, duration: 1.05, frequency: midi(note), gain: 0.14, attack: 0.025, release: 0.68, pan: [-0.45, -0.12, 0.16, 0.45][index], harmonics: [1, 0.4, 0.17, 0.07] });
});
[62, 66, 69, 74].forEach((note, index) => {
  addTone(victory, { start: 0.82, duration: 1.95, frequency: midi(note), gain: 0.12, attack: 0.09, release: 1.15, pan: [-0.55, -0.2, 0.2, 0.55][index], harmonics: [1, 0.25, 0.1], vibrato: 0.0018, vibratoRate: 5 });
});
[86, 90, 93, 98].forEach((note, index) => {
  addTone(victory, { start: 1.02 + index * 0.16, duration: 0.7, frequency: midi(note), gain: 0.07, attack: 0.008, release: 0.58, pan: index % 2 ? 0.62 : -0.62, harmonics: [1, 0.22] });
});
addDelay(victory, 0.18, 0.2, 0.72);
addDelay(victory, 0.31, 0.11, 0.6);
writeStereoWav("victory.wav", victory, 0.82);

const ambienceDuration = 16;
const ambience = createBuffer(ambienceDuration);
const chords = [
  [50, 57, 62, 66], // D major
  [45, 52, 57, 61], // A major
  [47, 54, 59, 62], // B minor
  [43, 50, 55, 59], // G major
];

chords.forEach((chord, chordIndex) => {
  const start = chordIndex * 4 - 0.8;
  chord.forEach((note, noteIndex) => {
    addTone(ambience, {
      start,
      duration: 5.6,
      frequency: midi(note),
      gain: noteIndex === 0 ? 0.055 : 0.038,
      attack: 1.05,
      release: 1.3,
      pan: [-0.48, -0.16, 0.18, 0.5][noteIndex],
      harmonics: [1, 0.18, 0.07],
      vibrato: 0.0012,
      vibratoRate: 0.19 + noteIndex * 0.025,
    });
  });
});

// Repeat the first chord across the loop boundary so the final crossfade remains harmonic.
chords[0].forEach((note, noteIndex) => {
  addTone(ambience, { start: 14.8, duration: 2, frequency: midi(note), gain: noteIndex === 0 ? 0.045 : 0.03, attack: 0.8, release: 0.3, pan: [-0.48, -0.16, 0.18, 0.5][noteIndex], harmonics: [1, 0.18, 0.06] });
});

[74, 78, 81, 86, 83, 81, 78, 76].forEach((note, index) => {
  addTone(ambience, { start: 0.8 + index * 1.85, duration: 1.25, frequency: midi(note), gain: 0.023, attack: 0.025, release: 1.05, pan: index % 2 ? 0.52 : -0.52, harmonics: [1, 0.28, 0.1] });
});
addNoise(ambience, { duration: ambienceDuration, gain: 0.012, attack: 1.2, release: 1.2, color: 0.008, seed: 12011, pan: -0.35 });
addNoise(ambience, { duration: ambienceDuration, gain: 0.01, attack: 1.2, release: 1.2, color: 0.006, seed: 13001, pan: 0.35 });
addDelay(ambience, 0.37, 0.13, 0.76);
writeStereoWav("ambience-loop.wav", ambience, 0.42);

console.log("Original stereo audio generated in public/audio:");
for (const fileName of fs.readdirSync(outDir).filter((file) => file.endsWith(".wav"))) {
  const { size } = fs.statSync(path.join(outDir, fileName));
  console.log(`- ${fileName} (${Math.round(size / 1024)} KB)`);
}
