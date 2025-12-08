// src/components/MobileHeader.tsx

import { Menu } from 'lucide-react';
import React from 'react';

const MobileHeader = ({ setIsSidebarOpen }: { setIsSidebarOpen: (isOpen: boolean) => void }) => {
    return (
        <div className="md:hidden flex items-center justify-between p-3 border-b border-gray-200 bg-white shadow-sm flex-shrink-0 z-10">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                aria-label="Open sidebar"
            >
                <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold text-gray-800">Chat</span>
            <div className="w-6 h-6"></div>
        </div>
    );
};

export default MobileHeader;