"use client"; // Este componente também precisa ser um Client Component

import { useState } from 'react';
import { auth, db } from '../../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Campo para confirmar a senha
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Função para validar a força da senha
  const isPasswordStrong = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async () => {
    // Verifica se as senhas são iguais
    if (password !== confirmPassword) {
      setError("As senhas não são iguais. Por favor, tente novamente.");
      return;
    }

    // Verifica a força da senha
    if (!isPasswordStrong(password)) {
      setError(
        "A senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial."
      );
      return;
    }

    try {
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Após o registro, salva o nome, sobrenome e o uid do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        lastName: lastName,
        email: user.email,
        uid: user.uid,
      });

      console.log("Usuário registrado com sucesso e salvo no Firestore!");

      // Redireciona o usuário para o login após o registro
      router.push('/login');
    } catch (error) {
      console.error("Erro ao registrar:", error);
      setError("Erro ao registrar. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"> {/* Fundo que muda com o tema */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full"> {/* Container que muda com o tema */}
        <h1 className="text-2xl font-bold mb-6 text-center">Registrar</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
            Nome
          </label>
          <input 
            type="text" 
            id="name" 
            placeholder="Digite seu nome" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-200" // Adicionando classes para o tema escuro
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="lastName">
            Sobrenome
          </label>
          <input 
            type="text" 
            id="lastName" 
            placeholder="Digite seu sobrenome" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-200" // Adicionando classes para o tema escuro
          />
        </div>

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
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-200" // Adicionando classes para o tema escuro
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Senha
          </label>
          <input 
            type="password" 
            id="password" 
            placeholder="Digite sua senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-200" // Adicionando classes para o tema escuro
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirmar Senha
          </label>
          <input 
            type="password" 
            id="confirmPassword" 
            placeholder="Confirme sua senha" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-200" // Adicionando classes para o tema escuro
          />
        </div>

        <button 
          onClick={handleRegister}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        >
          Registrar
        </button>
      </div>
    </div>
  );
}
