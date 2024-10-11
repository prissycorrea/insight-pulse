"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion"; // Importa os componentes para animação
import "./globals.css";

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Verifica se o usuário está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Função para realizar o logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
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
          <div className="flex items-center">
            <img src="/img/logo.png" alt="Logo" width={50} height={50} />
            <nav className="ml-4 space-x-4">
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/sendfeedback" className="hover:underline">
                Enviar Feedback
              </Link>
            </nav>
          </div>

          {/* Exibe o e-mail do usuário logado no canto superior direito */}
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link href="/login" className="hover:underline">
                Entrar
              </Link>
            )}
          </div>
        </header>

        {/* Adiciona a animação ao conteúdo principal */}
        <AnimatePresence mode="wait">
          <motion.main
            key={router.asPath}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
            className="flex-grow p-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </body>
    </html>
  );
}
