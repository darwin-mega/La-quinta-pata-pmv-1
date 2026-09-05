import { GameDuration, GameIntensity, Room } from "@/lib/store";

const INTENSITY_LABELS: Record<GameIntensity, string> = {
    liviano: "Liviano",
    medio: "Medio",
    filoso: "Filoso",
};

const DURATION_LABELS: Record<GameDuration, string> = {
    corta: "Corta",
    larga: "Larga",
    leyenda: "Leyenda",
};

const DURATION_DESCRIPTIONS: Record<GameDuration, string> = {
    corta: "Ágil · hasta 6 rondas",
    larga: "Completa · hasta 9 rondas",
    leyenda: "Épica · hasta 12 rondas",
};

const ROUND_MINUTES: Record<GameDuration, number> = {
    corta: 6,
    larga: 9,
    leyenda: 9,
};

export const getMaxRoundsForPlayers = (numPlayers: number, duration: GameDuration) => {
    if (duration === "corta") {
        return Math.ceil(numPlayers / 2);
    }

    if (duration === "larga") {
        return Math.min(Math.ceil((numPlayers * 3) / 2), 9);
    }

    return Math.min((numPlayers * (numPlayers - 1)) / 2, 12);
};

export const getMaxRounds = (room: Room) => getMaxRoundsForPlayers(room.players.length, room.duration);

export const hasGameEnded = (room: Room) => {
    if (room.currentRoundIndex < 0) return false;
    return (room.currentRoundIndex + 1) >= getMaxRounds(room);
};

export const isTwoPlayerRoom = (room: Room) => room.players.length === 2;

export const getGameIntensityLabel = (intensity: GameIntensity) => INTENSITY_LABELS[intensity] || intensity;

export const getGameDurationLabel = (duration: GameDuration) => DURATION_LABELS[duration] || duration;

export const getGameDurationDescription = (duration: GameDuration) => DURATION_DESCRIPTIONS[duration];

export const getEstimatedGameMinutes = (room: Room) => {
    return getMaxRounds(room) * ROUND_MINUTES[room.duration];
};

export const getEstimatedGameMinutesForPlayers = (numPlayers: number, duration: GameDuration) => {
    return getMaxRoundsForPlayers(numPlayers, duration) * ROUND_MINUTES[duration];
};
