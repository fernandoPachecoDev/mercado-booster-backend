import axios from 'axios';
import https from 'node:https';

export class MeliApiService {
  // URL oficial e correta (com 'i')
  private readonly baseUrl = 'https://api.mercadolibre.com';

  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    // O pulo do gato: Força IPv4. O Render falha ao tentar resolver IPv6 do ML.
    family: 4,
    // Caso o SSL ainda dê problema por causa do proxy do Render
    rejectUnauthorized: false 
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Tentando conexão direta IPv4: ${this.baseUrl}/sites/MLB`);
      
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 15000,
        httpsAgent: this.httpsAgent,
        headers: { 
          'User-Agent': 'MercadoBooster/1.0',
          'Accept': 'application/json'
        }
      });

      console.log("✅ [DEBUG] CONEXÃO ESTABELECIDA!");
      return response.status === 200;
    } catch (error: any) {
      console.error(`❌ [DEBUG] Falha na conexão: ${error.message}`);
      if (error.response) {
        console.error("Detalhes do erro do ML:", error.response.data);
      }
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      console.log("📡 [DEBUG] Iniciando troca de token...");
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/oauth/token`,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
      return response.data;
    } catch (error: any) {
      console.error("❌ [DEBUG] Erro na troca de token:", error.message);
      throw error;
    }
  }
}