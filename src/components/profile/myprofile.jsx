"use client";
import React, { useEffect, useState } from "react";
import { IoIosCloudUpload } from "react-icons/io";
import { MdVerified, MdOutlineCancel } from "react-icons/md";
import Image from "next/image";
import Loading from "../ui/loading";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import EnterOtp from "../ui/enterOtp";

const MyProfile = ({ user }) => {
    const [profile, setProfile] = useState(user || {});
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');

    // Keep profile in sync when `user` prop changes
    useEffect(() => {
        console.log('user', user);

        if (user) {
            setProfile(user);
            setIsLoading(false);
        }
    }, [user]);

    // Debug log
    useEffect(() => {
        console.log("Profile:", profile);
    }, [profile]);

    // Check if user is verified and refresh data
    useEffect(() => {
        if (profile.verifiedEmail === 1 || profile.verifiedPhone === 1) {
            fetchUserData();
        }
    }, [profile.verifiedEmail, profile.verifiedPhone]);

    const fetchUserData = async () => {
        try {
            const res = await axiosInstance.get('/user/detail-by-user');
            setProfile(res.data);
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    const sendEmailVerificationOtp = async () => {
        try {
            const res = await axiosInstance.post('/user/send-email-verification-otp');
            if (res.data.success) {
                toast.success(res.data.message);
                setIsVerifyingEmail(true);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to send verification code');
        }
    };

    const verifyEmailOtp = async () => {
        if (!emailOtp || emailOtp.length < 6) {
            toast.error('Please enter complete OTP');
            return;
        }
        try {
            const res = await axiosInstance.post('/user/verify-email-otp', { otp: emailOtp });
            if (res.data.success) {
                toast.success(res.data.message);
                setIsVerifyingEmail(false);
                setEmailOtp('');
                fetchUserData();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to verify email');
        }
    };

    const sendPhoneVerificationOtp = async () => {
        try {
            const res = await axiosInstance.post('/user/send-phone-verification-otp');
            if (res.data.success) {
                toast.success(res.data.message);
                setIsVerifyingPhone(true);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to send verification code');
        }
    };

    const verifyPhoneOtp = async () => {
        if (!phoneOtp || phoneOtp.length < 6) {
            toast.error('Please enter complete OTP');
            return;
        }
        try {
            const res = await axiosInstance.post('/user/verify-phone-otp', { otp: phoneOtp });
            if (res.data.success) {
                toast.success(res.data.message);
                setIsVerifyingPhone(false);
                setPhoneOtp('');
                fetchUserData();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to verify phone');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between mb-3 py-2">
                <div className="flex flex-col">
                    <p className="text-sm font-medium">Personal Info</p>
                    <p className="text-xs text-secondary-text-deep">
                        Update your photo and personal details here
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-transparent border-gray-200 border rounded-lg">
                        Cancel
                    </button>
                    <button className="px-3 py-2 bg-primary-yellow rounded-lg">
                        Save Changes
                    </button>
                </div>
            </div>
            <hr className="border-gray-200" />

            {/* Full Name */}
            <div className="flex justify-between mb-3 mt-4 pt-4">
                <div className="flex flex-col">
                    <p className="text-sm font-medium">Full Name</p>
                </div>
                <input
                    type="text"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="border-gray-200 border text-xs px-4 rounded-lg min-w-[400px] min-h-[35px]"
                    placeholder="Name"
                />
            </div>

            {/* Email */}
            <div className="flex justify-between mb-3 pt-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Email Address</p>
                        {profile.verifiedEmail === 1 ? (
                            <MdVerified className="text-green-500" size={18} title="Verified" />
                        ) : (
                            <MdOutlineCancel className="text-red-500" size={18} title="Not Verified" />
                        )}
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <input
                        type="email"
                        value={profile.emailID || ""}
                        onChange={(e) => setProfile({ ...profile, emailID: e.target.value })}
                        className="border-gray-200 border text-xs px-4 rounded-lg min-w-[300px] min-h-[35px]"
                        placeholder="Email"
                    />
                    {profile.verifiedEmail !== 1 && (
                        <button
                            onClick={isVerifyingEmail ? verifyEmailOtp : sendEmailVerificationOtp}
                            className={`px-4 py-2 text-sm rounded-lg ${isVerifyingEmail ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                                }`}
                        >
                            {isVerifyingEmail ? 'Verify' : 'Verify Email'}
                        </button>
                    )}
                </div>
            </div>

            {/* Email OTP Input */}
            {isVerifyingEmail && (
                <div className="flex justify-between mb-3 pt-2">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium">Enter OTP</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <EnterOtp length={6} onChange={(val) => setEmailOtp(val)} />
                        <button
                            onClick={() => {
                                setIsVerifyingEmail(false);
                                setEmailOtp('');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Phone */}
            <div className="flex justify-between mb-3 pt-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Phone Number</p>
                        {profile.verifiedPhone === 1 ? (
                            <MdVerified className="text-green-500" size={18} title="Verified" />
                        ) : (
                            <MdOutlineCancel className="text-red-500" size={18} title="Not Verified" />
                        )}
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <input
                        type="tel"
                        value={profile.phonenumber || ""}
                        readOnly
                        className="bg-gray-200 border-gray-200 border text-xs px-4 rounded-lg min-w-[300px] min-h-[35px]"
                        placeholder="Phone Number"
                    />
                    {profile.verifiedPhone !== 1 && (
                        <button
                            onClick={isVerifyingPhone ? verifyPhoneOtp : sendPhoneVerificationOtp}
                            className={`px-4 py-2 text-sm rounded-lg ${isVerifyingPhone ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                                }`}
                        >
                            {isVerifyingPhone ? 'Verify' : 'Verify Phone'}
                        </button>
                    )}
                </div>
            </div>

            {/* Phone OTP Input */}
            {isVerifyingPhone && (
                <div className="flex justify-between mb-3 pt-2">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium">Enter OTP</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <EnterOtp length={6} onChange={(val) => setPhoneOtp(val)} />
                        <button
                            onClick={() => {
                                setIsVerifyingPhone(false);
                                setPhoneOtp('');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Username + UID */}
            <div className="flex justify-between mb-7 pt-2">
                <div className="flex flex-col">
                    <p className="text-sm font-medium">Username and UID</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={profile.username || ""}
                        readOnly
                        className="bg-gray-200 border-gray-200 border text-xs px-4 rounded-lg min-w-[200px] min-h-[35px]"
                        placeholder="Username"
                    />
                    <input
                        type="text"
                        value={profile.uid || ""}
                        readOnly
                        className="bg-gray-200 border-gray-200 border text-xs px-4 rounded-lg min-w-[200px] min-h-[35px]"
                        placeholder="UID"
                    />
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Profile Photo */}
            <div className="flex justify-between mb-3 py-2">
                <div className="flex flex-col">
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-secondary-text-deep">
                        The photo will be displayed on your profile
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Image
                            src={
                                profile.featuredImage ||
                                "https://images.bewakoof.com/uploads/grid/app/1x1-trackpantsjoggers-men-gif-ezgif-com-optimize-1755442861.gif"
                            }
                            height={100}
                            width={100}
                            className="rounded-full p-2 ring-1"
                            alt="Profile Picture"
                        />
                    </div>
                    <div className="flex flex-col justify-center items-center border-dashed border min-h-20 min-w-[200px] max-w-[300px] p-5">
                        <IoIosCloudUpload className="text-blue-500" size={30} />
                        <p className="text-xs text-center">
                            Click to Upload or Drag and drop
                            <br />
                            SVG, PNG or JPG (max 800x400px)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
