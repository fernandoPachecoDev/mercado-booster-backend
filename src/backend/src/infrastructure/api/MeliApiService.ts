import axios from 'axios';
import https from 'node:https';
import dns from 'node:dns';

// IP direto da API do ML que já testamos e respondeu
const ML_API_IP = '54.232.181.108'; 

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolivre.com';

  // O AGENTE SECRETO: Força o IP e ignora a rejeição de nome de host do certificado
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    checkServerIdentity: () => undefined, // Ignora o erro "IP does not match altnames"
    lookup: (hostname, options, callback) => {
      if (hostname === 'api.mercadolivre.com') {
        // @ts-ignore
        return callback(null, [{ address: ML_API_IP, family: 4 }]);
      }
      dns.lookup(hostname, options, callback);
    }
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [FORCE-IP] Tentando conexão direta via IP: ${ML_API_IP}`);
      
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 15000,
        httpsAgent: this.httpsAgent,
        headers: { 
          'User-Agent': 'MercadoBooster/1.0',
          'Host': 'api.mercadolivre.com' // Necessário para o servidor do ML
        }
      });

      console.log("✅ [DEBUG] CONEXÃO FINALMENTE ESTABELECIDA!");
      return true;
    } catch (error: any) {
      this.logDetailedError(error, "Teste de Conexão");
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      console.log("📡 [FORCE-IP] Trocando token via IP direto...");
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/oauth/token`,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Host': 'api.mercadolivre.com',
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
    console.error(`❌ [${context}] Erro:`, error.message);
    if (error.response) console.error("Dados:", error.response.data);
  }
}