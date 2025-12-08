// src/app/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ChatInterface from '@/components/ChatInterface'; // Assurez-vous d'importer le bon composant

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Si l'utilisateur n'est pas connecté et que le chargement est terminé, on redirige.
      router.push('/login');
    }
  }, [loading, user, router]);

  // 2. Affichage pendant le chargement
  if (loading || !user) {
    // Affiche le spinner pendant la vérification Supabase/Auth ou pendant la redirection
    // Note: La NavigationPanel (Sidebar) gère aussi son propre affichage conditionnel.
    return <LoadingSpinner />;
  }

  // 3. Rendu de l'interface principale
  // Si l'utilisateur est connecté (user est défini), on affiche le composant de chat.
  // Ce composant va occuper l'espace restant à côté de la barre latérale définie dans layout.tsx.
  return (
    <ChatInterface /> 
  );
}