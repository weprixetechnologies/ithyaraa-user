"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Lightweight top-bar navigation progress indicator.
 * Animates on route changes (pathname or search params).
 */
const NavigationProgress = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);
    const prevUrl = useRef("");

    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Start progress bar
    const start = useCallback(() => {
        cleanup();
        setProgress(0);
        setVisible(true);

        // Rapidly reach ~30%, then slow trickle
        let p = 0;
        timerRef.current = setInterval(() => {
            p += p < 30 ? 8 : p < 60 ? 3 : p < 80 ? 1 : 0.3;
            if (p > 90) p = 90;
            setProgress(p);
        }, 80);
    }, [cleanup]);

    // Complete progress bar
    const done = useCallback(() => {
        cleanup();
        setProgress(100);
        setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 300);
    }, [cleanup]);

    useEffect(() => {
        const currentUrl = pathname + (searchParams?.toString() || "");

        // Skip on initial mount
        if (prevUrl.current === "") {
            prevUrl.current = currentUrl;
            return;
        }

        // Only trigger if URL actually changed
        if (currentUrl !== prevUrl.current) {
            prevUrl.current = currentUrl;
            done();
        }
    }, [pathname, searchParams, done]);

    // Intercept link clicks to start the progress bar before navigation
    useEffect(() => {
        const handleClick = (e) => {
            const anchor = e.target.closest("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
            if (anchor.target === "_blank") return;
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;

            // Internal navigation — start progress
            const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
            if (href !== currentUrl) {
                start();
            }
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [pathname, searchParams, start]);

    if (!visible) return null;

    return (
        <>
            <style>{`
                .nav-progress-bar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 3px;
                    z-index: 99999;
                    pointer-events: none;
                    transition: width 0.2s ease, opacity 0.3s ease;
                    background: linear-gradient(90deg, #b8943a, #e0c97a, #b8943a);
                    box-shadow: 0 0 8px rgba(184, 148, 58, 0.5), 0 0 4px rgba(184, 148, 58, 0.3);
                }
                .nav-progress-glow {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 80px;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(224, 201, 122, 0.6));
                    transform: rotate(3deg) translateY(-2px);
                }
            `}</style>
            <div
                className="nav-progress-bar"
                style={{
                    width: `${progress}%`,
                    opacity: progress >= 100 ? 0 : 1,
                }}
            >
                <div className="nav-progress-glow" />
            </div>
        </>
    );
};

export default NavigationProgress;
