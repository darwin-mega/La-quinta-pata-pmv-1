export type RecentRoom = {
    roomId: string;
    path: string;
    roomName: string;
    updatedAt: number;
};

const RECENT_ROOM_KEY = "laQuintaPata_recentRoom_v1";

export function saveRecentRoom(room: RecentRoom) {
    window.localStorage.setItem(RECENT_ROOM_KEY, JSON.stringify(room));
}

export function getRecentRoom(): RecentRoom | null {
    try {
        const value = window.localStorage.getItem(RECENT_ROOM_KEY);
        return value ? JSON.parse(value) as RecentRoom : null;
    } catch {
        return null;
    }
}
