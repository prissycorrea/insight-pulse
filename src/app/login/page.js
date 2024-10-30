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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[80vh] sm:min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-4 sm:py-2">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full mt-[-100px]">
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
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
          Senha
        </label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"}
            id="password" 
            placeholder="Digite sua senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
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
