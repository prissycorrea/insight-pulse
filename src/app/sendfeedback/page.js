"use client";

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';  // Importa o Firestore e as configurações do Firebase
import axios from 'axios';
import Layout from '../layout';


export default function SendFeedback() {
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState(""); // Campo para o ID do destinatário
  const [status, setStatus] = useState("");

  const GOOGLE_API_KEY = "AIzaSyBFFTVNxPHFIiFBIDCf0d_8MGovSXvbRjc";

  const analyzeSentiment = async (text) => {
    try {
      const response = await axios.post(
        `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${GOOGLE_API_KEY}`,
        {
          document: {
            type: "PLAIN_TEXT",
            content: text,
          },
          encodingType: "UTF8",
        }
      );
      const sentiment = response.data.documentSentiment;
      if (sentiment.score > 0) {
        return "positivo";
      } else if (sentiment.score < 0) {
        return "negativo";
      } else {
        return "neutro";
      }
    } catch (error) {
      console.error("Erro ao analisar o sentimento:", error);
      return "neutro";  // Retorna "neutro" em caso de erro
    }
  };

  // Função para enviar o feedback
  const handleSendFeedback = async () => {
    if (!receiverId || !message) {
      setStatus("Por favor, preencha todos os campos.");
      return;
    }

    // Verifica se o usuário está autenticado
    if (!auth.currentUser) {
      setStatus("Você precisa estar logado para enviar um feedback.");
      return;
    }

    try {
      // Dados que serão salvos no documento do feedback
      const feedbackData = {
        message,                              // Mensagem de feedback
        senderId: auth.currentUser.uid,       // ID do usuário que enviou o feedback
        receiverId,                           // ID do usuário que recebeu o feedback
        sentimentScore: await analyzeSentiment(message), // Análise de sentimento
        createdAt: serverTimestamp(),         // Timestamp automático
      };

      // Envia o documento para a coleção 'feedbacks' no Firestore
      await addDoc(collection(db, "feedbacks"), feedbackData);

      setStatus("Feedback enviado com sucesso!");
      setMessage("");
      setReceiverId("");
    } catch (error) {
      console.error("Erro ao enviar feedback: ", error);
      setStatus("Erro ao enviar feedback.");
    }
  };

  return (
    <Layout>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Enviar Feedback</h1>

        {status && <p className="text-center text-green-500 mb-4">{status}</p>}

        <input
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          placeholder="ID do destinatário"
          className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreva seu feedback"
          className="w-full h-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        ></textarea>

        <button
          onClick={handleSendFeedback}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        >
          Enviar
        </button>
      </div>
    </div>
    </Layout>
  );
}
