import axios from 'axios';

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolivre.com';

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Testando conexão com: ${this.baseUrl}/sites/MLB`);
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 15000,
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
    // Busca direto do process.env para não ter erro de referência
    const clientId = process.env.MELI_CLIENT_ID;
    const clientSecret = process.env.MELI_CLIENT_SECRET;
    const redirectUri = process.env.VITE_MELI_REDIRECT_URI;

    try {
      console.log("📡 [DEBUG] Iniciando POST para troca de token...");
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/oauth/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MercadoBooster/1.0'
        },
        data: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId || '',
          client_secret: clientSecret || '',
          code: code,
          redirect_uri: redirectUri || ''
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
      console.error("Status:", error.response.status);
      console.error("Dados:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Mensagem:", error.message);
    }
    console.error("-------------------------------------------\n");
  }
}