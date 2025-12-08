// src/context/ChatContext.tsx

'use client';

import { supabase } from '@/lib/supabase/client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// TYPES
interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface Conversation {
  id: string; 
  title: string;
  user_id: string;
  history: ChatMessage[];
  updated_at: string; 
}

interface ChatContextProps {
  conversations: Conversation[];
  activeConversation: Conversation | null; 
  loadingConversations: boolean;

  startNewConversation: () => Promise<void>;
  switchConversation: (conversationId: string) => Promise<void>;
  updateConversationHistory: (newHistory: ChatMessage[]) => Promise<void>; 
  resetGuestSession: () => void;
}

// CONTEXT AND HOOK
const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// PROVIDER
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [localHistory, setLocalHistory] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const isGuestMode = !user && !authLoading;

  // Loads all conversation for the authenticated user
  const loadConversations = useCallback(async () => {
    
    // If guest mode -> load conversation from the actual chat
    if (isGuestMode) {
      const guestConv: Conversation = {
        id: 'guest-session',
        title: 'Guest chat (Not saved)',
        user_id: 'guest',
        history: localHistory,
        updated_at: new Date().toISOString(),
      };
      setConversations([guestConv]);
      setActiveConversation(guestConv);
      setLoadingConversations(false);
      return;
    }
    
    if (!user) return;
    setLoadingConversations(true);

    // If logged in -> load conversations from DB
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }); // Sorted by last update

    if (error) {
      console.error('[DB ERROR] Error loading conversations:', error);
      setLoadingConversations(false);
      return;
    }

    setConversations(data as Conversation[]);
    setLoadingConversations(false);

    // If old conversations exist, select last one as active
    if (data.length > 0) {
      setActiveConversation({...data[0]} as Conversation);
    } else {
      // Start a new chat if none exist
      await startNewConversation(); 
    }
  }, [user, authLoading, localHistory]);

  useEffect(() => {
    if (!authLoading) {
      loadConversations();
    }
  }, [authLoading, loadConversations]);


  // LOGIC TO START A NEW CONVERSATION
  const startNewConversation = async () => {

    // For guest -> empty the local history
    if (isGuestMode) {
      setLocalHistory([]);
      return;
    }

    if (!user) {
        console.error("Cannot create conversation: user is not logged in.");
        return;
    }
    setLoadingConversations(true);

    const newConvData = {
      user_id: user.id,
      title: 'New chat', 
      history: [], 
    };

    // Insert new chat into DB (still empty)
    const { data, error } = await supabase
      .from('conversations')
      .insert(newConvData)
      .select()
      .single();

    if (error || !data) {
      console.error('[DB ERROR] Failed to INSERT new conversation:', error);
      setLoadingConversations(false);
      return;
    }
    
    const newConv = data as Conversation;
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv); 
    setLoadingConversations(false);
  };

  // LOGIC TO SWITCH ACTIVE CONVERSATION
  const switchConversation = async (conversationId: string) => {
    // If click on already active conversation
    if (activeConversation?.id === conversationId) return;
    
    // Find conversation ID in list
    const nextConv = conversations.find(c => c.id === conversationId);
    if (nextConv) {
      setActiveConversation({...nextConv}); 
    }
  };

  // LOGIC TO UPDATE HISTORY
  const updateConversationHistory = async (newHistory: ChatMessage[]) => {
    
    if (isGuestMode) {
      setLocalHistory(newHistory);
      setActiveConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          history: newHistory
        };
      });
      return;
    }
    
    if (!user || !activeConversation) {
        console.error('[DB ERROR] Cannot update: no user or no active conversation.');
        return;
    }
    
    // Logic to update title after the first user message
    let newTitle = activeConversation.title;
    if (activeConversation.title === 'New chat' && newHistory.length > 1) {
        const firstUserMsg = newHistory.find(msg => msg.role === 'user');
        // Use 30 first chars of 1st msg to have a title
        if (firstUserMsg) {
            newTitle = firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
        }
    }

    // DB UPDATE operation
    const { data, error } = await supabase
      .from('conversations')
      .update({ 
          history: newHistory,
          title: newTitle,
          updated_at: new Date().toISOString(),
      })
      .eq('id', activeConversation.id)
      .select()
      .single();

    if (error || !data) {
      console.error(`[DB ERROR] Failed to UPDATE history for ID ${activeConversation.id}:`, error);
      return;
    }
    
    // Update conversation locally
    const updatedConv = data as Conversation;
    setActiveConversation(updatedConv); 
    
    // Update the list (for sidebar sorting)
    setConversations(prev => 
        prev.map(c => (c.id === updatedConv.id ? updatedConv : c))
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()) 
    );
  };

  const resetGuestSession = () => {
    setLocalHistory([]);
  };

  const value = {
    conversations,
    activeConversation,
    loadingConversations,
    startNewConversation,
    switchConversation,
    updateConversationHistory,
    resetGuestSession,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};