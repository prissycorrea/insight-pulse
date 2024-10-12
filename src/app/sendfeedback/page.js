"use client";

import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import axios from 'axios';
import Layout from '../layout';
import { FaStar } from 'react-icons/fa';  // Importa o ícone de estrela
import { motion } from 'framer-motion';  // Para animação de feedback visual

export default function SendFeedback() {
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState(""); 
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);  // Estado de carregamento

  // Estados para avaliação com estrelas
  const [communication, setCommunication] = useState(0);
  const [collaboration, setCollaboration] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [responsibility, setResponsibility] = useState(0);
  const [creativity, setCreativity] = useState(0);

  const GOOGLE_API_KEY = "SUA_CHAVE_GOOGLE_API";

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

      if (sentiment.score > 0.1) {
        return "positivo";
      } else if (sentiment.score < -0.1) {
        return "negativo";
      } else {
        return "neutro";
      }
    } catch (error) {
      console.error("Erro ao analisar o sentimento:", error);
      return "neutro";
    }
  };

  // Função para buscar os usuários do Firestore
  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Validação do formulário
  const validateForm = () => {
    if (!receiverId || !message || communication === 0 || collaboration === 0 || punctuality === 0 || responsibility === 0 || creativity === 0) {
      setStatus("Por favor, preencha todos os campos e atribua notas aos critérios.");
      return false;
    }
    setStatus("");  // Limpa a mensagem de status se estiver tudo certo
    return true;
  };

  // Função para enviar o feedback
  const handleSendFeedback = async () => {
    if (!validateForm()) return;

    setLoading(true);  // Ativa o estado de carregamento
    setStatus("");  // Limpa a mensagem de status

    try {
      if (!auth.currentUser) {
        setStatus("Você precisa estar logado para enviar um feedback.");
        setLoading(false);
        return;
      }

      const feedbackData = {
        message,
        senderId: auth.currentUser.uid,
        receiverId,
        sentimentScore: await analyzeSentiment(message),
        communication, 
        collaboration, 
        punctuality, 
        responsibility, 
        creativity, 
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "feedbacks"), feedbackData);

      setStatus("Feedback enviado com sucesso!");
      setMessage("");
      setReceiverId("");
      setCommunication(0);
      setCollaboration(0);
      setPunctuality(0);
      setResponsibility(0);
      setCreativity(0);
    } catch (error) {
      console.error("Erro ao enviar feedback: ", error);
      setStatus("Erro ao enviar feedback.");
    } finally {
      setLoading(false);  // Desativa o estado de carregamento
    }
  };

  // Função para renderizar as estrelas
  const renderStars = (rating, setRating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((star, index) => {
          const ratingValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setRating(ratingValue)}
                className="hidden"
              />
              <FaStar
                size={24}
                className="cursor-pointer"
                color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
              />
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Enviar Feedback</h1>

          {status && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center mb-4 ${status.includes("sucesso") ? "text-green-500" : "text-red-500"}`}
            >
              {status}
            </motion.p>
          )}

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-4 text-blue-500"
            >
              Enviando...
            </motion.div>
          ) : (
            <>
              <select
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                required
              >
                <option value="">Selecione um destinatário</option>
                {users.map(user => (
                  <option key={user.id} value={user.email}>
                    {user.name} {user.lastName} - {user.email}
                  </option>
                ))}
              </select>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva seu feedback"
                className="w-full h-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                required
              ></textarea>

              {/* Critérios de avaliação com estrelas */}
              <div className="mt-4">
                <label className="block mb-2 font-bold">Avalie os seguintes pontos de 1 a 5 estrelas:</label>

                <div className="mb-4">
                  <label className="block">Comunicação:</label>
                  {renderStars(communication, setCommunication)}
                </div>

                <div className="mb-4">
                  <label className="block">Colaboração:</label>
                  {renderStars(collaboration, setCollaboration)}
                </div>

                <div className="mb-4">
                  <label className="block">Pontualidade:</label>
                  {renderStars(punctuality, setPunctuality)}
                </div>

                <div className="mb-4">
                  <label className="block">Responsabilidade:</label>
                  {renderStars(responsibility, setResponsibility)}
                </div>

                <div className="mb-4">
                  <label className="block">Criatividade:</label>
                  {renderStars(creativity, setCreativity)}
                </div>
              </div>

              <button
                onClick={handleSendFeedback}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                disabled={loading}
              >
                Enviar
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
