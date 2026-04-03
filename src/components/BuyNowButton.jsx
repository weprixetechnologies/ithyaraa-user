"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import BuyNowModal from "./BuyNowModal.jsx";

/**
 * Generic Buy Now button wrapper.
 */

// ── Portal wrapper ─────────────────────────────────────────────────────────────
const ModalPortal = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    if (!mounted) return null;
    return createPortal(children, document.body);
};

// ── Backdrop + centering shell ─────────────────────────────────────────────────
const ModalShell = ({ onClose, children }) => {
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handler);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div
            className="bn-backdrop"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
        >
            <style>{`
                .bn-backdrop {
                    position: fixed; inset: 0; z-index: 99999;
                    background: rgba(15, 12, 8, 0.55);
                    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
                    display: flex; align-items: center; justify-content: center; padding: 16px;
                    animation: bnBackdropIn .22s ease both;
                }
                @keyframes bnBackdropIn { from { opacity: 0; } to { opacity: 1; } }
                .bn-modal-shell {
                    position: relative; width: 100%; max-width: 1000px; max-height: 94vh;
                    min-height: 700px; min-width: 320px;
                    overflow-y: auto; border-radius: 18px; background: #fff;
                    box-shadow: 0 24px 80px rgba(15,12,8,.3), 0 4px 16px rgba(15,12,8,.12);
                    animation: bnModalIn .28s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes bnModalIn {
                    from { opacity: 0; transform: translateY(22px) scale(.97); }
                    to   { opacity: 1; transform: none; }
                }
                @media (max-width: 480px) {
                    .bn-backdrop { align-items: flex-end; padding: 0; }
                    .bn-modal-shell {
                        max-width: 100%; max-height: 92vh; border-radius: 18px 18px 0 0;
                        animation: bnModalInMobile .3s cubic-bezier(.22,1,.36,1) both;
                    }
                    @keyframes bnModalInMobile { from { transform: translateY(100%); } to { transform: none; } }
                }
            `}</style>
            <div className="bn-modal-shell">{children}</div>
        </div>
    );
};

const BuyNowButton = ({
    product,
    selectedVariation = null,
    selectedItems = [],
    customInputs = {},
    quantity = 1,
    disabled = false,
    productType,
    selectedDressType = null,
    brandID = null,
    referBy = null,
}) => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);

    const handleClick = (e) => {
        if (disabled) {
            try {
                const { toast } = require("react-toastify");
                toast.error("Out of stock");
            } catch { alert("Out of stock"); }
            return;
        }

        console.log("⚡ Buy Now clicked", { productID: product?.productID, brandID, quantity });

        // Ripple logic
        const btn = btnRef.current;
        if (btn) {
            const ripple = document.createElement("span");
            ripple.className = "pdp-bn-ripple";
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
            const y = (e.clientY || rect.top + rect.height / 2) - rect.top;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 550);
        }

        setOpen(true);
    };

    if (!product) return null;

    return (
        <>
            <style>{`
                .pdp-buynow-btn {
                    position: relative; overflow: hidden;
                    flex: 1; min-width: 0; height: 46px; border-radius: 10px;
                    border: 1.5px solid #ffd232;
                    background: linear-gradient(135deg, #c9a84c, #ffd232);
                    color: #fff; font-size: 15px; font-weight: 800; letter-spacing: .4px;
                    cursor: pointer; padding: 0 12px;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    white-space: nowrap; transition: filter .2s ease, box-shadow .2s ease, transform .15s ease;
                    box-shadow: 0 2px 10px rgba(184,148,58,.25);
                }
                .pdp-buynow-btn:hover:not(:disabled) {
                    filter: brightness(1.08); box-shadow: 0 4px 18px rgba(184,148,58,.4); transform: translateY(-1px);
                }
                .pdp-buynow-btn:active:not(:disabled) { transform: scale(.97) translateY(0); filter: brightness(.96); }
                .pdp-buynow-btn:disabled { opacity: .45; cursor: not-allowed; }
                .pdp-bn-ripple {
                    position: absolute; border-radius: 50%; background: rgba(255,255,255,.35);
                    width: 10px; height: 10px; transform: scale(0); pointer-events: none;
                    animation: pdpBnRipple .55s ease-out forwards;
                }
                @keyframes pdpBnRipple { to { transform: scale(26); opacity: 0; } }
                .pdp-buynow-btn::after {
                    content: ''; position: absolute; top: 0; left: -75%; width: 50%; height: 100%;
                    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.22) 50%, transparent 100%);
                    animation: pdpBnSheen 2.8s ease-in-out 1s infinite; pointer-events: none;
                }
                @keyframes pdpBnSheen { 0%,100% { left: -75%; opacity: 1; } 60% { left: 130%; opacity: 0; } }
                .pdp-bn-icon { font-size: 15px; line-height: 1; }
                @media (max-width: 480px) { .pdp-buynow-btn { width: 100%; height: 48px; font-size: 14px; padding: 0 16px; } }
            `}</style>

            <button
                ref={btnRef}
                type="button"
                onClick={handleClick}
                className="pdp-buynow-btn"
                disabled={disabled}
            >
                <span className="pdp-bn-icon">⚡</span>
                Buy Now
            </button>

            {open && (
                <ModalPortal>
                    <ModalShell onClose={() => setOpen(false)}>
                        <BuyNowModal
                            isOpen={open}
                            onClose={() => setOpen(false)}
                            product={product}
                            productType={productType}
                            selectedVariation={selectedVariation}
                            selectedItems={selectedItems}
                            customInputs={customInputs}
                            initialQuantity={quantity}
                            selectedDressType={selectedDressType || null}
                            brandID={ brandID || product?.brandID || product?.uid }
                            referBy={referBy}
                        />
                    </ModalShell>
                </ModalPortal>
            )}
        </>
    );
};

export default BuyNowButton;