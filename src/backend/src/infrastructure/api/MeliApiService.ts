import axios from 'axios';
import https from 'node:https';

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolibre.com';

  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    family: 4 // Mantém IPv4 para evitar ENOTFOUND
  });

  // Vamos mudar o teste para um endpoint que as políticas costumam liberar mais fácil
  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Tentando teste de rota simples...`);
      const response = await axios.get(`${this.baseUrl}/currencies/BRL`, {
        timeout: 10000,
        httpsAgent: this.httpsAgent,
        headers: { 
          'User-Agent': 'MercadoBooster/1.0'
        }
      });
      return response.status === 200;
    } catch (error: any) {
      console.error(`❌ [DEBUG] Teste falhou (comum em endpoints públicos): ${error.message}`);
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      console.log("📡 [DEBUG] Iniciando troca de token oficial...");
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/oauth/token`,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'MercadoBooster/1.0'
        },
        data: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.MELI_CLIENT_ID || '',
          client_secret: process.env.MELI_CLIENT_SECRET || '',
          code: code,
          redirect_uri: process.env.VITE_MELI_REDIRECT_URI || ''
        }).toString(),
        timeout: 30000 
      });
      
      console.log("✅ [DEBUG] TOKEN OBTIDO COM SUCESSO!");
      return response.data;
    } catch (error: any) {
      console.error("❌ [DEBUG] Erro Crítico na Troca de Token:");
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("Mensagem:", error.message);
      }
      throw error;
    }

    
  }



 async getProductDetails(itemId: string): Promise<any> {
  // 1. Limpa o ID (remove espaços ou caracteres extras)
  const cleanId = itemId.trim().toUpperCase();

  try {
    console.log(`📡 [API] Solicitando dados oficiais para o item: ${cleanId}`);
    
    const response = await axios.get(`${this.baseUrl}/items/${cleanId}`, {
      httpsAgent: this.httpsAgent,
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0'
      }
    });

    console.log("✅ [API] Dados recebidos com sucesso!");
    return response.data;

  } catch (error: any) {
    if (error.response?.status === 404) {
      console.error(`❌ [API] O produto ${cleanId} não foi encontrado. Verifique se o ID está correto.`);
    } else {
      console.error(`❌ [API] Erro inesperado: ${error.response?.status} - ${error.message}`);
    }
    throw error;
  }
}
}