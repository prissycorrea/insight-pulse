"use client"; // Define que o layout é um componente client-side

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import './globals.css'; // Importa os estilos globais
import Image from 'next/image';
import { FaMoon, FaSun } from 'react-icons/fa'; // Importa ícones de sol e lua para o botão de tema

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light'); // Estado para controlar o tema
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

    // Define o tema ao carregar a página
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.add(storedTheme);

    return () => unsubscribe();
  }, []);

  // Função para alternar entre o tema claro e escuro
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme); // Armazena o tema no localStorage
  };

  // Função para realizar o logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
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
      <body className={`${theme} min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 dark:text-gray-200 transition-colors`}>
        {/* Menu de navegação */}
        <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 flex justify-between items-center shadow-lg">
          {/* Logo à esquerda */}
          <div className="flex items-center">
            <Image src="/img/logo.png" width={50} height={50} alt="Logo" />
            <nav className="ml-4 space-x-4">
              <Link href="/dashboard" className="hover:underline dark:hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/sendfeedback" className="hover:underline dark:hover:text-blue-400 transition-colors">
                Enviar Feedback
              </Link>
            </nav>
          </div>

          {/* Alternância de tema */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 focus:outline-none transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <FaMoon className="text-gray-800" /> : <FaSun className="text-yellow-400" />}
          </button>

          {/* Exibe o e-mail do usuário logado no canto superior direito */}
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm dark:text-gray-300">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link href="/login" className="hover:underline dark:hover:text-blue-400 transition-colors">
                Entrar
              </Link>
            )}
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-grow p-8 bg-gray-100 dark:bg-gray-900 transition-colors">
          {children}
        </main>
      </body>
    </html>
  );
}
