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
    console.log(`🌐 [DEBUG] Tentando furar o PolicyAgent do ML...`);
    
    const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
      timeout: 15000,
      httpsAgent: this.httpsAgent,
      headers: { 
        // 1. User-Agent de um navegador moderno é OBRIGATÓRIO agora
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        
        // 2. Aceitar formatos que navegadores aceitam
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        
        // 3. Simular uma requisição de navegação
        'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

    console.log("✅ [DEBUG] PORTA ABERTA! Conexão estabelecida.");
    return response.status === 200;
  } catch (error: any) {
    console.error(`❌ [DEBUG] Falha no PolicyAgent: ${error.message}`);
    if (error.response) {
      console.error("Payload de erro:", JSON.stringify(error.response.data, null, 2));
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