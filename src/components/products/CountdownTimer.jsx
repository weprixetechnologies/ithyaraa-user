"use client";
import { useState, useEffect } from "react";

const CountdownTimer = ({ endTime }) => {
    const [remainingMs, setRemainingMs] = useState(null);

    useEffect(() => {
        if (!endTime) {
            setRemainingMs(null);
            return;
        }

        const endTimestamp = new Date(endTime).getTime();
        
        const tick = () => {
            const now = Date.now();
            const diff = Math.max(0, endTimestamp - now);
            setRemainingMs(diff);
        };

        // Prime immediately
        tick();
        
        // Set interval for updates
        const timer = setInterval(tick, 1000);

        // Cleanup on unmount or endTime change
        return () => clearInterval(timer);
    }, [endTime]);

    if (!remainingMs || remainingMs <= 0) return null;

    const totalSec = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return (
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 text-red-600 text-sm">
            <span className="font-semibold">Flash sale ends in:</span>
            <span>{days}d {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
    );
};

export default CountdownTimer;

