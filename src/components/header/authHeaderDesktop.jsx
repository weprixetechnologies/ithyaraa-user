"use client";

import React, { useState } from 'react'

const AuthHeaderDesktop = () => {
    const [auth, setAuth] = useState(false);
    const [user, setUser] = useState({
        name: "John Doe",
        email: ""
    });

    return (
        <div className="section">
            <div className="hidden md:block">

                {auth ? (
                    <aside className="flex flex-col items-center">
                        <p className="text-xs">Welcome Back</p>
                        <p className="text-sm font-semibold">{user.name}</p>
                    </aside>
                ) : (
                    <button className="text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors cursor-pointer">
                        LOGIN / SIGNUP
                    </button>
                )}
            </div>
        </div>
    )
}

export default AuthHeaderDesktop
