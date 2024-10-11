"use client";

import { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase-config';

export default function Dashboard() {
  const [feedbacks, setFeedbacks] = useState([]);

  // Função para buscar os feedbacks no Firestore
  const fetchFeedbacks = async () => {
    const feedbacksCollection = collection(db, "feedbacks");
    const feedbacksSnapshot = await getDocs(feedbacksCollection);
    const feedbackList = feedbacksSnapshot.docs.map(doc => doc.data());
    setFeedbacks(feedbackList);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Feedbacks Recebidos</h1>
        {feedbacks.length === 0 ? (
          <p className="text-center">Nenhum feedback disponível no momento.</p>
        ) : (
          <ul className="space-y-4">
            {feedbacks.map((feedback, index) => (
              <li key={index} className="p-4 bg-gray-50 rounded-lg shadow-md">
                <p>{feedback.message}</p>
                <p className={`mt-2 text-sm ${
                  feedback.sentiment === 'positivo' ? 'text-green-500' : feedback.sentiment === 'negativo' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  Sentimento: {feedback.sentiment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
