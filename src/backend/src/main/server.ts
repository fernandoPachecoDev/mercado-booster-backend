import express from 'express';
import { router } from './routes/index.js'; // Verifique se o caminho está certo
import { MeliApiService } from '../infrastructure/api/MeliApiService.js';

const app = express();

// IMPORTANTE: Esta linha precisa estar antes do app.listen
app.use(express.json());
app.use(router); 

// Rota de teste que você já estava usando
app.get('/test-meli', async (req, res) => {
  const api = new MeliApiService();
  const success = await api.testConnection();
  if (success) {
    return res.json({ status: "success", message: "Conectado!" });
  }
  res.status(500).json({ status: "error", message: "Erro de conexão" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR CORE ONLINE NA PORTA ${PORT}`);
});