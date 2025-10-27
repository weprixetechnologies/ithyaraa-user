'use client';

import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function DownloadMobilePage() {
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        setIsVisible(true);
        setMounted(true);

        // Generate particles only on client
        const particleData = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 2
        }));
        setParticles(particleData);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Animated circles */}
                <div className="absolute top-20 left-20 w-96 h-96 bg-primary-yellow/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

                {/* Floating particles */}
                {mounted && particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute w-2 h-2 bg-primary-yellow rounded-full opacity-30"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                            animation: `float ${particle.duration}s ease-in-out infinite`,
                            animationDelay: `${particle.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className={`relative z-10 text-center px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Google Play Store Icon with Animation */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-yellow rounded-full blur-2xl opacity-50 animate-ping"></div>
                        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center transform transition-all duration-500 hover:scale-110 p-4">
                            <Image
                                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                alt="Google Play Store"
                                width={200}
                                height={200}
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Coming Soon Text */}
                <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-wider animate-pulse">
                    COMING
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-yellow via-yellow-400 to-primary-yellow bg-[length:200%_auto] animate-shimmer">
                        SOON
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
                    We're building an amazing mobile experience
                </p>
                <p className="text-base md:text-lg text-gray-400 mb-8">
                    Stay tuned for updates!
                </p>

                {/* Action Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-primary-yellow hover:bg-yellow-500 text-gray-900 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                    <FaArrowLeft />
                    <span>Go Back Home</span>
                </Link>
            </div>

            {/* Bottom Text */}
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
                <p className="text-gray-500 text-sm">
                    Powered by <span className="text-primary-yellow font-semibold">Ithyaraa</span>
                </p>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: 0% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }

                .animate-shimmer {
                    animation: shimmer 3s linear infinite;
                }
            `}</style>
        </div>
    );
}

