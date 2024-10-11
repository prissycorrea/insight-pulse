"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import './globals.css';
import Image from 'next/image';

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
        <header className="bg-blue-700 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo à esquerda */}
            <div className="flex items-center space-x-4">
            <Image src="/img/logo.png" alt="Logo" width={50} height={50} className="w-10 h-10" />              
            <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-white hover:text-gray-300 transition-colors duration-300">
                  Dashboard
                </Link>
                <Link href="/sendfeedback" className="text-white hover:text-gray-300 transition-colors duration-300">
                  Enviar Feedback
                </Link>
              </nav>
            </div>

            {/* Exibe o e-mail do usuário logado no canto superior direito */}
            <div className="relative">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden sm:inline text-sm">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-300 transform hover:scale-105 focus:outline-none"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hover:underline text-white">
                  Entrar
                </Link>
              )}
            </div>
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
