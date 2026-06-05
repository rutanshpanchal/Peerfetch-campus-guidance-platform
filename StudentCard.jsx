'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

interface User {
    id: string;
    studentId: string;
    name: string;
    profilePicture: string | null;
}

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    sender: User;
    receiver: User;
}

interface Conversation {
    user: User;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

function MessagesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedUserId = searchParams.get('userId');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchMessages(selectedUserId);
            const interval = setInterval(() => fetchMessages(selectedUserId), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/messages');
            const data = await response.json();

            if (response.ok) {
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const response = await fetch(`/api/messages?userId=${userId}`);
            const data = await response.json();

            if (response.ok) {
                setMessages(data.messages || []);

                // Find and set the selected user
                const conversation = conversations.find((c) => c.user.id === userId);
                if (conversation) {
                    setSelectedUser(conversation.user);
                } else if (data.messages.length > 0) {
                    // Get user from first message
                    const firstMessage = data.messages[0];
                    setSelectedUser(
                        firstMessage.sender.id === userId ? firstMessage.sender : firstMessage.receiver
                    );
                } else {
                    // No messages yet, fetch user info from student API
                    const userResponse = await fetch(`/api/students/${userId}`);
                    const userData = await userResponse.json();
                    if (userResponse.ok && userData.student) {
                        setSelectedUser({
                            id: userData.student.id,
                            studentId: userData.student.studentId,
                            name: userData.student.name,
                            profilePicture: userData.student.profilePicture,
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !newMessage.trim()) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedUserId,
                    content: newMessage.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setNewMessage('');
                fetchMessages(selectedUserId);
                fetchConversations();
            } else {
                // Show the error to the user
                alert(`Failed to send message: ${data.error || 'Unknown error'}`);
                console.error('Failed to send message:', data);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Network error: Failed to send message');
        }
    };

    const selectConversation = (userId: string) => {
        router.push(`/messages?userId=${userId}`);
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <Sidebar />

            <main className="flex-1 ml-64 flex">
                {/* Conversations List */}
                <div className="w-80 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div className="text-4xl mb-2">💬</div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    No messages yet. Connect with students to start chatting!
                                </p>
                            </div>
                        ) : (
                            <div>
                                {conversations.map((conversation) => (
                                    <button
                                        key={conversation.user.id}
                                        onClick={() => selectConversation(conversation.user.id)}
                                        className={`w-full p-4 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left ${selectedUserId === conversation.user.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {conversation.user.profilePicture ? (
                                                <Image
                                                    src={conversation.user.profilePicture}
                                                    alt={conversation.user.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                                                    {conversation.user.name.charAt(0)}
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {conversation.user.name}
                                                    </span>
                                                    {conversation.unreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {conversation.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
                    {selectedUser ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                                {selectedUser.profilePicture ? (
                                    <Image
                                        src={selectedUser.profilePicture}
                                        alt={selectedUser.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                                        {selectedUser.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        {selectedUser.name}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedUser.studentId}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((message, index) => {
                                    const isOwnMessage = message.sender.id !== selectedUserId;
                                    const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {showAvatar ? (
                                                message.sender.profilePicture ? (
                                                    <Image
                                                        src={message.sender.profilePicture}
                                                        alt={message.sender.name}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {message.sender.name.charAt(0)}
                                                    </div>
                                                )
                                            ) : (
                                                <div className="w-8"></div>
                                            )}

                                            <div className={`flex flex-col max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                                <div
                                                    className={`px-4 py-2 rounded-2xl ${isOwnMessage
                                                        ? 'bg-primary-600 text-white rounded-br-sm'
                                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-sm'
                                                        }`}
                                                >
                                                    {message.content}
                                                </div>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-6 border-t border-gray-200 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Select a conversation to start messaging
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <Sidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
