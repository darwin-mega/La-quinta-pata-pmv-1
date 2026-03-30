import { Room } from "@/lib/store";

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
