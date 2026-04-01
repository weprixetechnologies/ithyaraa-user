"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import Link from "next/link";
import { FaChevronRight, FaChevronLeft, FaTicketAlt, FaRocket, FaQuestionCircle } from "react-icons/fa";

export default function NewSupportTicketPage() {
    const router = useRouter();
    const [topics, setTopics] = useState([]);
    const [currentLevel, setCurrentLevel] = useState([]);
    const [selectionPath, setSelectionPath] = useState([]);
    const [isLeaf, setIsLeaf] = useState(false);
    const [loading, setLoading] = useState(true);
    const [raising, setRaising] = useState(false);
    const [comment, setComment] = useState("");

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/support/topics");
            if (response.data.success) {
                setTopics(response.data.topics);
                setCurrentLevel(response.data.topics);
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    const handleTopicSelection = (topic) => {
        const newPath = [...selectionPath, { id: topic.id, label: topic.label }];
        setSelectionPath(newPath);

        if (topic.input_type === "leaf") {
            setIsLeaf(true);
            setComment(topic.prefilled_text || "");
        } else {
            setCurrentLevel(topic.children || []);
        }
    };

    const handleBack = () => {
        if (selectionPath.length === 0) {
            router.push("/support");
            return;
        }

        const newPath = selectionPath.slice(0, -1);
        setSelectionPath(newPath);
        setIsLeaf(false);
        setComment("");

        // Recalculate current level
        let level = topics;
        for (const pathItem of newPath) {
            const found = level.find((t) => t.id === pathItem.id);
            if (found) level = found.children || [];
        }
        setCurrentLevel(level);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setRaising(true);
            const leaf_topic_id = selectionPath[selectionPath.length - 1].id;
            const response = await axiosInstance.post("/support/tickets", {
                leaf_topic_id,
                topic_path: selectionPath,
                priority: "medium",
                comment,
            });
            if (response.data.success) {
                toast.success("Ticket raised successfully");
                router.push(`/support`);
            }
        } catch (error) {
            console.error("Error raising ticket:", error);
            toast.error(error.response?.data?.message || "Failed to submit inquiry");
        } finally {
            setRaising(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Nav Header */}
            <header className="bg-white border-b border-gray-100 h-16 sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto w-full h-full flex items-center justify-between px-6">
                    <div className="flex items-center gap-1">
                        <h1 className="text-xl font-bold tracking-tight text-gray-800">HELP</h1>
                    </div>

                    <nav className="flex h-full gap-4 md:gap-10">
                        <Link href="/support" className="flex items-center h-full text-[13px] font-bold text-gray-800 border-b-2 border-[#00BCD4] mt-[2px]">
                            My Tickets
                        </Link>
                        <Link href="/support?tab=kb" className="flex items-center h-full text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            Knowledgebase
                        </Link>
                        <Link href="/support?tab=announcements" className="flex items-center h-full text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            Announcements
                        </Link>
                    </nav>
                </div>
            </header>


            <main className="max-w-[1200px] mx-auto py-12 px-6">
                {/* Breadcrumbs / Back */}
                <button
                    onClick={handleBack}
                    className="group mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-800 transition-colors font-bold text-[11px] uppercase tracking-widest"
                >
                    <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Support</span>
                </button>

                <div className="mb-10 space-y-2">
                    <div className="inline-flex items-center gap-2 bg-[#00BCD4]/10 text-[#00BCD4] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <FaRocket size={10} />
                        <span>Concierge Service</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Ticket</h1>
                    <p className="text-gray-500 font-medium text-sm">Tell us more about your issue to get the right help.</p>
                </div>

                {/* Progress Path */}
                {selectionPath.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-gray-100">
                        {selectionPath.map((p, idx) => (
                            <React.Fragment key={idx}>
                                <div className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                    {p.label}
                                </div>
                                {idx < selectionPath.length - 1 && <FaChevronRight className="text-gray-200" size={10} />}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="py-20 text-center animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaTicketAlt className="text-gray-300" size={24} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Loading Categories...</p>
                    </div>
                ) : !isLeaf ? (
                    <div className="grid grid-cols-1 gap-4">
                        {currentLevel.map((topic) => (
                            <button
                                key={topic.id}
                                onClick={() => handleTopicSelection(topic)}
                                className="group bg-white border border-gray-100 hover:border-[#00BCD4] p-6 rounded-2xl text-left hover:shadow-xl hover:shadow-[#00BCD4]/5 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-[#00BCD4]/10 flex items-center justify-center transition-colors">
                                        <FaQuestionCircle className="text-gray-300 group-hover:text-[#00BCD4]" size={20} />
                                    </div>
                                    <span className="text-lg font-bold text-gray-800 transition-colors group-hover:text-gray-900">{topic.label}</span>
                                </div>
                                <FaChevronRight className="text-gray-200 group-hover:text-[#00BCD4] transition-all transform group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block pl-1">Detailed Description</label>
                                <textarea
                                    className="w-full bg-[#FAFAFA] border border-gray-100 focus:bg-white focus:border-[#00BCD4] p-6 rounded-2xl text-sm h-48 transition-all font-medium leading-relaxed outline-none shadow-inner"
                                    required
                                    placeholder="Please provide specifics about your request..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span>Support agents typically respond within 2-4 hours.</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={raising || !comment.trim()}
                                    className="flex-1 bg-[#00BCD4] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#00BCD4]/20 hover:bg-[#0097a7] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {raising ? "Submitting Inquiry..." : "Submit Official Ticket"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-8 bg-gray-50 text-gray-400 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
