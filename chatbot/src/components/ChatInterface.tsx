// src/components/ChatInterface.tsx

'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext'; 
import { MessageSquare, Send, User, Loader2 } from 'lucide-react'; 

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const ChatInterface = () => {
  const { 
    activeConversation, 
    updateConversationHistory, 
    startNewConversation,
    loadingConversations
  } = useChat(); 
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messages = activeConversation?.history || []; 

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [tokensPerSecond, setTokensPerSecond] = useState<number | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
        textarea.style.height = 'auto'; 
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Press Enter to send message (except Shift also pressed)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
        if (!e.shiftKey) {
            e.preventDefault();
            sendMessage(e as unknown as FormEvent);
        }
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // If no conversation is active, start a new one first.
    if (!activeConversation) {
        await startNewConversation();
        return; 
    }

    const userMessageContent = input.trim();
    setInput('');
    setIsLoading(true);
    setTokensPerSecond(null); 
    
    const userMessage: ChatMessage = { role: 'user', content: userMessageContent };
    
    const historyBeforeSend = activeConversation.history;
    const historyWithUserMsg = [...historyBeforeSend, userMessage];

    // Immediate display of user message (and DB save)
    await updateConversationHistory(historyWithUserMsg);
    
    // Add placeholder message for the model
    const modelPlaceholder: ChatMessage = { role: 'model', content: '...' };
    await updateConversationHistory([...historyWithUserMsg, modelPlaceholder]);

    // API Call
    try {
      const startTime = Date.now();
      let totalTokens = 0;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the full history array
        body: JSON.stringify({ messages: historyWithUserMsg }), 
      });

      if (!response.body) throw new Error("API response body is empty.");

      // Streaming logic
      const reader = response.body.getReader();
      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = new TextDecoder().decode(value, { stream: true }); 
        
        // Loop char by char
        for (let char of chunkText) {
          fullResponse += char; 

          // Update local state for streaming UI
          const streamingHistory = [...historyWithUserMsg, { role: 'model', content: fullResponse } as ChatMessage];
          updateConversationHistory(streamingHistory); 

          // Delay between each char
          await new Promise((resolve) => setTimeout(resolve, 5));
        }

        // Calculate and display tokens/s
        const wordCount = chunkText.trim().split(/\s+/).filter(word => word.length > 0).length;
        totalTokens += Math.max(1, wordCount);

        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / 1000;
        const tps = totalTokens / elapsedTime;
        setTokensPerSecond(tps);
      }
      
      // Final save (ensures title update)
      const finalTime = (Date.now() - startTime) / 1000;
      setTokensPerSecond(totalTokens / finalTime);
      
      const finalModelMessage: ChatMessage = { role: 'model', content: fullResponse };
      const finalHistory = [...historyWithUserMsg, finalModelMessage];

      await updateConversationHistory(finalHistory); 

    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMsg: ChatMessage = {
        role: 'model',
        content: "Sorry, an error occured while processing your request.",
      };
      // Save error message to history
      await updateConversationHistory([...historyWithUserMsg, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Message Bubble Component
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const bubbleClass = isUser
      ? 'bg-indigo-600 text-white self-end rounded-br-none'
      : 'bg-white text-gray-800 self-start rounded-tl-none shadow-md border border-gray-100';
    const icon = isUser ? <User className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;

    return (
      <div className={`flex w-full mb-4 items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="flex-shrink-0 mr-3 p-2 bg-indigo-50 rounded-full text-indigo-600 hidden sm:block">
            {icon}
          </div>
        )}
        <div className={`p-4 rounded-xl max-w-[80%] break-words whitespace-pre-wrap transition-all duration-300 ${bubbleClass}`}>
          <div className="font-semibold mb-1 text-sm opacity-80">
            {isUser ? 'You' : 'Chatbot'}
          </div>
          <p>{message.content}</p>
        </div>
        {isUser && (
          <div className="flex-shrink-0 ml-3 p-2 bg-indigo-100 rounded-full text-indigo-700 hidden sm:block">
            {icon}
          </div>
        )}
      </div>
    );
  };

  // Main Render
  const isChatEmpty = messages.length === 0;
  const isGlobalLoading = isLoading || loadingConversations;

  if (loadingConversations && !activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages Area */}
      <div 
        key={activeConversation?.id || 'empty-chat'}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-gray-50"
      >
        {isChatEmpty && !isGlobalLoading && (
            <div className="text-center mt-20 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                <MessageSquare className="w-10 h-10 mx-auto text-indigo-500 mb-3" />
                <p className="text-lg font-semibold text-indigo-800">
                    {activeConversation?.title || 'New Chat'}
                </p>
                <p className="text-sm text-indigo-600 mt-1">
                    Ask me a question...
                </p>
            </div>
        )}
        
        {messages.map((m, index) => (
          <MessageBubble key={index} message={m as ChatMessage} /> 
        ))}
        
        {/* Response Spinner */}
        {isLoading && (
            <div className="flex items-center justify-start mb-4">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
              <span className="text-sm text-gray-500 italic">Gemini is writing...</span>
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white p-4 border-t border-gray-200 shadow-lg">
        {tokensPerSecond !== null && (
          <div className="text-xs text-right mb-1 text-gray-500">
            Performance: **{tokensPerSecond.toFixed(2)} tokens/s**
          </div>
        )}
        <form onSubmit={sendMessage} className="flex space-x-3">
          <textarea
          onKeyDown={handleKeyDown}
          ref={textareaRef}
            value={input}
            onChange={(e) => {setInput(e.target.value); autoResizeTextarea(e.target);}}
            disabled={isLoading || !activeConversation}
            placeholder={
              !activeConversation
              ? "Let's create a new discussion" 
              : isLoading 
                ? "Waiting for the answer..." 
                : "Your text..."
            }
            rows={1}
            className="flex-1 p-3 input-area resize-none max-h-24 overflow-y-auto"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !activeConversation}
            className={`p-3 rounded-xl flex items-center justify-center transition duration-200 ${
              isLoading || !input.trim() || !activeConversation
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Send className="w-6 h-6 text-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;