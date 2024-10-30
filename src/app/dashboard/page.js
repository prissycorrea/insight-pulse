"use client"; // Este componente precisa ser um Client Component

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
  
  // Filtros
  const [filter, setFilter] = useState({
    sentiment: '',
    date: '',
  });

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

// Função para exportar feedbacks em CSV
const exportToCSV = (feedbacks) => {
  const formattedFeedbacks = feedbacks.map(feedback => ({
    Feedback: feedback.message,
    Sentimento: feedback.sentimentScore,
    "Enviado por": feedback.senderName,
    "Enviado em": feedback.createdAt,
    "Recebido por": user?.email, // Substitua por receiverId se necessário
  }));
  
  const csv = Papa.unparse(formattedFeedbacks);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `feedback_${new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Função para exportar feedbacks em PDF
const exportToPDF = (feedbacks) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Feedbacks Recebidos por ${user.email}`, 20, 20); // Nome do usuário que recebeu os feedbacks
  doc.setFontSize(12);

  let yPosition = 40; // Posição inicial

  feedbacks.forEach((feedback, index) => {
    // Adiciona informações do feedback
    doc.setFontSize(14);
    doc.text(`Recebido de: ${feedback.senderName}`, 20, yPosition);
    doc.text(`Recebido em: ${feedback.createdAt}`, 20, yPosition + 10);
    doc.setFontSize(12);
    doc.text(feedback.message, 20, yPosition + 30);
    doc.text(`Sentimento: ${feedback.sentimentScore}`, 20, yPosition + 40);
    doc.line(10, yPosition + 45, 200, yPosition + 45); // Linha horizontal separadora

    // Atualiza a posição Y
    yPosition += 60; // Espaço entre feedbacks

    // Verifica se a posição Y ultrapassa o limite da página
    if (yPosition > 250) { // Limite Y para a página
      doc.addPage(); // Adiciona nova página
      yPosition = 20; // Reseta a posição Y para o topo da nova página
    }
  });

  doc.save(`feedback_${new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-')}.pdf`);
};


  // Filtrando feedbacks
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSentiment = filter.sentiment ? feedback.sentimentScore === filter.sentiment : true;
    const matchesDate = filter.date ? feedback.createdAt.includes(filter.date) : true; // Filtra pela data
    return matchesSentiment && matchesDate;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-3xl mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Feedbacks Recebidos</h1>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Filtrar por sentimento:</label>
            <select 
              value={filter.sentiment} 
              onChange={(e) => setFilter({ ...filter, sentiment: e.target.value })} 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">Todos</option>
              <option value="positivo">Positivo</option>
              <option value="negativo">Negativo</option>
              <option value="neutro">Neutro</option>
            </select>
          </div>

          <button
            onClick={() => exportToCSV(feedbacks)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none mb-4"
          >
            Exportar como CSV
          </button>

          <button
            onClick={() => exportToPDF(filteredFeedbacks)} // Exporta apenas os feedbacks filtrados
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none mb-4"
          >
            Exportar como PDF
          </button>

          {loading ? (
            <p className="text-center">Carregando feedbacks...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : filteredFeedbacks.length === 0 ? (
            <p className="text-center">Nenhum feedback disponível no momento.</p>
          ) : (
            <>
              <Bar data={chartData} />
              <ul className="space-y-4 mt-6">
                {filteredFeedbacks.map((feedback, index) => (
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
