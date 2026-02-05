"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import Loading from "@/components/ui/loading";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sanitizeHtml } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getCookie, setCookieEasy } from "@/lib/setCookie";

const PAGE_SIZE = 10;

export default function NewsletterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [statusLoading, setStatusLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const [listLoading, setListLoading] = useState(false);
  const [newsletters, setNewsletters] = useState([]);
  const [totalNewsletters, setTotalNewsletters] = useState(0);
  const [page, setPage] = useState(1);

  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [unsubLoading, setUnsubLoading] = useState(false);
  const [initialSubscribedFromCookie, setInitialSubscribedFromCookie] = useState(false);

  const fetchStatus = async () => {
    try {
      setStatusLoading(true);
      const params = {};
      const userEmail = user?.emailID || user?.email;
      if (userEmail) {
        params.email = userEmail;
      }
      const res = await axiosInstance.get("/newsletter/status", { params });
      const payload = res.data || {};
      const subscribedFlag = !!payload.subscribed;
      setSubscribed(subscribedFlag);
      if (payload.email) {
        setEmail(payload.email);
      }
      if (subscribedFlag) {
        fetchNewsletters(1);
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        // axios interceptor already redirects
        return;
      }
      if (status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (status === 500) {
        toast.error("Unable to fetch newsletter status. Please try again.");
      } else {
        toast.error("Failed to load newsletter status.");
      }
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    // Use cookie to avoid unnecessary status calls
    if (typeof window !== "undefined") {
      const cookieVal = getCookie("newsletter_joined");
      if (cookieVal === "false") {
        setSubscribed(false);
        setInitialSubscribedFromCookie(false);
        setStatusLoading(false);
        return;
      }
      if (cookieVal === "true") {
        setInitialSubscribedFromCookie(true);
        // Treat as joined immediately so we never show the join form while cookie says joined
        setSubscribed(true);
        // Directly load newsletters without another status call
        fetchNewsletters(1);
        setStatusLoading(false);
        return;
      }
    }
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure "Subscribed as" email is populated when we know the user and subscription state
  useEffect(() => {
    if (!email && subscribed && user) {
      const userEmail = user.emailID || user.email || "";
      if (userEmail) {
        setEmail(userEmail);
      }
    }
  }, [email, subscribed, user]);

  const fetchNewsletters = async (targetPage) => {
    try {
      setListLoading(true);
      const res = await axiosInstance.get("/newsletters", {
        params: { page: targetPage, limit: PAGE_SIZE },
      });
      const payload = res.data || {};
      const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
      const total = typeof payload.total === "number" ? payload.total : items.length;
      setNewsletters(items);
      setTotalNewsletters(total);
      setPage(targetPage);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) return; // handled globally
      if (status === 500) {
        toast.error("Failed to load newsletters. Please try again.");
      } else {
        toast.error("Unable to load newsletters.");
      }
    } finally {
      setListLoading(false);
    }
  };

  const totalPages = useMemo(() => {
    if (!totalNewsletters) return 1;
    return Math.max(1, Math.ceil(totalNewsletters / PAGE_SIZE));
  }, [totalNewsletters]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (subscribeLoading) return;

    const trimmedName = nameInput.trim();
    const derivedEmail = user?.emailID || user?.email || "";

    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }
    if (!derivedEmail) {
      toast.error("Unable to detect your email. Please login again.");
      return;
    }

    try {
      setSubscribeLoading(true);
      const res = await axiosInstance.post("/newsletter/subscribe", {
        name: trimmedName,
        emailID: derivedEmail,
      });
      const payload = res.data || {};
      toast.success("You have been subscribed to the newsletter.");
      setSubscribed(true);
      setEmail(derivedEmail);
      fetchNewsletters(1);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Subscription failed.";
      if (status === 400) {
        toast.error(message);
      } else if (status === 429) {
        toast.error("Too many attempts. Please try again later.");
      } else if (status === 500) {
        toast.error("Server error. Please try again.");
      } else {
        toast.error(message);
      }
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (unsubLoading) return;
    if (!window.confirm("Are you sure you want to unsubscribe from the newsletter?")) {
      return;
    }
    try {
      setUnsubLoading(true);
      const userEmail = user?.emailID || user?.email || "";
      await axiosInstance.post("/newsletter/unsubscribe", {
        emailID: userEmail,
      });
      toast.success("You have been unsubscribed.");
      setSubscribed(false);
      setNewsletters([]);
      setTotalNewsletters(0);
      // Clear optimization cookie so future visits show the join form again
      setCookieEasy("newsletter_joined", "false", 30);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Unsubscribe failed.";
      if (status === 400 || status === 404) {
        toast.error(message);
      } else if (status === 500) {
        toast.error("Server error. Please try again.");
      } else {
        toast.error(message);
      }
    } finally {
      setUnsubLoading(false);
    }
  };

  const openDetail = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedNewsletter(null);
  };

  const renderContentPreview = (newsletter) => {
    if (!newsletter) return "";
    const rawHtml = newsletter.content_html || "";
    // naive plain-text preview: strip tags and truncate
    const withoutTags = rawHtml.replace(/<[^>]+>/g, " ");
    return withoutTags.slice(0, 160) + (withoutTags.length > 160 ? "..." : "");
  };

  const safeDetailHtml = useMemo(() => {
    if (!selectedNewsletter?.content_html) return "";
    return sanitizeHtml(selectedNewsletter.content_html);
  }, [selectedNewsletter]);

  if (authLoading || statusLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Newsletter</h1>
          <p className="text-gray-600 mb-8">
            Login to manage your newsletter subscription and see the latest updates.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login?redirect=/newsletter")}
            className="inline-flex items-center justify-center rounded-lg bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-900"
          >
            Login to continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter</h1>
        <p className="text-gray-600 mb-8">
          Stay updated with the latest drops, offers, and style stories from Ithyaraa.
        </p>

        {!subscribed ? (
          <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Subscribe to our newsletter</h2>
            <p className="text-gray-600 mb-6">
              No spam. Just curated updates, offers, and early access.
            </p>
            <form className="space-y-4" onSubmit={handleSubscribe}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Your name"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={subscribeLoading}
                className="w-full flex items-center justify-center rounded-lg bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {subscribeLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Subscribed as</p>
                  <p className="font-semibold text-gray-900">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={unsubLoading}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {unsubLoading ? "Unsubscribing..." : "Unsubscribe"}
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Latest newsletters</h2>
                {listLoading && (
                  <span className="text-xs text-gray-500">Loading…</span>
                )}
              </div>
              {listLoading && newsletters.length === 0 ? (
                <div className="py-10 text-center text-gray-500 text-sm">
                  Loading your newsletters…
                </div>
              ) : newsletters.length === 0 ? (
                <div className="py-10 text-center text-gray-500 text-sm">
                  You are subscribed. We will email you as soon as the first newsletter goes live.
                </div>
              ) : (
                <>
                  <ul className="space-y-4">
                    {newsletters.map((n) => (
                      <li
                        key={n.id}
                        className="border border-gray-100 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => openDetail(n)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                              {n.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {renderContentPreview(n)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-500">
                              {n.sent_at ? new Date(n.sent_at).toLocaleDateString() : ""}
                            </span>
                            <span className="text-xs font-medium text-black underline">
                              Read more
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 text-sm">
                      <span className="text-gray-500">
                        Page {page} of {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fetchNewsletters(Math.max(1, page - 1))}
                          disabled={page <= 1 || listLoading}
                          className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => fetchNewsletters(Math.min(totalPages, page + 1))}
                          disabled={page >= totalPages || listLoading}
                          className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        <Dialog open={detailOpen} onOpenChange={(open) => !open && closeDetail()}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedNewsletter && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedNewsletter.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-2 mb-4 text-xs text-gray-500">
                  {selectedNewsletter.sent_at
                    ? new Date(selectedNewsletter.sent_at).toLocaleString()
                    : ""}
                </div>
                <div
                  className="prose prose-sm max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{ __html: safeDetailHtml }}
                />
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

