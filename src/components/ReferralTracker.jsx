"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Tracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const referBy = searchParams.get("referBy");
        if (referBy) {
            console.log("🔗 Referral detected:", referBy);
            localStorage.setItem("referBy", referBy);
        }
    }, [searchParams]);

    return null;
}

export default function ReferralTracker() {
    return (
        <Suspense fallback={null}>
            <Tracker />
        </Suspense>
    );
}
