'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function SupportPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/support/tickets');
            if (response.data.success) {
                setTickets(response.data.tickets);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axiosInstance.get('/support/unread-count');
            if (response.data.success) {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchUnreadCount();
    }, []);

    return (
        <div className="min-h-screen bg-[#fafafa] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-black tracking-tighter italic uppercase">Customer support</h1>
                        <p className="text-gray-500 mt-2 font-medium">How can we help you today?</p>
                        {unreadCount > 0 && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-black text-[#ffd232] px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter italic animate-bounce shadow-xl">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffd232] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffd232]"></span>
                                </span>
                                You have {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
                            </div>
                        )}
                    </div>
                    <Link 
                        href="/support/new"
                        className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-[#ffd232] hover:text-black transition shadow-2xl shadow-gray-200 text-center uppercase tracking-tighter italic"
                    >
                        Raise a Query
                    </Link>
                </div>

                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50">
                        <h2 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Your Recent Inquiries</h2>
                    </div>
                    
                    {loading ? (
                        <div className="p-20 text-center text-gray-400 animate-pulse">Loading history...</div>
                    ) : tickets.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="text-gray-300 mb-4">No support tickets found.</div>
                            <Link href="/support/new" className="text-[#ffd232] font-black underline uppercase tracking-tighter italic">Start a new conversation</Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {tickets.map((ticket) => (
                                <Link 
                                    key={ticket.id} 
                                    href={`/support/details/${ticket.ticket_no}`}
                                    className="block p-8 hover:bg-gray-50 transition group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs font-bold text-[#ffd232]">{ticket.ticket_no}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(ticket.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-black group-hover:text-[#ffd232] transition">
                                        {JSON.parse(ticket.topic_path).pop()?.label}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">{ticket.comment}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
