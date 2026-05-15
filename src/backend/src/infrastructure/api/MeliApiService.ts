import axios from 'axios';

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolivre.com';

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Testando conexão com: ${this.baseUrl}/sites/MLB`);
      const response = await axios.get(`${this.baseUrl}/sites/MLB`, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
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

  // MÉTODO AUXILIAR PARA LOG DETALHADO
  private logDetailedError(error: any, context: string) {
    console.error(`\n--- 🚨 ERRO DETALHADO: ${context} ---`);
    
    if (error.response) {
      // O servidor respondeu, mas com erro (ex: 400, 401, 500)
      console.error("Status do Erro:", error.response.status);
      console.error("Dados da Resposta:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // A requisição foi feita, mas não houve resposta (Timeout/Rede)
      console.error("Mensagem:", error.message);
      console.error("Código do Erro:", error.code);
      console.error("IP/Host Tentado:", error.config?.url);
      
      // Verifica se o erro é de DNS ou Conexão
      if (error.code === 'ENOTFOUND') console.error("Causa: DNS não conseguiu resolver o endereço.");
      if (error.code === 'ECONNREFUSED') console.error("Causa: A conexão foi rejeitada pelo servidor ou firewall.");
      if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        console.error("Causa: Timeout. O pacote de dados 'sumiu' na rede.");
      }
    } else {
      console.error("Erro desconhecido:", error.message);
    }
    console.error("-------------------------------------------\n");
  }
}