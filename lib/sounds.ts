// Web Audio API sound identity for "La Quinta Pata"

type WindowWithWebkitAudio = Window & typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
};

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let fxGain: GainNode | null = null;
let ambienceCleanup: (() => void) | null = null;
let ambiencePulseTimer: number | null = null;
let cachedPreference: boolean | null = null;

type SoundAssetKey = "ambience" | "button" | "phase" | "tick" | "timeout" | "turn" | "fallacy" | "victory";

const soundAssetPaths: Record<SoundAssetKey, string> = {
    ambience: "/audio/ambience-loop.wav",
    button: "/audio/button.wav",
    phase: "/audio/phase-change.wav",
    tick: "/audio/tick.wav",
    timeout: "/audio/timeout.wav",
    turn: "/audio/turn.wav",
    fallacy: "/audio/fallacy.wav",
    victory: "/audio/victory.wav",
};

const soundAssetVolumes: Record<SoundAssetKey, number> = {
    ambience: 0.34,
    button: 0.52,
    phase: 0.55,
    tick: 0.4,
    timeout: 0.52,
    turn: 0.65,
    fallacy: 0.68,
    victory: 0.72,
};

const audioCache = new Map<SoundAssetKey, HTMLAudioElement>();

function canUseHtmlAudio() {
    return typeof window !== "undefined" && typeof Audio !== "undefined";
}

function getSoundAsset(key: SoundAssetKey) {
    if (!canUseHtmlAudio()) return null;

    let audio = audioCache.get(key);
    if (!audio) {
        audio = new Audio(soundAssetPaths[key]);
        audio.preload = "auto";
        audio.volume = soundAssetVolumes[key];
        audio.loop = key === "ambience";
        audioCache.set(key, audio);
    }

    return audio;
}

function playRecordedSound(key: Exclude<SoundAssetKey, "ambience">) {
    if (!getStoredPreference()) return false;

    const source = getSoundAsset(key);
    if (!source) return false;

    const instance = source.cloneNode(true) as HTMLAudioElement;
    instance.volume = soundAssetVolumes[key];
    instance.currentTime = 0;
    void instance.play().catch(() => undefined);
    return true;
}

function getStoredPreference() {
    if (cachedPreference !== null) return cachedPreference;
    if (typeof window === "undefined") {
        cachedPreference = true;
        return true;
    }

    const savedPreference = window.localStorage.getItem("laquinta_audio_enabled");
    cachedPreference = savedPreference !== "false";
    return cachedPreference;
}

export function isSoundEnabled() {
    return getStoredPreference();
}

function initAudio() {
    if (typeof window === "undefined") return false;

    const win = window as WindowWithWebkitAudio;
    const AudioCtor = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtor) return false;

    if (!audioCtx) {
        audioCtx = new AudioCtor();
        masterGain = audioCtx.createGain();
        musicGain = audioCtx.createGain();
        fxGain = audioCtx.createGain();

        masterGain.gain.setValueAtTime(getStoredPreference() ? 0.95 : 0.0001, audioCtx.currentTime);
        musicGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        fxGain.gain.setValueAtTime(0.9, audioCtx.currentTime);

        musicGain.connect(masterGain);
        fxGain.connect(masterGain);
        masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === "suspended") {
        void audioCtx.resume();
    }

    return true;
}

function withFx(callback: (ctx: AudioContext, output: GainNode) => void) {
    if (!getStoredPreference() || !initAudio() || !audioCtx || !fxGain) return;
    callback(audioCtx, fxGain);
}

function applyEnvelope(
    gainNode: GainNode,
    ctx: AudioContext,
    {
        start = ctx.currentTime,
        attack = 0.02,
        peak = 0.12,
        release = 0.3,
    }: { start?: number; attack?: number; peak?: number; release?: number }
) {
    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + release);
}

export function unlockAudio() {
    const ready = initAudio();

    if (canUseHtmlAudio()) {
        (Object.keys(soundAssetPaths) as SoundAssetKey[]).forEach(key => {
            const asset = getSoundAsset(key);
            asset?.load();
        });
    }

    if (getStoredPreference()) {
        startBackgroundMusic();
    }

    return ready || canUseHtmlAudio();
}

export function setSoundEnabled(enabled: boolean) {
    cachedPreference = enabled;

    if (typeof window !== "undefined") {
        window.localStorage.setItem("laquinta_audio_enabled", String(enabled));
    }

    if (!initAudio() || !audioCtx || !masterGain) return;

    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
    masterGain.gain.exponentialRampToValueAtTime(enabled ? 0.95 : 0.0001, now + 0.12);

    if (enabled) {
        startBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
}

function playAmbientPulse() {
    if (!getStoredPreference() || !audioCtx || !musicGain) return;

    const ctx = audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.8);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.028, now + 0.14);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    osc.connect(gainNode);
    gainNode.connect(musicGain);

    osc.start(now);
    osc.stop(now + 1.5);
}

export function startBackgroundMusic() {
    if (!getStoredPreference()) return;

    const ambienceAudio = getSoundAsset("ambience");
    if (ambienceAudio) {
        ambienceAudio.loop = true;
        ambienceAudio.volume = soundAssetVolumes.ambience;
        if (ambienceAudio.paused) {
            ambienceAudio.currentTime = 0;
            void ambienceAudio.play().catch(() => undefined);
        }
        return;
    }

    if (!initAudio() || !audioCtx || !musicGain || ambienceCleanup) return;

    const ctx = audioCtx;
    const padGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const padOscA = ctx.createOscillator();
    const padOscB = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();

    padGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    padGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.8);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(880, ctx.currentTime);
    filter.Q.value = 0.7;

    padOscA.type = "triangle";
    padOscA.frequency.setValueAtTime(174.61, ctx.currentTime);

    padOscB.type = "sine";
    padOscB.frequency.setValueAtTime(261.63, ctx.currentTime);
    padOscB.detune.value = 7;

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(87.31, ctx.currentTime);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.06, ctx.currentTime);
    lfoDepth.gain.setValueAtTime(0.012, ctx.currentTime);

    lfo.connect(lfoDepth);
    lfoDepth.connect(padGain.gain);

    padOscA.connect(filter);
    padOscB.connect(filter);
    subOsc.connect(filter);
    filter.connect(padGain);
    padGain.connect(musicGain);

    padOscA.start();
    padOscB.start();
    subOsc.start();
    lfo.start();

    ambienceCleanup = () => {
        const stopAt = ctx.currentTime + 0.25;

        padGain.gain.cancelScheduledValues(ctx.currentTime);
        padGain.gain.setValueAtTime(Math.max(padGain.gain.value, 0.0001), ctx.currentTime);
        padGain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        [padOscA, padOscB, subOsc, lfo].forEach(node => {
            try {
                node.stop(stopAt);
            } catch {
                // noop
            }
        });
    };

    if (typeof window !== "undefined") {
        ambiencePulseTimer = window.setInterval(() => {
            if (typeof document === "undefined" || document.visibilityState === "visible") {
                playAmbientPulse();
            }
        }, 14000);
    }

    playAmbientPulse();
}

export function stopBackgroundMusic() {
    const ambienceAudio = getSoundAsset("ambience");
    if (ambienceAudio) {
        ambienceAudio.pause();
        ambienceAudio.currentTime = 0;
    }

    if (typeof window !== "undefined" && ambiencePulseTimer !== null) {
        window.clearInterval(ambiencePulseTimer);
        ambiencePulseTimer = null;
    }

    if (ambienceCleanup) {
        ambienceCleanup();
        ambienceCleanup = null;
    }
}

// Sonido de inicio de turno (llamada de atención dramática)
export function playTurnSound() {
    if (playRecordedSound("turn")) return;

    withFx((ctx, output) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const now = ctx.currentTime;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        applyEnvelope(gainNode, ctx, { start: now, attack: 0.03, peak: 0.18, release: 0.45 });

        osc.connect(gainNode);
        gainNode.connect(output);

        osc.start(now);
        osc.stop(now + 0.5);
    });
}

// Sonido de falacia señalada (alerta / tensión)
export function playFallacySound() {
    if (playRecordedSound("fallacy")) return;

    withFx((ctx, output) => {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sawtooth";
        osc2.type = "square";

        osc1.frequency.setValueAtTime(300, now);
        osc2.frequency.setValueAtTime(312, now);
        osc1.frequency.exponentialRampToValueAtTime(98, now + 0.28);
        osc2.frequency.exponentialRampToValueAtTime(104, now + 0.28);

        applyEnvelope(gainNode, ctx, { start: now, attack: 0.02, peak: 0.16, release: 0.36 });

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(output);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.38);
        osc2.stop(now + 0.38);
    });
}

// Sonido de tiempo agotándose (tic ansioso)
export function playTickSound() {
    if (playRecordedSound("tick")) return;

    withFx((ctx, output) => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

        applyEnvelope(gainNode, ctx, { start: now, attack: 0.008, peak: 0.06, release: 0.1 });

        osc.connect(gainNode);
        gainNode.connect(output);

        osc.start(now);
        osc.stop(now + 0.11);
    });
}

// Golpe final cuando el tiempo llega a cero
export function playTimeoutSound() {
    if (playRecordedSound("timeout")) return;

    withFx((ctx, output) => {
        const now = ctx.currentTime;
        const notes = [880, 740, 520];

        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const start = now + index * 0.07;

            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, start);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.75, start + 0.18);

            applyEnvelope(gainNode, ctx, { start, attack: 0.01, peak: 0.08, release: 0.22 });

            osc.connect(gainNode);
            gainNode.connect(output);

            osc.start(start);
            osc.stop(start + 0.24);
        });
    });
}

// Sonido de resultado / victoria (cortina de resolución)
export function playWinSound() {
    if (playRecordedSound("victory")) return;

    withFx((ctx, output) => {
        const notes = [523.25, 659.25, 783.99, 1046.5];

        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const start = ctx.currentTime + index * 0.09;

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, start);

            applyEnvelope(gainNode, ctx, { start, attack: 0.04, peak: 0.12, release: 1.15 });

            osc.connect(gainNode);
            gainNode.connect(output);

            osc.start(start);
            osc.stop(start + 1.2);
        });
    });
}

// Sonido sutil de botón
export function playButtonSound() {
    if (playRecordedSound("button")) return;

    withFx((ctx, output) => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(860, now + 0.05);

        applyEnvelope(gainNode, ctx, { start: now, attack: 0.008, peak: 0.045, release: 0.09 });

        osc.connect(gainNode);
        gainNode.connect(output);

        osc.start(now);
        osc.stop(now + 0.1);
    });
}

// Sonido de cambio de interfaz / transición de fase
export function playPhaseChangeSound() {
    if (playRecordedSound("phase")) return;

    withFx((ctx, output) => {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(330, now + 0.22);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(659.25, now);
        osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.22);

        applyEnvelope(gainNode, ctx, { start: now, attack: 0.03, peak: 0.06, release: 0.3 });

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(output);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
    });
}
