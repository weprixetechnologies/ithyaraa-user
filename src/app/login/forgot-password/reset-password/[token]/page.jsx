"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ResetPasswordToken = () => {
    const router = useRouter();
    const [status, setStatus] = useState("validating"); // "validating" | "done"

    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus("done");
            // If you also want to redirect automatically after validating:
            // router.push('/login');
        }, 2000);

        return () => clearTimeout(timer); // cleanup
    }, [router]);

    return (
        <div>
            {status === "validating" ? (
                <p>VALIDATING PAGE...</p>
            ) : (
                <p>Hello! Token is valid.</p>
            )}
        </div>
    );
};

export default ResetPasswordToken;
