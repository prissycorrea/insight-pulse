"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Autentica o usuário no Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verifica se o usuário existe na coleção 'users' do Firestore
      const userDocRef = doc(db, "users", user.uid); // Referência do documento no Firestore
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        console.log("Usuário encontrado:", userDocSnap.data());
        // Redireciona para a página de feedback após o login bem-sucedido
        router.push("/dashboard");
      } else {
        // Se o usuário não for encontrado na coleção 'users'
        setError("Usuário não encontrado, registre-se primeiro.");
      }

    } catch (error) {
      console.error("Erro de login:", error);
      setError("Erro ao fazer login. Verifique suas credenciais e tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"> {/* Aqui adicionamos o dark:bg-gray-900 */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full"> {/* Aqui também */}
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input 
          type="email" 
          id="email" 
          placeholder="Digite seu email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800" // Adicione dark:text-gray-200 e dark:bg-gray-800
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
          Senha
        </label>
        <input 
          type="password" 
          id="password" 
          placeholder="Digite sua senha" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800" // Adicione dark:text-gray-200 e dark:bg-gray-800
        />
      </div>


        <div className="flex items-center justify-between">
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          >
            Entrar
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/register" className="text-blue-500 hover:text-blue-700 font-bold focus:outline-none">
            Não tem conta? Registre-se aqui
          </Link>
        </div>
      </div>
    </div>
  );
}
