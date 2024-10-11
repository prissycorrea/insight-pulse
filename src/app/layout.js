"use client"; // Este componente precisa ser um Client Component

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase-config'; // Importe o Firebase Auth
import { onAuthStateChanged } from 'firebase/auth';
import './globals.css';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null); // Armazena o usuário logado

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

  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        {/* Menu de navegação */}
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <nav className="space-x-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/send-feedback" className="hover:underline">Enviar Feedback</Link>
          </nav>

          {/* Exibe o e-mail do usuário logado no canto superior direito */}
          <div>
            {user ? (
              <span className="text-sm">{user.email}</span>
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
