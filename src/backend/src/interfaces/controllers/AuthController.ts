import { Request, Response } from 'express';
import { MeliApiService } from '../../infrastructure/api/MeliApiService';
import { JsonTokenRepository } from '../../infrastructure/storage/JsonTokenRepository';
// Removido o import do env direto para evitar conflito de carregamento

export class AuthController {
  private meliApi = new MeliApiService();
  private tokenRepo = new JsonTokenRepository();

  async login(req: Request, res: Response) {
    const clientId = process.env.MELI_CLIENT_ID;
    const redirectUri = process.env.VITE_MELI_REDIRECT_URI;
    
    const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
  }

  async callback(req: Request, res: Response) {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Code missing' });

    try {
      const tokenData = await this.meliApi.exchangeCodeForToken(code as string);
      await this.tokenRepo.save(tokenData);
      res.json({
        status: "success",
        message: "Autenticado com sucesso!",
        user_id: tokenData.user_id
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}