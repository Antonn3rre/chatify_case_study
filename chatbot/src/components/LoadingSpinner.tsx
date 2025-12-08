// src/components/LoadingSpinner.tsx

import { Loader2 } from 'lucide-react';
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <span className="ml-3 text-lg font-medium text-gray-700">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;