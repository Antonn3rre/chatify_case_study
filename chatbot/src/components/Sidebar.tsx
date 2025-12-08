// src/components/Sidebar.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, User, LogOut, LogIn, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import React from 'react';

const Sidebar = () => {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    
    // Retrieve data from ChatContext
    const { 
        startNewConversation, 
        loadingConversations,
        conversations,
        activeConversation,
        switchConversation
    } = useChat();

    const handleLogin = () => {
        router.push('/login');
    }
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    // Do not show sidebar on the login page
    if (pathname === '/login') {
        return null;
    }

    // Render for disconnected user
    if (!user) {
        return (
            <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen">
                <div className="p-4 border-b flex flex-col items-center">
                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150"
                        title="Se connecter"
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                          Login
                    </button>
                    <button
                        onClick={handleLogin}
                        className="text-xs text-indigo-500 hover:text-indigo-700 mt-2 transition duration-150"
                    >
                        No account ? Sign up here.
                    </button>
                </div>

                <div className="flex-1 p-4 flex flex-col items-center justify-center text-center bg-gray-50/50">
                    <MessageSquare className="w-8 h-8 text-indigo-400 mb-3" />
                    <h3 className="text-sm font-semibold text-gray-700">
                        Save your chat!
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Sign up to save all your conversations!
                    </p>
                </div>
                
                <div className="p-4 border-t text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Gemini Chat</p>
                </div>
            </aside>
        );
    }
    
    // Render for CONNECTED user
    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen">
            
            {/* Profile / Logout Block */}
            <div className="p-4 border-b">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-gray-800 truncate" title={user.email}>
                                {user.email}
                            </span>
                            <span className="text-xs text-gray-500">
                                Logged In
                            </span>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="p-2 ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition duration-150 flex-shrink-0"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Conversations List and Actions */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                
                {/* New Discussion Button */}
                <button
                    onClick={startNewConversation}
                    disabled={loadingConversations}
                    className="w-full flex items-center gap-2 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-150 disabled:bg-indigo-400"
                >
                    {loadingConversations ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    {loadingConversations ? 'Création...' : 'Nouvelle Discussion'}
                </button>

                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 pt-2">History</h3>
                
                {/* DYNAMIC CONVERSATIONS LIST */}
                {loadingConversations && conversations.length === 0 && (
                    <div className="flex justify-center items-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                )}
                
                {conversations.map((conv) => (
                    <button 
                        key={conv.id}
                        onClick={() => switchConversation(conv.id)} 
                        className={`w-full text-left p-3 rounded-lg transition duration-150 truncate flex items-center gap-2 ${
                            conv.id === activeConversation?.id 
                                ? 'bg-indigo-100 text-indigo-800 font-semibold' 
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        title={conv.title}
                    >
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{conv.title}</span>
                    </button>
                ))}

                {!loadingConversations && conversations.length === 0 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                        Start your first chat !
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Gemini Chat</p>
            </div>
        </aside>
    );
};

export default Sidebar;