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
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }}>
        <div style={{
            minWidth: 36,
            minHeight: 36,
            background: '#fff',
            borderRadius: 8,
            border: '1.5px solid #eee',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: '#222',
            margin: '0 2px'
        }}>
            {pad(val)}
        </div>
        <span style={{
            fontSize: 10,
            color: '#666',
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5
        }}>{label}</span>
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
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center'
        }}>

            {square(timeLeft.days, 'Days')}
            <span style={{ fontWeight: 700, margin: '0 4px', fontSize: 18 }}>:</span>
            {square(timeLeft.hours, 'Hrs')}
            <span style={{ fontWeight: 700, margin: '0 4px', fontSize: 18 }}>:</span>
            {square(timeLeft.minutes, 'Min')}
            <span style={{ fontWeight: 700, margin: '0 4px', fontSize: 18 }}>:</span>
            {square(timeLeft.seconds, 'Sec')}
        </div>
    )
}

export default PresaleCardCounter
