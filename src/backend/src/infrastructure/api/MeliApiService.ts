import axios from 'axios';
import https from 'node:https';

export class MeliApiService {
  private readonly baseUrl = 'https://api.mercadolibre.com';

  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    family: 4 // Mantém IPv4 para evitar ENOTFOUND
  });

  // Vamos mudar o teste para um endpoint que as políticas costumam liberar mais fácil
  async testConnection(): Promise<boolean> {
    try {
      console.log(`🌐 [DEBUG] Tentando teste de rota simples...`);
      const response = await axios.get(`${this.baseUrl}/currencies/BRL`, {
        timeout: 10000,
        httpsAgent: this.httpsAgent,
        headers: { 
          'User-Agent': 'MercadoBooster/1.0'
        }
      });
      return response.status === 200;
    } catch (error: any) {
      console.error(`❌ [DEBUG] Teste falhou (comum em endpoints públicos): ${error.message}`);
      return false;
    }
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      console.log("📡 [DEBUG] Iniciando troca de token oficial...");
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/oauth/token`,
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
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
      
      console.log("✅ [DEBUG] TOKEN OBTIDO COM SUCESSO!");
      return response.data;
    } catch (error: any) {
      console.error("❌ [DEBUG] Erro Crítico na Troca de Token:");
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("Mensagem:", error.message);
      }
      throw error;
    }

    
  }



async getProductDetails(itemId: string): Promise<any> {
  const cleanId = itemId.trim().toUpperCase();

  try {
    console.log(`📡 [API] Ignorando rota bloqueada. Usando busca pública para: ${cleanId}`);
    
    // O endpoint de busca é muito mais "liberal" que o de itens direto
    const response = await axios.get(`${this.baseUrl}/sites/MLB/search`, {
      params: { q: cleanId },
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0'
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      console.log("✅ [API] Produto encontrado via Busca Pública!");
      // O Search retorna um objeto um pouco diferente, mas contém preço, título, etc.
      return response.data.results[0]; 
    }

    throw new Error("Produto não encontrado na busca pública.");

  } catch (error: any) {
    console.error(`❌ [API] Falha crítica na busca: ${error.response?.status || error.message}`);
    
    // Se até a busca der 403, o IP do Render está totalmente banido.
    if (error.response?.status === 403) {
      return { 
        error: "IP_BLOCKED", 
        message: "O Mercado Livre bloqueou o servidor do Render. Precisamos de um Proxy ou mudar de região." 
      };
    }
    throw error;
  }
}
}