'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from '@/lib/axiosInstance'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion'
import './brands.css'

/* ===== Animated Counter Component ===== */
const AnimatedCounter = ({ value, duration = 1.5 }) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!isInView) return
        let start = 0
        const end = parseInt(value)
        if (start === end) return
        const incrementTime = (duration * 1000) / end
        const timer = setInterval(() => {
            start += 1
            setCount(start)
            if (start === end) clearInterval(timer)
        }, incrementTime)
        return () => clearInterval(timer)
    }, [isInView, value, duration])

    return <span ref={ref}>{count}</span>
}

/* ===== Brand Card with Hover Effects ===== */
const BrandCard = ({ brand, index }) => {
    const cardRef = useRef(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const rotateX = useTransform(y, [-100, 100], [6, -6])
    const rotateY = useTransform(x, [-100, 100], [-6, 6])

    const handleMouseMove = (e) => {
        const rect = cardRef.current?.getBoundingClientRect()
        if (!rect) return
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        x.set(e.clientX - centerX)
        y.set(e.clientY - centerY)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
            }}
        >
            <Link href={`/brands/${brand.uid}`}>
                <motion.div
                    ref={cardRef}
                    className="brand-card-redesign"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    {/* Glow effect */}
                    <div className="brand-card-glow" />

                    {/* Featured badge */}
                    {brand.verifiedEmail === 1 && (
                        <div className="brand-card-featured-badge">
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            FEATURED
                        </div>
                    )}

                    {/* Avatar */}
                    <div className="brand-card-avatar-wrapper">
                        {brand.profilePhoto ? (
                            <div className="brand-card-avatar">
                                <Image
                                    src={brand.profilePhoto}
                                    alt={brand.name}
                                    width={120}
                                    height={120}
                                    className="brand-card-avatar-img"
                                />
                                {brand.verifiedEmail === 1 && (
                                    <div className="brand-card-verify-badge">
                                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="brand-card-avatar-placeholder">
                                {brand.name?.charAt(0)?.toUpperCase() || 'B'}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <h3 className="brand-card-name">{brand.name || 'Unnamed Brand'}</h3>

                    {brand.verifiedEmail === 1 && (
                        <div className="brand-card-verified-text">
                            <span className="brand-verified-dot" />
                            Verified Partner
                        </div>
                    )}

                    {/* Divider */}
                    <div className="brand-card-divider" />

                    {/* Bottom section */}
                    <div className="brand-card-meta">
                        {brand.gstin && (
                            <span className="brand-meta-tag">GST Registered</span>
                        )}
                        <span className="brand-card-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    )
}

/* ===== Main Page ===== */
const BrandsPage = () => {
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFocused, setSearchFocused] = useState(false)

    useEffect(() => {
        fetchBrands()
    }, [])

    const fetchBrands = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/admin/brands')
            if (response.data.success) {
                setBrands(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching brands:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredBrands = brands.filter(brand =>
        brand.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalBrands = brands.length
    const verifiedBrands = brands.filter(b => b.verifiedEmail === 1).length
    const gstBrands = brands.filter(b => b.gstin).length

    /* --- Loading skeleton --- */
    if (loading) {
        return (
            <div className="brands-page-redesign">
                <div className="brands-hero-section">
                    <div className="brands-hero-inner">
                        <div className="h-10 w-80 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4" />
                        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
                    </div>
                </div>
                <div className="brands-content-section">
                    <div className="brands-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="brand-card-skeleton">
                                <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="brands-page-redesign">
            {/* ===== HERO SECTION ===== */}
            <section className="brands-hero-section">
                {/* Floating decorative elements */}
                <motion.div
                    className="brands-hero-float brands-hero-float--1"
                    animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="brands-hero-float brands-hero-float--2"
                    animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                <motion.div
                    className="brands-hero-float brands-hero-float--3"
                    animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />

                <div className="brands-hero-inner">
                    {/* Title */}
                    <motion.div
                        className="brands-hero-title-wrapper"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h1 className="brands-hero-title">
                            Brands We{' '}
                            <span className="brands-hero-title-accent">Partner With</span>
                            <motion.span
                                className="brands-hero-heart"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-4px' }}>
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </motion.span>
                        </h1>
                    </motion.div>

                    <motion.p
                        className="brands-hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Trusted brands. Quality assured. Shopping made better.
                    </motion.p>

                    {/* Search */}
                    <motion.div
                        className={`brands-search-wrapper ${searchFocused ? 'brands-search-focused' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <svg className="brands-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="brands-search-input"
                        />
                        {searchQuery && (
                            <motion.button
                                className="brands-search-clear"
                                onClick={() => setSearchQuery('')}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                whileTap={{ scale: 0.85 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Quick stats pills */}
                    <motion.div
                        className="brands-hero-pills"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className="brands-pill">{totalBrands} Brands</span>
                        <span className="brands-pill brands-pill--green">{verifiedBrands} Verified</span>
                        {gstBrands > 0 && <span className="brands-pill brands-pill--purple">{gstBrands} GST Registered</span>}
                    </motion.div>
                </div>
            </section>

            {/* ===== BRANDS GRID ===== */}
            <section className="brands-content-section">
                <AnimatePresence mode="wait">
                    {filteredBrands.length === 0 ? (
                        <motion.div
                            key="empty"
                            className="brands-empty-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <svg className="brands-empty-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    <line x1="8" y1="11" x2="14" y2="11" />
                                </svg>
                            </motion.div>
                            <h3 className="brands-empty-title">No brands found</h3>
                            <p className="brands-empty-text">
                                {searchQuery ? `No results for "${searchQuery}". Try a different search.` : 'No brands available at the moment.'}
                            </p>
                            {searchQuery && (
                                <motion.button
                                    className="brands-empty-clear"
                                    onClick={() => setSearchQuery('')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Clear search
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            className="brands-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {filteredBrands.map((brand, index) => (
                                <BrandCard key={brand.uid} brand={brand} index={index} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* ===== STATS SECTION ===== */}
            <section className="brands-stats-section">
                <div className="brands-stats-container">
                    {/* Decorative Florals (Approximated with SVG) */}
                    <svg className="stats-floral-left" viewBox="0 0 150 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.6" d="M15.42 166.7C33.2 144.3 62 135 77.2 108.5C92.4 82 86.8 51.5 73.1 27.6C62.1 8.5 35.8 0.4 15.42 -4V166.7Z" fill="#FFE4E9"/>
                        <path opacity="0.8" d="M-5 210C10.5 180 45.2 165.4 65.5 130C85.8 94.6 75.3 50.8 55.4 20C40 -3.1 10.2 -15.4 -5 -20V210Z" fill="#FFD6E0"/>
                        <circle cx="85" cy="55" r="3" fill="#FFB6C6" />
                        <circle cx="105" cy="85" r="2" fill="#FFB6C6" opacity="0.7" />
                        <path d="M95 125 L105 110 L115 120 Z" fill="#FFB6C6" opacity="0.5" />
                    </svg>
                    
                    <svg className="stats-floral-right" viewBox="0 0 150 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.6" d="M15.42 166.7C33.2 144.3 62 135 77.2 108.5C92.4 82 86.8 51.5 73.1 27.6C62.1 8.5 35.8 0.4 15.42 -4V166.7Z" fill="#FFE4E9"/>
                        <path opacity="0.8" d="M-5 210C10.5 180 45.2 165.4 65.5 130C85.8 94.6 75.3 50.8 55.4 20C40 -3.1 10.2 -15.4 -5 -20V210Z" fill="#FFD6E0"/>
                        <circle cx="85" cy="55" r="3" fill="#FFB6C6" />
                        <circle cx="105" cy="85" r="2" fill="#FFB6C6" opacity="0.7" />
                        <path d="M95 125 L105 110 L115 120 Z" fill="#FFB6C6" opacity="0.5" />
                    </svg>

                    <div className="brands-stats-inner">
                        {[
                            { 
                                value: totalBrands, 
                                label: 'Total Brands', 
                                color: '#e84393', 
                                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> 
                            },
                            { 
                                value: verifiedBrands, 
                                label: 'Verified Brands', 
                                color: '#00b894', 
                                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /><polygon points="12 5 13.09 7.26 15.5 7.61 13.75 9.31 14.16 11.74 12 10.6 9.84 11.74 10.25 9.31 8.5 7.61 10.91 7.26 12 5" /></svg> 
                            },
                            { 
                                value: gstBrands, 
                                label: 'GST Registered', 
                                color: '#a29bfe', 
                                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><text x="9" y="16" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">GST</text></svg> 
                            },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="brands-stat-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                            >
                                <div className="brands-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className="brands-stat-value" style={{ color: stat.color }}>
                                    <AnimatedCounter value={stat.value} />
                                </div>
                                <div className="brands-stat-label">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default BrandsPage
