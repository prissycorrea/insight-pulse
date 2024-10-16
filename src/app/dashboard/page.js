"use client"; // Este componente também precisa ser um Client Component

import { useState, useEffect } from "react";
import { getDocs, collection, query, where, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "../layout";

export default function Dashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Função para buscar o nome do remetente com base no senderId
  const fetchSenderName = async (senderId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", senderId));
      return userDoc.exists() ? userDoc.data().name : "Usuário desconhecido";
    } catch (error) {
      console.error("Erro ao buscar o nome do remetente:", error);
      return "Usuário desconhecido";
    }
  };

  // Função para buscar os feedbacks no Firestore relacionados ao e-mail do usuário logado
  const fetchFeedbacks = async (userEmail) => {
    try {
      console.log("Buscando feedbacks para o usuário com e-mail:", userEmail);

      const feedbacksCollection = collection(db, "feedbacks");
      const feedbacksQuery = query(
        feedbacksCollection,
        where("receiverId", "==", userEmail)
      ); // Filtra pelo e-mail do receiverId
      const feedbacksSnapshot = await getDocs(feedbacksQuery);

      if (feedbacksSnapshot.empty) {
        console.log(
          "Nenhum feedback encontrado para o usuário com e-mail:",
          userEmail
        );
      } else {
        const feedbackList = await Promise.all(
          feedbacksSnapshot.docs.map(async (doc) => {
            const feedbackData = doc.data();
            const senderName = await fetchSenderName(feedbackData.senderId);
            return {
              ...feedbackData,
              senderName,
              createdAt: feedbackData.createdAt?.toDate().toLocaleString() || "Data não disponível",
            };
          })
        );
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
        setUser(user);
        fetchFeedbacks(user.email);
      } else {
        setUser(null);
      }
      setLoading(false); // Garanta que o loading seja falso no final
    });
  
    return () => unsubscribe();
  }, []);
  
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-3xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Feedbacks Recebidos</h1>

          {loading ? (
            <p className="text-center">Carregando feedbacks...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center">Nenhum feedback disponível no momento.</p>
          ) : (
            <ul className="space-y-4">
              {feedbacks.map((feedback, index) => (
                <li key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">
                  <p>{feedback.message}</p>
                  <p className="text-sm mt-2">De: {feedback.senderName}</p>
                  <p className="text-sm mt-1 text-gray-500 dark:text-gray-300">Enviado em: {feedback.createdAt}</p>
                  <p
                    className={`mt-2 text-sm ${
                      feedback.sentimentScore === "positivo"
                        ? "text-green-500"
                        : feedback.sentimentScore === "negativo"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    Sentimento: {feedback.sentimentScore}
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
