'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function TicketDetailPage() {
    const { ticketNo } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/support/tickets/${ticketNo}`);
            if (response.data.success) {
                setTicket(response.data.ticket);
                setReplies(response.data.replies);
            }
        } catch (error) {
            console.error('Error fetching ticket detail:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [ticketNo]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            setSending(true);
            const response = await axiosInstance.post(`/support/tickets/${ticketNo}/replies`, {
                message: replyMessage
            });
            if (response.data.success) {
                toast.success('Response added');
                setReplyMessage('');
                fetchDetail();
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error(error.response?.data?.message || 'Failed to send response');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Requesting log data...</div>;
    if (!ticket) return <div className="p-20 text-center text-red-500 font-bold uppercase tracking-widest">Inquiry code not found.</div>;

    const topicPath = typeof ticket.topic_path === 'string' ? JSON.parse(ticket.topic_path) : (ticket.topic_path || []);

    return (
        <div className="min-h-screen bg-[#fafafa] py-12 px-4 pb-32">
            <div className="max-w-4xl mx-auto">
                <Link 
                    href="/support"
                    className="mb-8 flex items-center gap-2 text-gray-400 hover:text-black transition font-bold text-xs uppercase tracking-widest"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    All Inquiries
                </Link>

                <div className="flex items-center justify-between mb-12">
                   <div>
                       <h1 className="text-4xl font-black text-black tracking-tighter uppercase italic">{ticketNo}</h1>
                       <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border border-gray-100 p-2 rounded-full px-4 inline-flex">
                            {topicPath.map((t, idx) => (
                                <React.Fragment key={idx}>
                                    <span>{t.label}</span>
                                    {idx < topicPath.length - 1 && <span className="opacity-20 mx-1">/</span>}
                                </React.Fragment>
                            ))}
                       </div>
                   </div>
                   <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                       ticket.status === 'open' ? 'bg-green-100 text-green-700' : ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'
                   } shadow-sm shadow-black/5`}>
                        {ticket.status.replace('_', ' ')}
                   </span>
                </div>

                <div className="space-y-4">
                    {/* Original Query */}
                    <div className="bg-black text-white p-10 rounded-[48px] shadow-2xl shadow-black/20 mb-12">
                        <div className="flex flex-col gap-1 mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ORIGINAL INQUIRY</span>
                            <span className="text-[10px] font-medium text-gray-500 uppercase">{new Date(ticket.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xl md:text-2xl font-black italic uppercase leading-tight tracking-tighter text-[#ffd232] leading-tight">
                            "{ticket.comment}"
                        </p>
                    </div>

                    {/* Replies */}
                    <div className="space-y-8 flex flex-col items-center">
                        {replies.map((reply) => (
                            <div key={reply.id} className={`flex w-full flex-col ${reply.sender_type === 'admin' ? 'items-start' : 'items-end'}`}>
                                <div className={`p-8 md:p-10 rounded-[40px] max-w-[85%] shadow-xl transition-all ${
                                    reply.sender_type === 'admin' 
                                    ? 'bg-white border-2 border-slate-50 text-black rounded-tl-none' 
                                    : 'bg-black text-white rounded-tr-none'
                                }`}>
                                     <div className="flex items-center gap-3 mb-6">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${reply.sender_type === 'admin' ? 'text-[#ffd232]' : 'text-gray-400'}`}>
                                            {reply.sender_type === 'admin' ? 'Official Support' : 'Your Follow-up'}
                                        </span>
                                        <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">
                                            {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                     </div>
                                     <p className="text-lg font-bold leading-relaxed">{reply.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fixed Reply Box at the bottom */}
                {ticket.status !== 'closed' && (
                    <div className="fixed bottom-0 left-0 right-0 p-6 z-40">
                         <div className="max-w-4xl mx-auto bg-white p-2 rounded-full border-2 border-black/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] flex gap-4 pr-4">
                             <input 
                                className="flex-1 bg-transparent border-0 focus:ring-0 p-6 text-lg font-bold h-16 outline-none px-8 placeholder:text-gray-300"
                                placeholder="Submit Response..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                             />
                             <button 
                                onClick={handleReply}
                                disabled={sending || !replyMessage.trim()}
                                className="bg-black text-white px-10 rounded-full font-black text-sm italic uppercase tracking-tighter hover:bg-[#ffd232] hover:text-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 disabled:opacity-50"
                             >
                                {sending ? '...' : 'Send'}
                             </button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
}
