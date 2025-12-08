// src/components/Sidebar.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { MessageSquare, User } from 'lucide-react';
import React from 'react';

const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  if (!user) {
    return null;
  }
  
  // Prompte sidebar
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen">
      
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-gray-800 truncate">
              {user.email}
            </span>
            <span className="text-xs text-gray-500">
                Connecté
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Historique</h3>
        
        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-800 font-medium cursor-pointer flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Nouvelle Discussion
        </div>
        
        <div className="p-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-not-allowed transition duration-150">
            # Conversation 1 (Aujourd'hui)
        </div>
        <div className="p-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-not-allowed transition duration-150">
            # Analyse de l'architecture
        </div>
        <div className="p-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-not-allowed transition duration-150">
            # Idées pour le bonus
        </div>
      </div>


        {"Footer "}
      <div className="p-4 border-t text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Gemini Chat</p>
      </div>
    </aside>
  );
};

export default Sidebar;