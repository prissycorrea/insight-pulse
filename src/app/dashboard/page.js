"use client"; // Este componente também precisa ser um Client Component

import { useState, useEffect } from "react";
import { getDocs, collection, query, where, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "../layout";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
        console.log("Nenhum feedback encontrado para o usuário com e-mail:", userEmail);
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
        console.log("Usuário autenticado:", user.email, "ID:", user.uid);
        setUser(user);
        fetchFeedbacks(user.email);
      } else {
        setUser(null);
      }
      setLoading(false); // Garanta que o loading seja falso no final
    });

    return () => unsubscribe();
  }, []);

  // Processa os dados para o gráfico
  const feedbackCounts = feedbacks.reduce((acc, feedback) => {
    acc[feedback.sentimentScore] = (acc[feedback.sentimentScore] || 0) + 1;
    return acc;
  }, { positivo: 0, negativo: 0, neutro: 0 });

  const chartData = {
    labels: ['Positivo', 'Negativo', 'Neutro'],
    datasets: [
      {
        label: 'Feedbacks',
        data: [feedbackCounts.positivo, feedbackCounts.negativo, feedbackCounts.neutro],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
      },
    ],
  };

  const formatFileName = () => {
    const date = new Date();
    const formattedDate = date.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
    return `feedback_${formattedDate}`;
  };
  
  // Função para exportar feedbacks em CSV
  const exportToCSV = (feedbacks) => {
    const csv = Papa.unparse(feedbacks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${formatFileName()}.csv`); // Usando a função para o nome do arquivo
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  
  // Função para exportar feedbacks em PDF
  const exportToPDF = (feedbacks) => {
    const doc = new jsPDF();
    doc.text("Feedbacks Recebidos", 20, 20);
    
    feedbacks.forEach((feedback, index) => {
      const text = `${index + 1}. ${feedback.message} - De: ${feedback.senderName} - Enviado em: ${feedback.createdAt} - Sentimento: ${feedback.sentimentScore}`;
      doc.text(text, 20, 30 + (10 * index));
    });
  
    doc.save(`${formatFileName()}.pdf`); // Usando a função para o nome do arquivo
  };
  
  

  return (
    <Layout>
      
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-3xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Feedbacks Recebidos</h1>


        <button
          onClick={() => exportToCSV(feedbacks)} // Chame a função aqui
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none mb-4"
        >
          Exportar como CSV
        </button>

        <button
          onClick={() => exportToPDF(feedbacks)} // Chame a função aqui
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none mb-4"
        >
          Exportar como PDF
        </button>

          {loading ? (
            <p className="text-center">Carregando feedbacks...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center">Nenhum feedback disponível no momento.</p>
          ) : (
            <>
              <Bar data={chartData} />
              <ul className="space-y-4 mt-6">
                {feedbacks.map((feedback, index) => (
                  <li key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">
                    <p>{feedback.message}</p>
                    <p className="text-sm mt-2">De: {feedback.senderName}</p>
                    <p className="text-sm mt-1 text-gray-500 dark:text-gray-300">Enviado em: {feedback.createdAt}</p>
                    <p className={`mt-2 text-sm ${feedback.sentimentScore === "positivo" ? "text-green-500" : feedback.sentimentScore === "negativo" ? "text-red-500" : "text-yellow-500"}`}>
                      Sentimento: {feedback.sentimentScore}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
