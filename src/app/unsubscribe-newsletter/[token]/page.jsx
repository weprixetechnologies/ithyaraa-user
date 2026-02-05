"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import Loading from "@/components/ui/loading";
import { toast } from "react-toastify";
import { setCookieEasy } from "@/lib/setCookie";

export default function UnsubscribeNewsletterPage() {
  const params = useParams();
  const router = useRouter();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;

  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleUnsubscribe = async () => {
    if (!token) {
      setError("Invalid unsubscribe link.");
      return;
    }
    try {
      setProcessing(true);
      setError("");
      const res = await axiosInstance.post("/newsletter/unsubscribe", { token });
      if (res.data?.success === false) {
        const message = res.data?.message || "Failed to unsubscribe.";
        setError(message);
        toast.error(message);
        return;
      }
      // Clear optimization cookie so future visits do not show as joined
      setCookieEasy("newsletter_joined", "false", 30);
      setDone(true);
      toast.success("You have been unsubscribed from the newsletter.");
    } catch (err) {
      console.error("Error unsubscribing via email link:", err);
      const status = err.response?.status;
      const message = err.response?.data?.message || "Failed to unsubscribe. The link may be invalid or expired.";
      if (status === 400) {
        setError(message);
      } else if (status === 401) {
        setError("This unsubscribe link is not valid.");
      } else {
        setError(message);
      }
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Invalid unsubscribe link.");
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Unsubscribe</h1>
          <p className="text-gray-600 text-sm">
            This unsubscribe link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6">
        <h1 className="text-xl font-semibold mb-2 text-gray-900">Unsubscribe</h1>
        {done ? (
          <>
            <p className="text-gray-600 text-sm mb-4">
              You have been unsubscribed from our newsletter. You can always subscribe again from your account.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-900"
            >
              Go to homepage
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to unsubscribe from our newsletter?
            </p>
            {error && (
              <p className="text-red-600 text-xs mb-3">
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={processing}
              onClick={handleUnsubscribe}
              className="w-full rounded-lg bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? "Unsubscribing..." : "Yes, unsubscribe me"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

