"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import './globals.css';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import { RiSunFill, RiMoonClearFill} from "react-icons/ri";

export default function RootLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.add(storedTheme);

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

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
      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 flex justify-between items-center shadow-lg">
          {/* Logo */}
          <Link href="/">
            <Image src="/img/logo.png" width={50} height={50} alt="Logo" />
          </Link>

          {/* Botão hamburguer - Removido md:hidden para aparecer em todas as telas */}
          <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Menu de navegação */}
          <nav className={`
            ${isMenuOpen ? 'block' : 'hidden'} 
            flex-col
            absolute
            top-16
            right-0
            w-full md:w-80
            bg-blue-600 dark:bg-blue-800 
            p-4
            space-y-4
            z-50
            shadow-lg
            items-center
            rounded-bl-lg
          `}>
            <Link href="/dashboard" className="block hover:underline dark:hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/sendfeedback" className="block hover:underline dark:hover:text-blue-400 transition-colors">
              Enviar Feedback
            </Link>
            
            {/* Switch de tema */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="relative inline-flex items-center h-8 rounded-full w-16 transition-colors focus:outline-none"
                style={{
                  backgroundColor: theme === 'light' ? '#CBD5E0' : '#1a365d'
                }}
              >
                <RiSunFill className={`absolute left-2 text-yellow-400 ${theme === 'light' ? 'opacity-100' : 'opacity-40'}`} size={14} />
                <RiMoonClearFill className={`absolute right-2 text-gray-800 ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`} size={14} />
                <span
                  className={`
                    inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-200 ease-in-out
                    ${theme === 'light' ? 'translate-x-1' : 'translate-x-9'}
                  `}
                />
              </button>
            </div>

            {/* Informações do usuário */}
            <div className="border-t border-blue-500 dark:border-blue-700 pt-4 mt-4">
              {user ? (
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-sm dark:text-gray-300">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link href="/login" className="block hover:underline dark:hover:text-blue-400 transition-colors">
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        </header>

        <main className="flex-grow p-8 bg-gray-100 dark:bg-gray-900 transition-colors">
          {children}
        </main>
      </body>
    </html>
  );
}