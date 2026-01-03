import React, { useState, useEffect } from 'react'

// Helper to parse "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD" to JS Date
const parseDateTime = (datetimeStr) => {
    if (!datetimeStr) return null;

    // Handle "YYYY-MM-DD HH:mm:ss" format
    if (datetimeStr.includes(' ')) {
        const [datePart, timePart] = datetimeStr.split(' ');
        if (datePart && timePart) {
            return new Date(datePart.replace(/-/g, "/") + "T" + timePart);
        }
    }

    // Handle "YYYY-MM-DD" format (add default time)
    if (datetimeStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(datetimeStr + "T23:59:59");
    }

    // Try to parse as-is
    const parsed = new Date(datetimeStr);
    return isNaN(parsed.getTime()) ? null : parsed;
};

const pad = (num) => String(num).padStart(2, '0');

const getTimeLeft = (futureDate) => {
    const now = new Date();
    const diff = Math.max(0, futureDate - now); // ms
    const totalSeconds = Math.floor(diff / 1000);

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, isExpired: diff <= 0 };
}

const square = (val, label) => (
    <div className="flex flex-col items-center">
        <div className="min-w-8 min-h-8 sm:min-w-9 sm:min-h-9 bg-white rounded-lg border border-gray-200 flex items-center justify-center font-bold text-sm sm:text-base text-gray-900 mx-0.5">
            {pad(val)}
        </div>
        <span className="text-[9px] sm:text-[10px] text-gray-500 mt-1 uppercase tracking-[0.05em]">
            {label}
        </span>
    </div>
);

const PresaleCardCounter = ({ datetime }) => {
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!datetime) return null;
        const date = parseDateTime(datetime);
        if (!date) {
            console.warn('PresaleCardCounter: Failed to parse datetime:', datetime);
            return null;
        }
        return getTimeLeft(date);
    });

    useEffect(() => {
        if (!datetime) {
            setTimeLeft(null);
            return;
        }

        const futureDate = parseDateTime(datetime);
        if (!futureDate) {
            console.warn('PresaleCardCounter: Failed to parse datetime:', datetime);
            setTimeLeft(null);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(futureDate));
        }, 1000);

        return () => clearInterval(timer);

    }, [datetime]);

    if (!datetime) {
        return (
            <div className="flex items-center justify-center p-2">
                <span className="text-gray-400 text-xs">No end date</span>
            </div>
        );
    }

    if (!timeLeft) {
        return (
            <div className="flex items-center justify-center p-2">
                <span className="text-gray-400 text-xs">Invalid date</span>
            </div>
        );
    }

    if (timeLeft.isExpired)
        return (
            <div className="flex items-center justify-center">
                <span className="text-red-500 font-semibold text-sm">Time expired</span>
            </div>
        );

    return (
        <>
            {/* Mobile: single compact box with full timer */}
            <div className="flex sm:hidden items-center justify-center">
                <div className="flex w-full flex-col items-center justify-center px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <span className="font-semibold text-xs text-red-500 tracking-[0.08em] uppercase mb-1">
                        Ends in
                    </span>
                    <span className="font-bold text-[16px] text-gray-900 tracking-[0.2em]">
                        {pad(timeLeft.days)}:{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
                    </span>
                </div>
            </div>

            {/* Desktop & tablets: existing multi-square layout */}
            <div className="hidden sm:flex items-center justify-center gap-1 sm:gap-1.5">
                {square(timeLeft.days, 'Days')}
                <span className="font-bold mx-1 text-sm sm:text-base">:</span>
                {square(timeLeft.hours, 'Hrs')}
                <span className="font-bold mx-1 text-sm sm:text-base">:</span>
                {square(timeLeft.minutes, 'Min')}
                <span className="font-bold mx-1 text-sm sm:text-base">:</span>
                {square(timeLeft.seconds, 'Sec')}
            </div>
        </>
    )
}

export default PresaleCardCounter
