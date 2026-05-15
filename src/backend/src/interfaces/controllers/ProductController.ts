import { Request, Response } from 'express';
import { MeliApiService } from '../../infrastructure/gateways/MeliApiService.js';

export class ProductController {
  private meliService = new MeliApiService();

  async getDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`🔍 Buscando detalhes do produto: ${id}`);
      
      const productData = await this.meliService.getProductDetails(id);
      
      return res.json({
        status: 'success',
        data: productData
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}