"use client"; // Este componente precisa ser um Client Component

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase-config'; // Importe o Firebase Auth
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Importe a função signOut para logout
import { useRouter } from 'next/navigation'; // Importa o useRouter para redirecionar o usuário
import './globals.css';  // Certifique-se de importar o CSS global aqui

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null); // Armazena o usuário logado
  const [menuOpen, setMenuOpen] = useState(false); // Controla a visibilidade do menu dropdown
  const router = useRouter(); // Hook para redirecionamento de rotas

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
      setMenuOpen(false); // Fecha o dropdown ao sair
      router.push('/login'); // Redireciona para a página de login após o logout
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <html lang="pt-BR">
      <head>
        <title>Meu Webapp</title>
      </head>
      <body className="min-h-screen flex flex-col bg-gray-100">  {/* Mantém as classes Tailwind */}
        {/* Menu de navegação */}
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <nav className="space-x-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/send-feedback" className="hover:underline">Enviar Feedback</Link>
          </nav>

          {/* Exibe o e-mail do usuário logado no canto superior direito */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button 
                  className="text-sm focus:outline-none" 
                  onClick={() => setMenuOpen(!menuOpen)} // Abre/fecha o dropdown ao clicar no botão
                >
                  {user.email}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                    <button 
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout} // Botão de sair
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
