import express from 'express';
import cors from 'cors'; // Adicione este import
import { router } from './routes/index.js';
import { MeliApiService } from '../infrastructure/api/MeliApiService.js';

const app = express();

// IMPORTANTE: Adicione o CORS aqui antes das rotas
app.use(cors()); 
app.use(express.json());
app.use(router); 

app.get('/test-meli', async (req, res) => {
  const api = new MeliApiService();
  const success = await api.testConnection();
  if (success) {
    return res.json({ status: "success", message: "Conectado pelo Render!" });
  }
  res.status(500).json({ status: "error", message: "Erro de conexão no servidor" });
});

// Converte para número e define 10000 como padrão caso a env não exista
const PORT = Number(process.env.PORT) || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR ONLINE NA PORTA ${PORT}`);
});