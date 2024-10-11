"use client";
import { useState } from 'react';
import { auth, db } from '../../firebase-config'; // Importa o Firestore e Auth
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importa funções necessárias para Firestore
import { useRouter } from 'next/navigation'; // Importa o useRouter do Next.js

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Adiciona o campo nome
  const router = useRouter(); // Instância do roteador para navegação

  const handleRegister = async () => {
    try {
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Após o registro, salva o nome e o uid do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,        // Nome fornecido pelo usuário
        email: user.email, // Email do usuário
        uid: user.uid      // UID gerado pelo Firebase Authentication
      });

      console.log("Usuário registrado com sucesso e salvo no Firestore!");

      // Redireciona o usuário para o dashboard após o registro
      router.push('/dashboard');
    } catch (error) {
      console.error("Erro ao registrar:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Registrar</h1>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nome
          </label>
          <input 
            type="text" 
            id="name" 
            placeholder="Digite seu nome" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input 
            type="email" 
            id="email" 
            placeholder="Digite seu email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Senha
          </label>
          <input 
            type="password" 
            id="password" 
            placeholder="Digite sua senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
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
