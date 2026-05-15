import 'dotenv/config'; // ESSENCIAL PARA O RENDER LER O CLIENT_ID
import express from 'express';
import cors from 'cors';
import { router } from './routes/index'; // Removido .js
import { MeliApiService } from '../infrastructure/api/MeliApiService'; // Removido .js

const app = express();

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

const PORT = Number(process.env.PORT) || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR ONLINE NA PORTA ${PORT}`);
});