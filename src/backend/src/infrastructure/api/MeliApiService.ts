import axios from 'axios';
import https from 'node:https';
import dns from 'node:dns';

// Configuração para forçar o uso dos servidores de DNS do Google (8.8.8.8)
// Isso resolve o erro ENOTFOUND sem causar erro de Certificado SSL (o que o IP fixo causava)
dns.setServers(['8.8.8.8', '8.8.4.4']);

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolivre.com';

  // O Agent agora apenas força o uso de IPv4, que é mais estável no Render
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    family: 4 
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Tentando conectar ao ML usando DNS do Google...`);
      
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

  private logDetailedError(error: any, context: string) {
    console.error(`\n--- 🚨 ERRO DETALHADO: ${context} ---`);
    
    if (error.response) {
      console.error("Status do Erro:", error.response.status);
      console.error("Dados da Resposta:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("Mensagem:", error.message);
      console.error("Código:", error.code);
      if (error.code === 'ENOTFOUND') {
        console.error("Causa: DNS do Render continua falhando mesmo com DNS do Google.");
      }
    } else {
      console.error("Erro desconhecido:", error.message);
    }
    console.error("-------------------------------------------\n");
  }
}