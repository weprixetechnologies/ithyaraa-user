'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles, X, ChevronLeft, ChevronRight, Copy, Check, Gift, Zap } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.ithyaraa.com/api';

export default function FloatingCouponWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch active featured coupons on client side
  useEffect(() => {
    let isMounted = true;
    async function fetchFeaturedCoupons() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/featured-coupons/active`);
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setCoupons(json.data);
        }
      } catch (err) {
        console.error('[FloatingCouponWidget] Error fetching coupons:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchFeaturedCoupons();
    return () => { isMounted = false; };
  }, []);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!mounted) return null;

  // Don't render floating button if no coupons returned and finished loading
  if (!loading && coupons.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Coupon Button - Desktop Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative group flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-medium shadow-[0_10px_30px_rgba(234,179,8,0.4)] border border-amber-300/40 cursor-pointer overflow-hidden backdrop-blur-md"
        >
          {/* Animated Laser Light Border Glow around Button */}
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,#fff_360deg)] animate-[spin_4s_linear_infinite] opacity-30 group-hover:opacity-60 transition-opacity" />

          {/* Icon Badge */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner">
            <Ticket className="w-5 h-5 text-yellow-200 animate-bounce" />
          </div>

          <div className="relative z-10 flex flex-col items-start text-left">
            <span className="text-xs uppercase tracking-widest font-extrabold text-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-300" /> Exclusive Offers
            </span>
            <span className="text-sm font-bold text-white drop-shadow-sm">
              {coupons.length > 0 ? `${coupons.length} Coupon${coupons.length > 1 ? 's' : ''} Available` : 'Claim Coupons'}
            </span>
          </div>

          {/* Pulse ring indicator */}
          <span className="relative z-10 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-300"></span>
          </span>
        </motion.button>
      </div>

      {/* Magical Laser Light Opening Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* ROTATING LASER LIGHT BEAMS BACKDROP */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
              {/* Laser 1: Conic Gradient Sweeping Beam */}
              <motion.div
                initial={{ rotate: 0, scale: 0.5 }}
                animate={{ rotate: 360, scale: 1.2 }}
                transition={{ rotate: { duration: 10, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.6 } }}
                className="w-[1200px] h-[1200px] rounded-full opacity-40 blur-2xl bg-[conic-gradient(from_0deg,#ff007f,#7928ca,#00dfd8,#ff4d4d,#ff007f)]"
              />
              {/* Laser 2: Opposite Rotating Secondary Beam */}
              <motion.div
                initial={{ rotate: 360 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute w-[900px] h-[900px] rounded-full opacity-30 blur-3xl bg-[conic-gradient(from_180deg,#eab308,#ec4899,#8b5cf6,#eab308)]"
              />
              {/* Laser Line Flares radiating outward */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.8, 0.4], scale: [0.2, 1.1, 1] }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute w-[600px] h-[600px] border border-amber-400/40 rounded-full animate-pulse shadow-[0_0_100px_rgba(234,179,8,0.6)]"
              />
            </div>

            {/* Modal Card Container with Laser Flare Border */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotateX: 30 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.3, opacity: 0, rotateX: -20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="relative w-full max-w-4xl bg-gradient-to-b from-[#18181b]/95 via-[#09090b]/95 to-black/95 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-[0_0_80px_rgba(234,179,8,0.3)] backdrop-blur-2xl z-10 text-white overflow-hidden"
            >
              {/* Laser Shimmer Top Border */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Title with Magical Glow */}
              <div className="text-center mb-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Special Rewards
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-transparent">
                  Unlock Magical Savings
                </h2>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  Copy your favorite coupon code and apply it during checkout for instant discounts!
                </p>
              </div>

              {/* Toast Notification Banner for Copied Code */}
              <AnimatePresence>
                {copiedCode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-xs md:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    Code <span className="underline font-bold text-white">{copiedCode}</span> copied to clipboard!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HORIZONTAL SCROLLABLE COUPONS SECTION */}
              <div className="relative group/scroll my-2">
                {/* Scroll Left Button */}
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 p-2.5 rounded-full bg-black/80 border border-amber-500/40 text-amber-300 shadow-xl hover:scale-110 transition-all cursor-pointer hidden md:flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Scroll Right Button */}
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 p-2.5 rounded-full bg-black/80 border border-amber-500/40 text-amber-300 shadow-xl hover:scale-110 transition-all cursor-pointer hidden md:flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Scrollable Container */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-5 overflow-x-auto scrollbar-none snap-x py-4 px-2 select-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {coupons.map((coupon, idx) => {
                    const discountText = coupon.discountType === 'percent'
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`;
                    const minSpend = coupon.minOrderValue ? `Min. Spend: ₹${coupon.minOrderValue}` : 'No Minimum Order';

                    return (
                      <motion.div
                        key={coupon.id || idx}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="snap-center flex-shrink-0 w-[280px] md:w-[320px] relative bg-gradient-to-br from-[#27272a] via-[#18181b] to-[#09090b] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between overflow-hidden group hover:border-amber-400/70 transition-all"
                      >
                        {/* Cutout Ticket Notches (Left & Right) */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#09090b] border-r border-amber-500/30" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#09090b] border-l border-amber-500/30" />

                        {/* Top Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                            {coupon.couponCode.includes('WELCOME') ? 'Welcome Special' : 'Featured Coupon'}
                          </span>
                          <Gift className="w-4 h-4 text-amber-400 opacity-75 group-hover:scale-110 transition-transform" />
                        </div>

                        {/* Discount Heading */}
                        <div className="my-2">
                          <div className="text-3xl font-black bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100 bg-clip-text text-transparent">
                            {discountText}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 font-medium">{minSpend}</p>
                        </div>

                        {/* Dashed Separator Line */}
                        <div className="my-3 border-b border-dashed border-gray-700/80" />

                        {/* Coupon Code & Copy Action */}
                        <div className="flex items-center justify-between gap-2 bg-black/60 border border-gray-700/60 rounded-xl p-2 pl-3">
                          <span className="font-mono text-sm font-bold text-amber-200 tracking-wider">
                            {coupon.couponCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.couponCode)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            {copiedCode === coupon.couponCode ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy Code
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer hint */}
              <div className="text-center mt-4 text-[11px] text-gray-500">
                ✨ Applicable on all valid cart orders. Coupons subject to availability.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
