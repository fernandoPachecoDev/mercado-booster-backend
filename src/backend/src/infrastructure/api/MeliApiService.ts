import axios from 'axios';
import https from 'node:https';
import dns from 'node:dns';

// IP fixo para api.mercadolivre.com.br (AWS São Paulo)
// Esse IP é o "endereço físico" que pula o problema do DNS
const ML_BR_IP = '54.232.181.108'; 

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolivre.com.br';

  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    // ESSENCIAL: Ignora o erro de "Hostname mismatch" porque estamos usando IP
    checkServerIdentity: () => undefined, 
    lookup: (hostname, options, callback) => {
      if (hostname === 'api.mercadolivre.com.br' || hostname === 'api.mercadolivre.com') {
        console.log(`🎯 [DNS-BYPASS] Direcionando ${hostname} para ${ML_BR_IP}`);
        // @ts-ignore
        return callback(null, [{ address: ML_BR_IP, family: 4 }]);
      }
      dns.lookup(hostname, options, callback);
    }
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [FORCE-IP] Tentando conexão direta ao Brasil via IP: ${ML_BR_IP}`);
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 15000,
        httpsAgent: this.httpsAgent,
        headers: { 
          'User-Agent': 'MercadoBooster/1.0',
          'Host': 'api.mercadolivre.com.br' // O ML exige o Host correto no cabeçalho
        }
      });
      console.log("✅ [DEBUG] CONEXÃO ESTABELECIDA VIA IP!");
      return response.status === 200;
    } catch (error: any) {
      console.error(`❌ [DEBUG] Erro no IP fixo: ${error.message}`);
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
          'Host': 'api.mercadolivre.com.br',
          'User-Agent': 'MercadoBooster/1.0'
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
      console.error("❌ Erro na troca de token:", error.message);
      throw error;
    }
  }
}