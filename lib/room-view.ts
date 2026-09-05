import { Room, Round } from "@/lib/store";
import { RoomSession } from "@/lib/session";

const hideOtherVotes = (votes: Record<string, string>, viewerId: string) => Object.fromEntries(
    Object.entries(votes).map(([playerId, vote]) => [playerId, playerId === viewerId ? vote : ""]),
);

const hideOtherVoters = (voters: string[], viewerId: string, prefix: string) => voters.map(
    (playerId, index) => playerId === viewerId ? playerId : `${prefix}-${index + 1}`,
);

const sanitizeRound = (round: Round, room: Room, viewerId: string): Round => {
    const revealVotes = room.mode === "mesa" || room.state === "results" || room.state === "finished";
    const activeChallenge = round.activeChallenge
        ? {
            ...round.activeChallenge,
            yesVotes: revealVotes
                ? [...round.activeChallenge.yesVotes]
                : hideOtherVoters(round.activeChallenge.yesVotes, viewerId, "yes"),
            noVotes: revealVotes
                ? [...round.activeChallenge.noVotes]
                : hideOtherVoters(round.activeChallenge.noVotes, viewerId, "no"),
        }
        : round.activeChallenge;

    return {
        ...round,
        votes: revealVotes ? { ...round.votes } : hideOtherVotes(round.votes, viewerId),
        secondaryVotes: revealVotes ? { ...round.secondaryVotes } : hideOtherVotes(round.secondaryVotes, viewerId),
        resolutionVotes: round.resolutionVotes
            ? (revealVotes ? { ...round.resolutionVotes } : hideOtherVotes(round.resolutionVotes, viewerId))
            : undefined,
        activeChallenge,
    };
};

export const sessionBelongsToRoom = (room: Room, session: RoomSession | null) => {
    if (!session || session.roomId !== room.id.toUpperCase()) return false;
    const isHost = session.isHost && session.playerId === room.hostId;
    return isHost || room.players.some(player => player.id === session.playerId);
};

export const buildRoomView = (room: Room, session: RoomSession): Room => ({
    ...room,
    rounds: room.rounds.map(round => sanitizeRound(round, room, session.playerId)),
    savedTopics: session.isHost ? room.savedTopics.map(topic => ({ ...topic })) : [],
});
