// src/app/layout.tsx

'use client';

import React, { useState } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import MobileHeader from "@/components/MobileHeader";
import Sidebar from "@/components/Sidebar";

// Load Inter font
const inter = Inter({ subsets: ["latin"] });

// Context providers wrapping every other div to avoid
// manually sending the informations to each one
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 h-screen`}> 
        <AuthProvider>
          <ChatProvider>
            
            <div className="h-full w-screen flex">
              
              {/* SIDEBAR */}
              <Sidebar 
                isMobileOpen={isSidebarOpen} 
                setIsMobileOpen={setIsSidebarOpen} 
              />
              
              {/* MAIN DIV */}
              <main className="flex-1 flex flex-col">
                
                {/* MobileHeader : button for sidebar */}
                <MobileHeader 
                    setIsSidebarOpen={setIsSidebarOpen} 
                />
                
                {children}
              </main>

              {/* Overlay Mobile (Hide screen when sidebar is open) */}
              {isSidebarOpen && (
                <div 
                  onClick={() => setIsSidebarOpen(false)} 
                />
              )}
              
            </div>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}