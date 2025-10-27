"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";

const ResetPasswordToken = () => {
    const router = useRouter();
    const { token } = useParams();
    const [status, setStatus] = useState("loading"); // "loading" | "invalid" | "ready" | "success"
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Validate token on mount
    useEffect(() => {
        // Token validation can be done here if needed
        setStatus("ready");
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!password || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("https://72.60.219.181:8800/api/user/reset-password-tokenised", {
                token,
                newPassword: password
            });

            if (response.data.success) {
                toast.success("Password reset successful!");
                setStatus("success");
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                toast.error(response.data.message || "Failed to reset password");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Validating reset link...</p>
                </div>
            </div>
        );
    }

    if (status === "invalid") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                    <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
                    <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-green-600 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-600 mb-6">Your password has been reset successfully. Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
                    <p className="text-gray-600">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter new password"
                            required
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm new password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Resetting Password..." : "Reset Password"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordToken;
