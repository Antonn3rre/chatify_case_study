// src/components/LoginHeader.tsx

import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const LoginHeader = () => {
    const router = useRouter();

    return (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
            {/* Back to homepage button */}
            <button 
                onClick={() => router.push('/')}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
                <Home className="w-6 h-6" />
            </button>
            <span className="font-semibold text-gray-800">Authentication</span>
            <div className="w-6 h-6"></div>
        </div>
    );
};

export default LoginHeader;