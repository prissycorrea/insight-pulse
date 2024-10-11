"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import './globals.css';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Verifica se o usuário está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null); // Se o usuário não está logado, o estado é nulo
      }
    });

    // Cleanup ao desmontar o componente
    return () => unsubscribe();
  }, []);

  // Função para realizar o logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      router.push('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <html lang="pt-BR">
      <head>
        <title>Insight Pulse - Feedback Inteligente</title>
      </head>
      <body className="min-h-screen flex flex-col bg-gray-100">
        {/* Menu de navegação */}
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <nav className="space-x-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/sendfeedback" className="hover:underline">Enviar Feedback</Link>
          </nav>

          {/* Exibe o e-mail do usuário logado no canto superior direito */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button 
                  className="text-sm focus:outline-none" 
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {user.email}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                    <button 
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hover:underline">
                Entrar
              </Link>
            )}
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-grow p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
