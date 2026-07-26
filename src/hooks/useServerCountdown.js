import { useEffect, useMemo, useState } from 'react';

function parseTimestamp(value) {
    if (!value) return null;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
}

function readLocalNow(serverClock) {
    return serverClock?.localNow ?? serverClock?.LocalNow;
}

export default function useServerCountdown(serverClock, targetDate) {
    const [clientNow, setClientNow] = useState(() => Date.now());
    const serverLocalNow = readLocalNow(serverClock);

    const serverOffsetMs = useMemo(() => {
        const serverTimestamp = parseTimestamp(serverLocalNow);
        return serverTimestamp === null ? 0 : serverTimestamp - Date.now();
    }, [serverLocalNow]);

    const targetTimestamp = useMemo(() => parseTimestamp(targetDate), [targetDate]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setClientNow(Date.now());
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, []);

    if (targetTimestamp === null) {
        return {
            available: false,
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00',
            finished: false,
        };
    }

    const remainingMs = Math.max(0, targetTimestamp - (clientNow + serverOffsetMs));
    const totalSeconds = Math.floor(remainingMs / 1000);

    return {
        available: true,
        days: String(Math.floor(totalSeconds / 86400)).padStart(2, '0'),
        hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0'),
        minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
        seconds: String(totalSeconds % 60).padStart(2, '0'),
        finished: remainingMs <= 0,
    };
}
