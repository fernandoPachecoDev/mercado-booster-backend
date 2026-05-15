import axios from 'axios';
import https from 'node:https';
import dns from 'node:dns';

// IP oficial da API do Mercado Livre (AWS South America)
const ML_API_IP = '54.232.181.108'; 

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolivre.com';

  // Configuração que intercepta a busca de DNS do Render
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    lookup: (hostname, options, callback) => {
      if (hostname === 'api.mercadolivre.com') {
        // Força o IP diretamente, ignorando o DNS do Render que está falhando
        // @ts-ignore
        return callback(null, [{ address: ML_API_IP, family: 4 }]);
      }
      dns.lookup(hostname, options, callback);
    }
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DNS-FIX] Ignorando DNS do Render e usando IP: ${ML_API_IP}`);
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 10000,
        httpsAgent: this.httpsAgent, // Usa o interceptor
        headers: { 
          'User-Agent': 'MercadoBooster/1.0',
          'Host': 'api.mercadolivre.com' // Importante para o servidor do ML saber quem você quer acessar
        }
      });
      return response.status === 200;
    } catch (error: any) {
      this.logDetailedError(error, "Teste de Conexão");
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/oauth/token`,
        httpsAgent: this.httpsAgent, // Também usa o interceptor aqui
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Host': 'api.mercadolivre.com'
        },
        data: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.MELI_CLIENT_ID || '',
          client_secret: process.env.MELI_CLIENT_SECRET || '',
          code: code,
          redirect_uri: process.env.VITE_MELI_REDIRECT_URI || ''
        }).toString()
      });
      return response.data;
    } catch (error: any) {
      this.logDetailedError(error, "Troca de Token");
      throw error;
    }
  }

  private logDetailedError(error: any, context: string) {
    console.error(`❌ [${context}] Erro:`, error.message);
  }
}