"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { CiShare2 } from 'react-icons/ci';
import { FaXTwitter, FaWhatsapp, FaFacebook, FaEnvelope, FaLink, FaShareNodes } from 'react-icons/fa6';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import logo from '../../../public/ithyaraa-logo.png';

const ProductShareButton = ({ product = {}, buttonText = "Share", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const getShareUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return `https://ithyaraa.com/products/${product?.productID || ''}`;
    };

    const getShareText = () => {
        const name = product?.name || 'Item';
        const price = product?.salePrice || product?.regularPrice;
        const priceText = price ? ` for ₹${price}` : '';
        return `Check out ${name}${priceText} on Ithyaraa!`;
    };

    const handleShareClick = async () => {
        const shareUrl = getShareUrl();
        const shareText = getShareText();

        // Native Share API if supported (mobile & modern browsers)
        if (typeof window !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: product?.name || 'Ithyaraa Product',
                    text: shareText,
                    url: shareUrl,
                });
                return;
            } catch (err) {
                // Ignore AbortError when user cancels native share dialog
                if (err.name !== 'AbortError') {
                    console.error('Error sharing natively:', err);
                } else {
                    return; // User intentionally cancelled native share sheet
                }
            }
        }

        // Fallback: Open modal with quick social links & copy link
        setIsOpen(true);
    };

    const copyToClipboard = async () => {
        const shareUrl = getShareUrl();
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopied(true);
            toast.success('Product link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            toast.error('Failed to copy link');
        }
    };

    const shareUrl = getShareUrl();
    const shareText = getShareText();

    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const mailShareUrl = `mailto:?subject=${encodeURIComponent(product?.name || 'Check out this product')}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;

    const imgSrc = Array.isArray(product?.featuredImage)
        ? (product.featuredImage[0]?.imgUrl || logo)
        : (product?.featuredImage?.imgUrl || product?.featuredImage || logo);

    const price = product?.salePrice || product?.regularPrice;

    return (
        <>
            <button
                type="button"
                onClick={handleShareClick}
                className={`flex items-center min-h-[44px] hover:text-secondary-text-deep cursor-pointer text-gray-600 transition-colors ${className}`}
            >
                <CiShare2 size={20} />
                <span className="pl-1">{buttonText}</span>
            </button>

            {/* Fallback Share Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FaShareNodes className="text-amber-500" /> Share Product
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Share this product with friends via Twitter, WhatsApp, or copy the link below.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Product Preview Card */}
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 my-2">
                        <div className="relative w-14 h-14 min-w-[56px] rounded-lg overflow-hidden bg-gray-200 border border-gray-100">
                            <Image
                                src={imgSrc}
                                alt={product?.name || 'Product Image'}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{product?.name || 'Product'}</h4>
                            {price && (
                                <p className="text-xs font-medium text-green-600 mt-0.5">₹{price}</p>
                            )}
                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{shareUrl}</p>
                        </div>
                    </div>

                    {/* Quick Social Share Buttons */}
                    <div className="grid grid-cols-4 gap-3 my-3 text-center">
                        <a
                            href={twitterShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-black text-white hover:opacity-90 transition-opacity"
                        >
                            <FaXTwitter size={20} />
                            <span className="text-[11px] font-medium">Twitter / X</span>
                        </a>

                        <a
                            href={whatsappShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-green-500 text-white hover:opacity-90 transition-opacity"
                        >
                            <FaWhatsapp size={20} />
                            <span className="text-[11px] font-medium">WhatsApp</span>
                        </a>

                        <a
                            href={facebookShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-blue-600 text-white hover:opacity-90 transition-opacity"
                        >
                            <FaFacebook size={20} />
                            <span className="text-[11px] font-medium">Facebook</span>
                        </a>

                        <a
                            href={mailShareUrl}
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-600 text-white hover:opacity-90 transition-opacity"
                        >
                            <FaEnvelope size={20} />
                            <span className="text-[11px] font-medium">Email</span>
                        </a>
                    </div>

                    {/* Copy Link Input Bar */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-xl p-1.5 bg-gray-50 mt-1">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="flex-1 bg-transparent px-2 text-xs text-gray-700 outline-none truncate"
                        />
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            className="px-3 py-1.5 bg-primary-yellow hover:bg-yellow-500 text-black text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                            <FaLink size={12} />
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProductShareButton;
