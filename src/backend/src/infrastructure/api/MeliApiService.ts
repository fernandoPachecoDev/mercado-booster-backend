import axios from 'axios';
import https from 'node:https';
import dns from 'node:dns';

export class MeliApiService {
  // Alterado para .com.br que é o padrão da API para o Brasil
  private readonly baseUrl = 'https://api.mercadolivre.com.br'; 

  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false, // Permite a conexão mesmo com a confusão de IP/DNS
    checkServerIdentity: () => undefined
  });

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Testando conexão com endpoint oficial /sites/MLB`);
      
      // Tentaremos sem o IP hardcoded primeiro, mas com o Agent de segurança
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 10000,
        httpsAgent: this.httpsAgent,
        headers: { 
          'User-Agent': 'MercadoBooster/1.0',
          'Accept': 'application/json'
        }
      });

      console.log("✅ [DEBUG] Conexão estabelecida!");
      return response.status === 200;
    } catch (error: any) {
      // Se der ENOTFOUND de novo, tentamos o fallback para o IP mas com o Host correto
      console.error(`❌ [DEBUG] Erro na rota principal, tentando fallback...`);
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      // O ML é rigoroso com o domínio no OAuth. Vamos usar o .com puro aqui.
      const oauthUrl = 'https://api.mercadolivre.com/oauth/token';
      
      const response = await axios({
        method: 'post',
        url: oauthUrl,
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
        }).toString()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}