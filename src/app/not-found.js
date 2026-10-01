'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const REDIRECT_SECONDS = 8

// ── Floating particle ────────────────────────────────────────────────
function Particle({ style }) {
    return (
        <div
            className="absolute rounded-full pointer-events-none animate-ping opacity-0"
            style={style}
        />
    )
}

// ── Glitchy digit ─────────────────────────────────────────────────────
function GlitchDigit({ char }) {
    const [glitch, setGlitch] = useState(false)

    useEffect(() => {
        const fire = () => {
            setGlitch(true)
            setTimeout(() => setGlitch(false), 150)
        }
        const interval = setInterval(fire, Math.random() * 2000 + 1500)
        return () => clearInterval(interval)
    }, [])

    return (
        <span
            className="relative inline-block select-none"
            style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(5rem, 22vw, 12rem)',
                fontWeight: 900,
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: '2px rgba(139,92,246,0.6)',
                textShadow: glitch
                    ? '4px 0 #ec4899, -4px 0 #8b5cf6'
                    : '0 0 60px rgba(139,92,246,0.4)',
                transform: glitch ? `skewX(${Math.random() > 0.5 ? 4 : -4}deg) translateX(${Math.random() > 0.5 ? 3 : -3}px)` : 'none',
                transition: 'transform 0.05s, text-shadow 0.05s',
                display: 'inline-block',
            }}
        >
            {char}
            {/* Ghost duplicate for glitch effect */}
            {glitch && (
                <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        color: 'transparent',
                        WebkitTextStroke: '2px #ec4899',
                        opacity: 0.5,
                        transform: 'translateX(6px)',
                        mixBlendMode: 'screen',
                    }}
                >
                    {char}
                </span>
            )}
        </span>
    )
}

export default function NotFound() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(REDIRECT_SECONDS)
    const [barWidth, setBarWidth] = useState(100)
    const [hovered, setHovered] = useState(false)
    const intervalRef = useRef(null)

    // Countdown + redirect
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current)
                    router.push('/shop')
                    return 0
                }
                return prev - 1
            })
            setBarWidth(prev => Math.max(0, prev - (100 / REDIRECT_SECONDS)))
        }, 1000)
        return () => clearInterval(intervalRef.current)
    }, [router])

    // Pause on hover
    const handleMouseEnter = () => {
        setHovered(true)
        clearInterval(intervalRef.current)
    }
    const handleMouseLeave = () => {
        setHovered(false)
        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current)
                    router.push('/shop')
                    return 0
                }
                return prev - 1
            })
            setBarWidth(prev => Math.max(0, prev - (100 / REDIRECT_SECONDS)))
        }, 1000)
    }

    // Generate random particles once
    const particles = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 1.5,
        color: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#ec4899' : '#f59e0b',
    }))

    return (
        <div className="relative min-h-screen bg-[#080810] flex flex-col items-center justify-center overflow-hidden px-4 text-center">

            {/* ── Radial bg glows ────────────────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-purple-700/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-pink-600/10 blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-violet-900/20 blur-[80px]" />
            </div>

            {/* ── Floating particles ──────────────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                    <Particle
                        key={p.id}
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            background: p.color,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
            </div>

            {/* ── Scanline overlay ────────────────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)',
                }}
            />

            {/* ── Grid pattern ────────────────────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* ── Main content ────────────────────────────────────────── */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Label pill */}
                <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest mb-8"
                    style={{
                        background: 'rgba(139,92,246,0.1)',
                        borderColor: 'rgba(139,92,246,0.3)',
                        color: '#a78bfa',
                        animation: 'fadeInDown 0.6s ease both',
                    }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full bg-purple-400"
                        style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}
                    />
                    Error 404
                </div>

                {/* Glitchy 404 */}
                <div
                    className="flex items-center justify-center gap-1 mb-2 leading-none"
                    style={{ animation: 'fadeInUp 0.7s ease 0.1s both' }}
                >
                    <GlitchDigit char="4" />
                    <GlitchDigit char="0" />
                    <GlitchDigit char="4" />
                </div>

                {/* NOT FOUND text */}
                <div
                    className="relative mb-6"
                    style={{ animation: 'fadeInUp 0.7s ease 0.2s both' }}
                >
                    <p
                        className="text-lg md:text-2xl font-black uppercase tracking-[0.35em] text-white/20"
                        style={{
                            letterSpacing: '0.4em',
                        }}
                    >
                        Page Not Found
                    </p>
                    {/* Decorative line */}
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                        <span className="text-purple-400 text-xs">✦</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                    </div>
                </div>

                {/* Tagline */}
                <p
                    className="text-white/50 text-base md:text-lg max-w-sm leading-relaxed mb-3"
                    style={{ animation: 'fadeInUp 0.7s ease 0.3s both' }}
                >
                    Oops! This page took a wrong turn.
                </p>
                <p
                    className="text-white/70 text-base md:text-xl font-semibold max-w-md leading-relaxed mb-10"
                    style={{ animation: 'fadeInUp 0.7s ease 0.35s both' }}
                >
                    Why waste time when you can{' '}
                    <span
                        className="font-black"
                        style={{
                            background: 'linear-gradient(90deg, #a78bfa, #ec4899, #f59e0b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        shop?
                    </span>{' '}
                    🛍️
                </p>

                {/* CTA Button */}
                <div
                    style={{ animation: 'fadeInUp 0.7s ease 0.45s both' }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        onClick={() => router.push('/shop')}
                        className="group relative overflow-hidden px-8 py-4 rounded-2xl font-black text-white text-base uppercase tracking-wider cursor-pointer transition-transform active:scale-95 hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 60%, #f59e0b 100%)',
                            boxShadow: '0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(236,72,153,0.2)',
                        }}
                    >
                        {/* Shimmer sweep */}
                        <span
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.2s infinite',
                            }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                            <span>Take Me Shopping</span>
                            <span className="text-xl group-hover:translate-x-1 transition-transform inline-block">→</span>
                        </span>
                    </button>
                </div>

                {/* Countdown bar */}
                <div
                    className="mt-8 w-full max-w-xs"
                    style={{ animation: 'fadeInUp 0.7s ease 0.55s both' }}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-white/30 font-medium">
                            {hovered ? 'Paused — hover away to resume' : `Redirecting to Shop in ${countdown}s…`}
                        </span>
                        <span className="text-xs text-purple-400 font-bold">{countdown}s</span>
                    </div>
                    {/* Track */}
                    <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${barWidth}%`,
                                background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                                transition: hovered ? 'none' : 'width 1s linear',
                                boxShadow: '0 0 8px rgba(139,92,246,0.8)',
                            }}
                        />
                    </div>
                </div>

                {/* Quick links */}
                <div
                    className="mt-10 flex flex-wrap items-center justify-center gap-3"
                    style={{ animation: 'fadeInUp 0.7s ease 0.65s both' }}
                >
                    {[
                        { label: '🏠 Home', href: '/' },
                        { label: '🛍️ Shop', href: '/shop' },
                        { label: '🏷️ Offers', href: '/offers' },
                        { label: '📦 Pre-Book', href: '/presale' },
                        { label: '🏪 Brands', href: '/brands' },
                    ].map(({ label, href }) => (
                        <button
                            key={href}
                            onClick={() => router.push(href)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white transition-all cursor-pointer"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.background = 'rgba(139,92,246,0.15)'
                                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── CSS keyframes injected inline ──────────────────────── */}
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0%   { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
            `}</style>
        </div>
    )
}
