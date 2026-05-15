import { Request, Response } from 'express';
import { env } from '../../main/config/env.js';
import { MeliApiService } from '../../infrastructure/api/MeliApiService.js';
import { JsonTokenRepository } from '../../infrastructure/storage/JsonTokenRepository.js';

export class AuthController {
  private meliApi = new MeliApiService();
  private tokenRepo = new JsonTokenRepository();

  async login(req: Request, res: Response) {
    const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${env.meli.clientId}&redirect_uri=${env.meli.redirectUri}`;
    res.redirect(authUrl);
  }

  async callback(req: Request, res: Response) {
    const { code } = req.query;
    
    if (!code) return res.status(400).json({ error: 'Code missing' });

    try {
      console.log("🔄 Trocando código por access_token...");
      
      // Chama o método que criamos anteriormente no MeliApiService
      const tokenData = await this.meliApi.exchangeCodeForToken(code as string);

      if (tokenData.error) {
        return res.status(400).json({ error: tokenData.message });
      }

      // Salva no arquivo token.json
      await this.tokenRepo.save(tokenData);

      res.json({
        status: "success",
        message: "Autenticado com sucesso! O arquivo token.json foi criado.",
        user_id: tokenData.user_id
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}