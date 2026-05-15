import { Request, Response } from 'express';
import { MeliApiService } from '../../infrastructure/api/MeliApiService.js';

export class AuthController {
  private meliApi = new MeliApiService();

  async login(req: Request, res: Response) {
    const clientId = process.env.MELI_CLIENT_ID;
    const redirectUri = process.env.VITE_MELI_REDIRECT_URI;
    
    // É sempre bom logar se as variáveis essenciais existem
    if (!clientId || !redirectUri) {
      console.error("❌ Erro: MELI_CLIENT_ID ou REDIRECT_URI não configurados no Render.");
    }

    const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
  }

  async callback(req: Request, res: Response) {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Code missing' });

    try {
      console.log("📡 [AUTH] Trocando código por token...");
      const tokenData = await this.meliApi.exchangeCodeForToken(code as string);
      
      // SALVAMENTO TEMPORÁRIO: Injetamos no process.env para o Service enxergar IMEDIATAMENTE
      // Isso resolve o erro "Token usado: undefined" na mesma sessão
      process.env.ACCESS_TOKEN = tokenData.access_token;
      
      console.log("✅ [AUTH] Token obtido e injetado na memória!");
      console.log(`👤 User ID: ${tokenData.user_id}`);

      res.json({
        status: "success",
        message: "Autenticado com sucesso! O servidor agora possui o token na memória.",
        expires_in: tokenData.expires_in
      });
      
    } catch (error: any) {
      console.error("❌ [AUTH] Erro no callback:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
}