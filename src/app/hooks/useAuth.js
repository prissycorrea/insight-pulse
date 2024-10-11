import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-config';  // Certifique-se de que o caminho está correto
import { useRouter } from 'next/router';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        router.push('/login');  // Redireciona para a página de login se não estiver autenticado
      }
      setLoading(false);  // Para parar de mostrar o estado de carregamento
    });

    // Cleanup da subscrição quando o componente desmontar
    return () => unsubscribe();
  }, [router]);

  return { user, loading };
};
