// src/app/layout.tsx (MIS À JOUR)

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // Importation de l'AuthProvider
import Sidebar from "@/components/Sidebar"; // Nous allons créer ce composant ensuite
import React from 'react';

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
          <div className="h-screen w-screen flex">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
              {children}
            </main>

          </div>
        </AuthProvider>
      </body>
    </html>
  );
}