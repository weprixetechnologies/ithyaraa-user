'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function NewSupportTicketPage() {
    const router = useRouter();
    const [topics, setTopics] = useState([]);
    const [currentLevel, setCurrentLevel] = useState([]);
    const [selectionPath, setSelectionPath] = useState([]);
    const [isLeaf, setIsLeaf] = useState(false);
    const [loading, setLoading] = useState(true);
    const [raising, setRaising] = useState(false);
    const [comment, setComment] = useState('');

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/support/topics');
            if (response.data.success) {
                setTopics(response.data.topics);
                setCurrentLevel(response.data.topics);
            }
        } catch (error) {
            console.error('Error fetching topics:', error);
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

        if (topic.input_type === 'leaf') {
            setIsLeaf(true);
            setComment(topic.prefilled_text || '');
        } else {
            setCurrentLevel(topic.children || []);
        }
    };

    const handleBack = () => {
        if (selectionPath.length === 0) {
            router.push('/support');
            return;
        }

        const newPath = selectionPath.slice(0, -1);
        setSelectionPath(newPath);
        setIsLeaf(false);
        setComment('');

        // Recalculate current level
        let level = topics;
        for (const pathItem of newPath) {
            const found = level.find(t => t.id === pathItem.id);
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
            const response = await axiosInstance.post('/support/tickets', {
                leaf_topic_id,
                topic_path: selectionPath,
                priority: 'medium',
                comment
            });
            if (response.data.success) {
                toast.success('Inquiry submitted');
                router.push(`/support/details/${response.data.ticket_no}`);
            }
        } catch (error) {
            console.error('Error raising ticket:', error);
            toast.error(error.response?.data?.message || 'Failed to submit inquiry');
        } finally {
            setRaising(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={handleBack}
                    className="mb-8 flex items-center gap-2 text-gray-400 hover:text-black transition font-bold text-xs uppercase tracking-widest"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Go Back
                </button>

                <div className="mb-12">
                   <h1 className="text-4xl font-black text-black tracking-tighter uppercase italic">Concierge Service</h1>
                   <p className="text-gray-500 mt-2 font-medium">Select the category that best describes your inquiry.</p>
                   
                   {selectionPath.length > 0 && (
                       <div className="flex flex-wrap gap-2 mt-6">
                           {selectionPath.map((p, idx) => (
                               <div key={idx} className="flex items-center gap-2">
                                   <span className="bg-white border border-gray-100 text-gray-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tighter shadow-sm">
                                       {p.label}
                                   </span>
                                   {idx < selectionPath.length - 1 && <span className="text-gray-300">/</span>}
                               </div>
                           ))}
                       </div>
                   )}
                </div>

                {loading ? (
                    <div className="p-20 text-center animate-pulse">Scanning database...</div>
                ) : !isLeaf ? (
                    <div className="grid grid-cols-1 gap-4">
                        {currentLevel.map((topic) => (
                            <button
                                key={topic.id}
                                onClick={() => handleTopicSelection(topic)}
                                className="group bg-white border border-gray-100 hover:border-[#ffd232] p-8 rounded-[40px] text-left hover:shadow-2xl hover:shadow-yellow-50 transition-all flex items-center justify-between"
                            >
                                <span className="text-2xl font-black text-black tracking-tighter uppercase italic">{topic.label}</span>
                                <svg className="w-6 h-6 text-gray-200 group-hover:text-black transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[56px] shadow-2xl shadow-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Detailed Description</label>
                                <textarea
                                    className="w-full bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-black p-8 rounded-[40px] text-lg h-56 transition-all font-medium leading-relaxed outline-none"
                                    required
                                    placeholder="Please provide specifics..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-300 mt-4 uppercase font-bold tracking-widest">Our agents typically respond within 2-4 hours.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={raising || !comment.trim()}
                                className="w-full bg-black text-white py-6 rounded-full font-black text-xl italic uppercase tracking-tighter shadow-2xl shadow-gray-300 hover:bg-[#ffd232] hover:text-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {raising ? 'Sending inquiry...' : 'Open official ticket'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
