import axios from 'axios';
import https from 'node:https';
import dns from 'node:dns';

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolivre.com';

  // Força o agente a resolver o DNS usando IPv4, o que costuma resolver o ENOTFOUND no Render
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    }
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Tentando conexão forçada com DNS IPv4...`);
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 15000,
        httpsAgent: this.httpsAgent,
        headers: { 
          'User-Agent': 'MercadoBooster/1.0',
          'Accept': 'application/json'
        }
      });
      console.log("✅ [DEBUG] Conexão bem-sucedida!");
      return true;
    } catch (error: any) {
      this.logDetailedError(error, "Teste de Conexão");
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      console.log("📡 [DEBUG] Iniciando POST para troca de token...");
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
      this.logDetailedError(error, "Troca de Token");
      throw error;
    }
  }

  // O MÉTODO QUE ESTAVA FALTANDO:
  private logDetailedError(error: any, context: string) {
    console.error(`\n--- 🚨 ERRO DETALHADO: ${context} ---`);
    
    if (error.response) {
      console.error("Status do Erro:", error.response.status);
      console.error("Dados da Resposta:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("Mensagem:", error.message);
      console.error("Código do Erro:", error.code);
      if (error.code === 'ENOTFOUND') {
        console.error("Causa: DNS do Render não resolveu api.mercadolivre.com");
      }
    } else {
      console.error("Erro desconhecido:", error.message);
    }
    console.error("-------------------------------------------\n");
  }
}