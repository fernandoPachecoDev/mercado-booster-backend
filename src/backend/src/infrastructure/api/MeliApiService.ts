import axios from 'axios';
import https from 'node:https';
import dns from 'node:dns';

// IP oficial que responde pela infraestrutura global do ML
const ML_API_IP = '54.232.181.108'; 

export class MeliApiService {
  // AJUSTADO: Agora usando a URL oficial global sem erros de digitação
  private readonly baseUrl = 'https://api.mercadolibre.com';

  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    checkServerIdentity: () => undefined, 
    lookup: (hostname, options, callback) => {
      // Mapeia o nome correto para o IP que fura o bloqueio do Render
      if (hostname === 'api.mercadolibre.com') {
        console.log(`🎯 [DNS-BYPASS] Direcionando ${hostname} para ${ML_API_IP}`);
        // @ts-ignore
        return callback(null, [{ address: ML_API_IP, family: 4 }]);
      }
      dns.lookup(hostname, options, callback);
    }
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [FORCE-IP] Conectando a: ${this.baseUrl}/sites/MLB`);
      
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 15000,
        httpsAgent: this.httpsAgent,
        headers: { 
          'User-Agent': 'MercadoBooster/1.0',
          'Accept': 'application/json',
          'Host': 'api.mercadolibre.com' // Host deve ser IGUAL à baseUrl
        }
      });

      console.log("✅ [DEBUG] CONEXÃO ESTABELECIDA COM SUCESSO!");
      return response.status === 200;
    } catch (error: any) {
      console.error(`❌ [DEBUG] Erro final: ${error.message}`);
      if (error.response) console.error("Detalhes do erro do ML:", error.response.data);
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/oauth/token`,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Host': 'api.mercadolibre.com',
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