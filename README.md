# InsightPulse - Feedback Inteligente
![Status do Projeto](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

## Descrição

O InsightPulse é uma aplicação web que permite que usuários enviem e recebam feedbacks de forma eficiente e intuitiva. A plataforma conta com um sistema de autenticação, envio de e-mails de confirmação, exportação de feedbacks em formatos CSV e PDF, além de gráficos que representam visualmente os dados de feedback. Um recurso adicional é a análise de sentimento dos feedbacks, que utiliza a API do Google para classificar os sentimentos como positivo, negativo ou neutro.

## Tecnologias Utilizadas

- **Frontend:** React, Next.js, Tailwind CSS
- **Backend:** Firebase (Firestore, Authentication)
- **Gráficos:** Chart.js, react-chartjs-2
- **Animações:** framer-motion
- **Exportação de Dados:** Papa Parse, jsPDF
- **Requisições HTTP:** axios
- **Análise de Sentimento:** Google Cloud Natural Language API

## Funcionalidades

- **Cadastro de Usuário:** Usuários podem se registrar com e-mail e senha. Um e-mail de confirmação é enviado para validar o cadastro.
- **Login:** Usuários podem fazer login na aplicação após confirmar o e-mail.
- **Envio de Feedbacks:** Usuários podem enviar feedbacks para outros usuários.
- **Visualização de Feedbacks:** Feedbacks recebidos são exibidos em uma lista, com informações sobre o remetente, data e sentimento.
- **Filtros:** Possibilidade de filtrar feedbacks por data e sentimento (positivo, negativo, neutro).
- **Análise de Sentimento:** Classificação dos feedbacks como positivo, negativo ou neutro usando a API do Google.
- **Gráficos:** Visualização gráfica dos feedbacks recebidos.
- **Exportação de Dados:** Exportação dos feedbacks em formato CSV ou PDF.
