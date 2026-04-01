"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import Link from "next/link";
import { 
    FaSearch, FaPlus, FaCheck, FaChevronDown, FaChevronUp, 
    FaPaperclip, FaUser, FaClock, FaTicketAlt, FaCircle, FaQuestionCircle
} from "react-icons/fa";


const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const BUNNY_STORAGE_REGION = "sg.storage.bunnycdn.com";
const BUNNY_STORAGE_ZONE = "ithyaraa";
const BUNNY_ACCESS_KEY = "7017f7c4-638b-48ab-add3858172a8-f520-4b88";
const BUNNY_PULL_ZONE = "https://ithyaraa.b-cdn.net";

const uploadToBunny = async (file) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadUrl = `https://${BUNNY_STORAGE_REGION}/${BUNNY_STORAGE_ZONE}/${fileName}`;
    const publicUrl = `${BUNNY_PULL_ZONE}/${fileName}`;

    try {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'AccessKey': BUNNY_ACCESS_KEY,
                'Content-Type': file.type
            },
            body: file
        });

        if (response.ok) {
            return publicUrl;
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Bunny upload error:', error);
        throw error;
    }
};

const getStatusInfo = (status) => {
    switch (status) {
        case 'open':
            return { label: 'On Hold', color: 'text-blue-400', dot: 'bg-blue-400' };
        case 'in_progress':
            return { label: 'In Progress', color: 'text-green-500', dot: 'bg-green-500' };
        case 'closed':
        case 'completed':
            return { label: 'Completed', color: 'text-gray-400', dot: 'bg-gray-300' };
        default:
            return { label: status, color: 'text-gray-400', dot: 'bg-gray-300' };
    }
};

const MobileThread = ({ ticket }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/support/tickets/${ticket.ticket_no}`);
            if (response.data.success) {
                setReplies(response.data.replies || []);
            }
        } catch (error) {
            console.error("Error fetching ticket replies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [ticket.ticket_no]);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const uploadedUrls = await Promise.all(files.map(file => uploadToBunny(file)));
            setAttachments(prev => [...prev, ...uploadedUrls]);
            toast.success("Uploaded successfully");
        } catch (e) {
            toast.error("Failed to upload");
        } finally {
            setUploading(false);
        }
    };

    const handlePost = async () => {
        if (!replyText.trim() && attachments.length === 0) return;
        try {
            setSending(true);
            let finalMessage = replyText;
            if (attachments.length > 0) finalMessage += "\n\nAttachments:\n" + attachments.join("\n");
            const response = await axiosInstance.post(`/support/tickets/${ticket.ticket_no}/replies`, {
                message: finalMessage
            });
            if (response.data.success) {
                setReplyText("");
                setAttachments([]);
                fetchDetail();
                toast.success("Success");
            }
        } catch (e) {
            toast.error("Failed");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-3">
                <textarea 
                    placeholder="Write post here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full min-h-[100px] p-4 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-[#00BCD4] transition-all"
                />
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {attachments.map((url, idx) => (
                            <div key={idx} className="relative w-12 h-12 rounded border border-gray-100 overflow-hidden group">
                                <Image src={url} alt="attachment" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-gray-400 hover:text-[#00BCD4] cursor-pointer inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                            <FaPaperclip size={14} />
                            <span>Attach</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                        <button 
                            onClick={handlePost}
                            disabled={sending || uploading || (!replyText.trim() && attachments.length === 0)}
                            className="bg-[#00BCD4] text-white px-8 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#00BCD4]/20"
                        >
                            {sending ? 'Post...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
                {loading ? (
                    <div className="text-center py-4 opacity-30 animate-pulse text-[10px] font-bold uppercase tracking-widest">Loading...</div>
                ) : (
                    <>
                        {!replies.length && ticket.comment && (
                             <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    <FaUser size={14} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-xs font-bold text-gray-800">You</span>
                                        <span className="text-[9px] text-gray-400 font-bold">Just now</span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">{ticket.comment}</p>
                                </div>
                             </div>
                        )}
                        {[...replies].reverse().map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${reply.sender_type === 'admin' ? 'bg-[#FF9800]' : 'bg-gray-800'}`}>
                                    <FaUser size={14} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-xs font-bold text-gray-800">{reply.sender_type === 'admin' ? 'Support' : 'You'}</span>
                                        <span className="text-[9px] text-gray-400 font-bold">{formatTimeAgo(reply.created_at)}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">{reply.message}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
};

const TicketRow = ({ ticket, isExpanded, onToggle }) => {
    const [replies, setReplies] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);

    const topicPath = useMemo(() => {
        try {
            const parsed = typeof ticket.topic_path === 'string' ? JSON.parse(ticket.topic_path) : (ticket.topic_path || []);
            return parsed.map(t => t.label).join(' > ');
        } catch (e) {
            return "General Support";
        }
    }, [ticket.topic_path]);

    const fetchDetail = async () => {
        if (!isExpanded) return;
        try {
            setLoadingDetails(true);
            const response = await axiosInstance.get(`/support/tickets/${ticket.ticket_no}`);
            if (response.data.success) {
                setReplies(response.data.replies || []);
            }
        } catch (error) {
            console.error("Error fetching ticket replies:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        if (isExpanded) fetchDetail();
    }, [isExpanded, ticket.ticket_no]);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const uploadedUrls = await Promise.all(files.map(file => uploadToBunny(file)));
            setAttachments(prev => [...prev, ...uploadedUrls]);
            toast.success("Images uploaded successfully");
        } catch (e) {
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handlePost = async () => {
        if (!replyText.trim() && attachments.length === 0) return;
        try {
            setSending(true);
            let finalMessage = replyText;
            if (attachments.length > 0) finalMessage += "\n\nAttachments:\n" + attachments.join("\n");
            const response = await axiosInstance.post(`/support/tickets/${ticket.ticket_no}/replies`, {
                message: finalMessage
            });
            if (response.data.success) {
                setReplyText("");
                setAttachments([]);
                fetchDetail();
                toast.success("Response posted successfully");
            }
        } catch (e) {
            toast.error("Failed to post response");
        } finally {
            setSending(false);
        }
    };

    const statusObj = getStatusInfo(ticket.status);

    return (
        <React.Fragment>
            <tr 
                className={`group border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50/30' : ''}`}
                onClick={onToggle}
            >
                <td className="py-5 px-4 text-xs font-medium text-gray-400 pl-8">{ticket.ticket_no}</td>
                <td className="py-5 px-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 leading-tight">{topicPath}</span>
                    </div>
                </td>
                <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusObj.dot}`} />
                        <span className={`text-[13px] font-medium ${statusObj.color}`}>{statusObj.label}</span>
                    </div>
                </td>
                <td className="py-5 px-4 text-[13px] font-medium text-gray-500">
                    {new Date(ticket.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-5 px-4 text-[13px] font-medium text-gray-500">
                    {ticket.assigned_to || 'Support Team'}
                </td>
                <td className="py-5 px-4 pr-8 text-right">
                    {isExpanded ? <FaChevronUp className="inline-block text-gray-300" size={14} /> : <FaChevronDown className="inline-block text-gray-300" size={14} />}
                </td>
            </tr>

            {isExpanded && (
                <tr>
                    <td colSpan={6} className="bg-white/50 px-8 py-8 border-b border-gray-100 shadow-inner">
                        <div className="max-w-[850px] mx-auto space-y-8 animate-in fade-in duration-300">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <FaUser size={18} className="text-gray-300" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden group focus-within:border-[#00BCD4] transition-colors">
                                        <textarea 
                                            placeholder="Write post here..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="w-full min-h-[100px] p-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 resize-none outline-none focus:ring-0 appearance-none"
                                        />
                                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    <span>.jpg, .gif, .jpeg, .png, .txt, .pdf</span>
                                                    <label className="text-gray-400 hover:text-[#00BCD4] ml-1 cursor-pointer transition-colors">
                                                        <FaPaperclip size={14} />
                                                        <input type="file" multiple accept="image/*,.pdf,.txt" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                    </label>
                                                    {uploading && <span className="animate-pulse text-[#00BCD4]">Uploading...</span>}
                                                </div>
                                                {attachments.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {attachments.map((url, idx) => (
                                                            <div key={idx} className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden group">
                                                                <Image src={url} alt="attachment" fill className="object-cover" />
                                                                <button 
                                                                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <FaPlus className="rotate-45" size={10} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="text-sm font-bold text-white bg-gray-400 px-6 py-2 rounded uppercase tracking-wider hover:bg-gray-500 transition-colors">Save Draft</button>
                                                <button 
                                                    onClick={handlePost}
                                                    disabled={sending || uploading || (!replyText.trim() && attachments.length === 0)}
                                                    className="text-sm font-bold text-white bg-[#00BCD4] px-10 py-2 rounded uppercase tracking-wider hover:bg-[#0097a7] transition-colors shadow-lg shadow-[#00BCD4]/20 disabled:opacity-50"
                                                >
                                                    {sending ? 'Posting...' : 'Post'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {loadingDetails ? (
                                <div className="flex justify-center py-10 opacity-30 animate-pulse"><FaTicketAlt size={24} /></div>
                            ) : (
                                <div className="space-y-6">
                                    {!replies.length && ticket.comment && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0"><FaUser size={18} className="text-white" /></div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-800">You</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">Just now</span>
                                                </div>
                                                <p className="text-[13px] text-gray-600 leading-relaxed font-medium">{ticket.comment}</p>
                                            </div>
                                        </div>
                                    )}
                                    {[...replies].reverse().map((reply) => (
                                        <div key={reply.id} className="flex gap-4 group">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${reply.sender_type === 'admin' ? 'bg-[#FF9800]' : 'bg-gray-800'}`}><FaUser size={18} className="text-white" /></div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-800">{reply.sender_type === 'admin' ? (reply.admin_name || 'Customer Support') : 'You'}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatTimeAgo(reply.created_at)}</span>
                                                </div>
                                                <div className="w-full h-px bg-gray-50 mb-2 border-dashed border-gray-100 border-t" />
                                                <p className="text-[13px] text-gray-600 leading-relaxed font-medium">{reply.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

const SupportRevampContent = () => {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTicketNo, setExpandedTicketNo] = useState(null);
    const [activeTab, setActiveTab] = useState('tickets');
    const [faqs, setFaqs] = useState([]);
    const [loadingFaqs, setLoadingFaqs] = useState(false);
    const [expandedFaqId, setExpandedFaqId] = useState(null);
    const [filters, setFilters] = useState({

        all: true,
        onHold: false,
        inProgress: false,
        completed: false
    });


    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/support/tickets');
            if (response.data.success) {
                setTickets(response.data.tickets || []);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchFaqs = async () => {
        try {
            setLoadingFaqs(true);
            const response = await axiosInstance.get('/public/faqs');
            if (response.data) {
                setFaqs(response.data);
            }
        } catch (error) {
            console.error('Error fetching faqs:', error);
        } finally {
            setLoadingFaqs(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'kb') {
            fetchFaqs();
        }
    }, [activeTab]);


    const filteredTickets = useMemo(() => {
        let result = tickets;

        // Search filter
        if (searchQuery) {
            const lowQ = searchQuery.toLowerCase();
            result = result.filter(t => 
                t.ticket_no.toLowerCase().includes(lowQ) || 
                t.comment.toLowerCase().includes(lowQ)
            );
        }

        // Status filter
        if (!filters.all) {
            result = result.filter(t => {
                if (filters.onHold && t.status === 'open') return true;
                if (filters.inProgress && t.status === 'in_progress') return true;
                if (filters.completed && (t.status === 'closed' || t.status === 'completed')) return true;
                return false;
            });
        }

        return result;
    }, [tickets, searchQuery, filters]);

    const handleFilterChange = (key) => {
        if (key === 'all') {
            setFilters({ all: true, onHold: false, inProgress: false, completed: false });
        } else {
            setFilters(prev => {
                const next = { ...prev, [key]: !prev[key], all: false };
                // if none checked, default back to all?
                const noneChecked = !next.onHold && !next.inProgress && !next.completed;
                if (noneChecked) return { all: true, onHold: false, inProgress: false, completed: false };
                return next;
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Nav Header */}
            <header className="bg-white border-b border-gray-100 h-16 sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto w-full h-full flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-1">
                        <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-800">HELP</h1>
                    </div>

                    <nav className="flex h-full gap-4 md:gap-10 overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setActiveTab('tickets')}
                            className={`flex items-center h-full text-[11px] md:text-[13px] font-bold transition-all mt-[2px] whitespace-nowrap ${activeTab === 'tickets' ? 'text-gray-800 border-b-2 border-[#00BCD4]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            My Tickets
                        </button>
                        <button 
                            onClick={() => setActiveTab('kb')}
                            className={`flex items-center h-full text-[11px] md:text-[13px] font-bold transition-all mt-[2px] whitespace-nowrap ${activeTab === 'kb' ? 'text-gray-800 border-b-2 border-[#00BCD4]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Knowledgebase
                        </button>
                        <button 
                            onClick={() => setActiveTab('announcements')}
                            className={`flex items-center h-full text-[11px] md:text-[13px] font-bold transition-all mt-[2px] whitespace-nowrap ${activeTab === 'announcements' ? 'text-gray-800 border-b-2 border-[#00BCD4]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Announcements
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Container */}
            <main className="max-w-[1200px] mx-auto py-6 md:py-12 px-4 md:px-6 space-y-6 md:space-y-10">
                
                {activeTab === 'tickets' ? (
                    <>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                            <div className="relative flex-1 w-full max-w-md">
                                <input 
                                    type="text" 
                                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl p-3 md:p-3.5 pl-10 text-sm font-medium text-gray-600 outline-none focus:bg-white focus:border-gray-300 transition-all placeholder:text-gray-400"
                                    placeholder="Find tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <FaSearch size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <div className="absolute right-4 md:right-[-100px] top-1/2 -translate-y-1/2 hidden md:block">
                                    <span className="text-[13px] font-bold text-gray-400">
                                        {filteredTickets.length} Tickets
                                    </span>
                                </div>
                            </div>

                            <Link 
                                href="/support/new"
                                className="w-full md:w-auto bg-[#00BCD4] text-white px-7 py-3.5 rounded-xl flex items-center justify-center gap-3 font-bold text-[13px] uppercase tracking-wider shadow-lg shadow-[#00BCD4]/20 hover:bg-[#0097a7] transition-all active:scale-95"
                            >
                                <FaPlus size={12} />
                                <span>Add New Ticket</span>
                            </Link>
                        </div>

                        <div className="flex flex-row overflow-x-auto no-scrollbar items-center gap-6 md:gap-8 py-2 -mx-4 px-4 md:mx-0 md:px-0">
                            {[
                                { id: 'all', label: 'ALL' },
                                { id: 'onHold', label: 'ON HOLD' },
                                { id: 'inProgress', label: 'IN PROGRESS' },
                                { id: 'completed', label: 'COMPLETED' }
                            ].map(f => (
                                <label key={f.id} className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0">
                                    <div 
                                        onClick={() => handleFilterChange(f.id)}
                                        className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                                            filters[f.id] 
                                            ? 'bg-[#00BCD4]/10 border-[#00BCD4]' 
                                            : 'border-gray-200 group-hover:border-gray-300'
                                        }`}
                                    >
                                        {filters[f.id] && <FaCheck size={10} className="text-[#00BCD4]" />}
                                    </div>
                                    <span className={`text-[11px] md:text-[12px] font-bold tracking-widest ${filters[f.id] ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`}>
                                        {f.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="py-4 px-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest pl-8 w-[100px]">Ticket ID</th>
                                        <th className="py-4 px-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                        <th className="py-4 px-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest w-[160px]">Status</th>
                                        <th className="py-4 px-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest w-[180px]">Last Update</th>
                                        <th className="py-4 px-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest w-[140px]">Support</th>
                                        <th className="py-4 px-4 pl-4 pr-8 text-right w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="py-6 px-8">
                                                    <div className="h-4 bg-gray-50 rounded-full w-full" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredTickets.length > 0 ? (
                                        filteredTickets.map(ticket => (
                                            <TicketRow 
                                                key={ticket.id} 
                                                ticket={ticket} 
                                                isExpanded={expandedTicketNo === ticket.ticket_no}
                                                onToggle={() => setExpandedTicketNo(expandedTicketNo === ticket.ticket_no ? null : ticket.ticket_no)}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-20">
                                                    <FaTicketAlt size={40} />
                                                    <p className="text-gray-900 font-bold uppercase tracking-[0.2em]">No tickets matched</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="md:hidden space-y-4">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                                ))
                            ) : filteredTickets.length > 0 ? (
                                filteredTickets.map(ticket => {
                                    const expanded = expandedTicketNo === ticket.ticket_no;
                                    return (
                                        <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                                            {/* Header */}
                                            <div 
                                                className={`p-5 flex flex-col gap-3 cursor-pointer ${expanded ? 'bg-gray-50/50' : ''}`}
                                                onClick={() => setExpandedTicketNo(expanded ? null : ticket.ticket_no)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">#{ticket.ticket_no}</span>
                                                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-2.5 py-1 rounded-full shadow-sm">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusInfo(ticket.status).dot}`} />
                                                        <span className={`text-[10px] font-bold ${getStatusInfo(ticket.status).color}`}>{getStatusInfo(ticket.status).label}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-gray-800 leading-tight">
                                                            {JSON.parse(ticket.topic_path || "[]").map(t => t.label).join(' > ')}
                                                        </p>
                                                        <p className="text-[10px] font-medium text-gray-400">Updated {formatTimeAgo(ticket.updated_at)}</p>
                                                    </div>
                                                    <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                                                        <FaChevronDown className="text-gray-300" size={14} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Conversation */}
                                            {expanded && (
                                                <div className="border-t border-gray-50 p-4 bg-white animate-in slide-in-from-top-2 duration-300">
                                                    <MobileThread ticket={ticket} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <FaTicketAlt size={32} />
                                    <p className="text-xs font-bold uppercase tracking-widest">No matching inquiries</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : activeTab === 'kb' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Frequently Asked Questions</h2>
                            <p className="text-gray-500 font-medium text-xs md:text-sm">Find quick answers to your most common concerns.</p>
                        </div>
                        {loadingFaqs ? (
                            <div className="max-w-3xl mx-auto space-y-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-3">
                                {faqs.map((faq) => {
                                    const expanded = expandedFaqId === faq.id;
                                    return (
                                        <div 
                                            key={faq.id} 
                                            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                                                expanded ? 'border-[#00BCD4] shadow-xl shadow-[#00BCD4]/5' : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                        >
                                            <button 
                                                onClick={() => setExpandedFaqId(expanded ? null : faq.id)}
                                                className="w-full px-5 md:px-7 py-4 md:py-5 flex items-center justify-between text-left group"
                                            >
                                                <h3 className={`text-sm md:text-base font-bold transition-colors ${expanded ? 'text-[#00BCD4]' : 'text-gray-800'}`}>
                                                    {faq.question}
                                                </h3>
                                                <div className={`transition-transform duration-300 ${expanded ? 'rotate-180 text-[#00BCD4]' : 'text-gray-300'}`}>
                                                    <FaChevronDown size={12} className="md:size-14" />
                                                </div>
                                            </button>
                                            <div 
                                                className={`transition-all duration-300 ease-in-out ${
                                                    expanded ? 'max-h-[800px] opacity-100 pb-6' : 'max-h-0 opacity-0'
                                                }`}
                                            >
                                                <div className="px-5 md:px-7 pt-1">
                                                    <div className="h-px bg-gray-50 w-full mb-5" />
                                                    <div 
                                                        className="text-[13px] md:text-[15px] text-gray-600 leading-relaxed font-medium faq-answer-content"
                                                        dangerouslySetInnerHTML={{ __html: faq.answer_html }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {faqs.length === 0 && (
                                    <div className="py-20 text-center opacity-20">
                                        <FaQuestionCircle size={40} className="mx-auto mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-[0.2em]">Knowledgebase is empty</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4 animate-in fade-in duration-500">
                        <div className="w-12 md:w-16 h-12 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <FaClock size={20} className="md:size-24" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">No Announcements</h2>
                        <p className="text-gray-500 font-medium text-xs md:text-sm">Check back later for news and updates.</p>
                    </div>
                )}


                {/* Footer / Tip */}
                <div className="flex justify-center py-6">
                    <p className="text-[10px] md:text-[11px] font-bold text-gray-300 uppercase tracking-widest">Showing {filteredTickets.length} total inquiries</p>
                </div>
            </main>
        </div>
    );
};

export default function SupportRevampPage() {
    return (
        <React.Suspense fallback={<div className="p-20 text-center">Initialing Help System...</div>}>
            <SupportRevampContent />
        </React.Suspense>
    );
}

