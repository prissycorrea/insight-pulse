"use client";  // Este componente também precisa ser um Client Component

import { useState, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase-config'; // Importa o Firestore e a autenticação do Firebase
import { onAuthStateChanged } from 'firebase/auth';
import Layout from '../layout';

export default function Dashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null); // Estado para armazenar o usuário logado

  // Função para buscar os feedbacks no Firestore relacionados ao e-mail do usuário logado
  const fetchFeedbacks = async (userEmail) => {
    try {
      console.log("Buscando feedbacks para o usuário com e-mail:", userEmail);
      
      const feedbacksCollection = collection(db, "feedbacks");
      const feedbacksQuery = query(feedbacksCollection, where("receiverId", "==", userEmail)); // Filtra pelo e-mail do receiverId
      const feedbacksSnapshot = await getDocs(feedbacksQuery);

      if (feedbacksSnapshot.empty) {
        console.log("Nenhum feedback encontrado para o usuário com e-mail:", userEmail);
      } else {
        const feedbackList = feedbacksSnapshot.docs.map((doc) => doc.data());
        console.log("Feedbacks retornados:", feedbackList);
        setFeedbacks(feedbackList);
      }
    } catch (error) {
      setError("Erro ao carregar os feedbacks.");
      console.error("Erro ao buscar feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuário autenticado:", user.email, "ID:", user.uid);
        // Se o usuário está autenticado, salva o usuário no estado e busca os feedbacks
        setUser(user);
        fetchFeedbacks(user.email);  // Carrega os feedbacks pelo e-mail do usuário logado
      } else {
        console.log("Nenhum usuário autenticado.");
        setError("Você precisa estar logado para ver seus feedbacks.");
        setLoading(false);
      }
    });

    // Cleanup ao desmontar o componente
    return () => unsubscribe();
  }, []);

  return (
    <Layout> 
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Feedbacks Recebidos</h1>
        
        {/* Exibe o e-mail do usuário logado */}
        {user && (
          <p className="text-center mb-4">Logado como: {user.email}</p>
        )}

        {loading ? (
          <p className="text-center">Carregando feedbacks...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center">Nenhum feedback disponível no momento.</p>
        ) : (
          <ul className="space-y-4">
            {feedbacks.map((feedback, index) => (
              <li key={index} className="p-4 bg-gray-50 rounded-lg shadow-md">
                <p>{feedback.message}</p>
                <p
                  className={`mt-2 text-sm ${
                    feedback.sentiment === 'positivo'
                      ? 'text-green-500'
                      : feedback.sentiment === 'negativo'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }`}
                >
                  Sentimento: {feedback.sentiment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </Layout> 
  );
}
