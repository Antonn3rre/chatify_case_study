// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import React from 'react';
import { ChatProvider } from "@/context/ChatContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatbot AI | Next.js & Gemini",
  description: "Interface de Chatbot propulsée par Gemini et Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <ChatProvider>
          <div className="h-screen w-screen flex">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
              {children}
            </main>

          </div>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}