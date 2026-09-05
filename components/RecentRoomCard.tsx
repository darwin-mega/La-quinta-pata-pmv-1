"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, History } from "lucide-react";
import { getRecentRoom, RecentRoom } from "@/lib/recent-room";

export default function RecentRoomCard() {
    const [room, setRoom] = useState<RecentRoom | null>(null);

    useEffect(() => {
        setRoom(getRecentRoom());
    }, []);

    if (!room) return null;

    return (
        <Link href={room.path} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", padding: "0.9rem 1rem", border: "1px solid rgba(16,185,129,0.28)", borderRadius: "16px", color: "#d1fae5", background: "rgba(16,185,129,0.08)", fontWeight: 750 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <History size={18} />
                Continuar {room.roomName || `sala ${room.roomId}`}
            </span>
            <ArrowRight size={18} />
        </Link>
    );
}
