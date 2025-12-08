// src/components/Sidebar.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, User, LogOut, LogIn, Plus, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import React from 'react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }: { isMobileOpen: boolean, setIsMobileOpen: (isOpen: boolean) => void }) => { 
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    
    // Retrieve data from ChatContext
    const { 
        startNewConversation, 
        loadingConversations,
        conversations,
        activeConversation,
        switchConversation,
        resetGuestSession
    } = useChat();

    const isGuestMode = !user; 

    const handleLogin = () => {
        router.push('/login');
        setIsMobileOpen(false); 
    }
    
    const handleLogout = async () => {
        // Call to supabase
        await supabase.auth.signOut();
        // To avoid getting back on old guest chat
        resetGuestSession();
        setIsMobileOpen(false); 
    };

    const sidebarClasses = `
        w-64 bg-white border-r h-full flex-col flex-shrink-0
        
        fixed inset-y-0 z-50 transform transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0 flex' : '-translate-x-full hidden'} 
        
        md:relative md:translate-x-0 md:flex
    `;
    
    return (
        <aside className={sidebarClasses}>
            
            {/* Closing button only on mobile */}
            <div className="flex justify-end p-2 md:hidden flex-shrink-0">
                <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 text-gray-700 hover:text-red-600 transition"
                    aria-label="Fermer le menu"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Profile / Status Block */}
            <div className="p-4 border-b flex-shrink-0">
                {isGuestMode ? (
                    <div className="text-center">
                        <p className="text-sm font-semibold text-indigo-700">Guest Mode</p>
                        <p className="text-xs text-gray-500">
                            <button onClick={handleLogin} className="text-indigo-600 hover:underline">Login</button> to save history.
                        </p>
                    </div>
                ) : (
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
                )}
            </div>

            {/* Conversations List and Actions */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                
                {/* New Chat Button */}
                <button
                    onClick={() => {
                        startNewConversation();
                        setIsMobileOpen(false);
                    }}
                    disabled={loadingConversations}
                    className="w-full flex items-center gap-2 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-150 disabled:bg-indigo-400"
                >
                    {loadingConversations ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    {loadingConversations ? 'Creating...' : 'New Chat'}
                </button>

                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 pt-2">
                    {isGuestMode ? 'Current Session' : 'History'}
                </h3>
                
                {isGuestMode ? (
                    <div className="p-3 text-sm rounded-lg bg-indigo-50 text-indigo-700">
                        {activeConversation?.title || 'New Chat'}
                    </div>
                ) : (
                    // Logic for displaying saved conversations (Authenticated Mode)
                    <>
                        {loadingConversations && conversations.length === 0 && (
                            <div className="flex justify-center items-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                            </div>
                        )}
                        {conversations.map((conv) => (
                            <button 
                                key={conv.id}
                                onClick={() => {
                                    switchConversation(conv.id);
                                    setIsMobileOpen(false);
                                }} 
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
                                Start your first chat!
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t text-sm text-gray-500 flex-shrink-0">
                <p>© {new Date().getFullYear()} Chatify Case Study</p>
            </div>
        </aside>
    );
};

export default Sidebar;