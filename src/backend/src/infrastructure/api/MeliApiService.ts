import axios from 'axios';
import https from 'node:https';

export class MeliApiService {
  // Conforme sua pesquisa: Forçando o endpoint que aponta para a infraestrutura brasileira
  private readonly baseUrl = 'https://api.mercadolivre.com.br'; 

  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false 
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Conectando ao endpoint BR: ${this.baseUrl}/sites/MLB`);
      
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
      console.error(`❌ [DEBUG] Falha no endpoint .com.br: ${error.message}`);
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      console.log("📡 [DEBUG] Trocando token usando endpoint .com.br");
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
      console.error("❌ Erro na troca de token:", error.message);
      throw error;
    }
  }
}