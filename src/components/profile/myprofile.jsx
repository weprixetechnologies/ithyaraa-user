"use client";
import React, { useEffect, useState } from "react";
import { IoIosCloudUpload } from "react-icons/io";
import Image from "next/image";
import Loading from "../ui/loading";

const MyProfile = ({ user }) => {
    const [profile, setProfile] = useState(user || {});
    const [isLoading, setIsLoading] = useState(true);

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
                    <p className="text-sm font-medium">Email Address</p>
                </div>
                <input
                    type="email"
                    value={profile.emailID || ""}
                    onChange={(e) => setProfile({ ...profile, emailID: e.target.value })}
                    className="border-gray-200 border text-xs px-4 rounded-lg min-w-[400px] min-h-[35px]"
                    placeholder="Email"
                />
            </div>

            {/* Phone */}
            <div className="flex justify-between mb-3 pt-2">
                <div className="flex flex-col">
                    <p className="text-sm font-medium">Phone Number</p>
                </div>
                <input
                    type="tel"
                    value={profile.phonenumber || ""}
                    readOnly
                    className="bg-gray-200 border-gray-200 border text-xs px-4 rounded-lg min-h-[35px]"
                    placeholder="Phone Number"
                />
            </div>

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
