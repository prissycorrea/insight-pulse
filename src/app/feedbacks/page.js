"use client";

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase-config';
import axios from 'axios';

export default function SendFeedback() {
  const [message, setMessage] = useState("");
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

  const handleSendFeedback = async () => {
    try {
      // Analisa o sentimento do feedback
      const sentiment = await analyzeSentiment(message);

      // Envia o feedback e o sentimento para o Firestore
      await addDoc(collection(db, "feedbacks"), {
        message: message,
        sentiment: sentiment,
      });
      
      setMessage("");
      setStatus("Feedback enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      setStatus("Erro ao enviar feedback.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Enviar Feedback</h1>
        
        {status && <p className="text-center text-green-500 mb-4">{status}</p>}

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
  );
}
