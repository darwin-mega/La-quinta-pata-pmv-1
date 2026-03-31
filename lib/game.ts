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

export const getMaxRounds = (room: Room) => {
    const numPlayers = room.players.length;

    if (room.duration === "corta") {
        return Math.ceil(numPlayers / 2);
    }

    if (room.duration === "larga") {
        return Math.ceil((numPlayers * 3) / 2);
    }

    return (numPlayers * (numPlayers - 1)) / 2;
};

export const hasGameEnded = (room: Room) => {
    if (room.currentRoundIndex < 0) return false;
    return (room.currentRoundIndex + 1) >= getMaxRounds(room);
};

export const isTwoPlayerRoom = (room: Room) => room.players.length === 2;

export const getGameIntensityLabel = (intensity: GameIntensity) => INTENSITY_LABELS[intensity] || intensity;

export const getGameDurationLabel = (duration: GameDuration) => DURATION_LABELS[duration] || duration;
