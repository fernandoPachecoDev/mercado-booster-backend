import 'dotenv/config'; // Carrega as variáveis do .env
import express from 'express';
import { router } from '../routes/index.js'; // Importa suas rotas

const app = express();
const port = process.env.PORT || 3000;

// Middleware para entender JSON (importante para receber dados)
app.use(express.json());

// AQUI ESTÁ O SEGREDO: Você diz ao Express para usar suas rotas
app.use(router); 

app.listen(port, () => {
  console.log(`🚀 MercadoBooster rodando na porta ${port}`);
  console.log("Rotas disponíveis:");
  console.log("- GET /auth/login");
  console.log("- GET /product/:id");
});