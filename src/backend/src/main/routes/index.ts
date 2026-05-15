// src/main/routes/index.ts
import { Router } from 'express';
import { AuthController } from '../../interfaces/controllers/AuthController.js';
// Supondo que você criou o ProductController seguindo o padrão
import { ProductController } from '../../interfaces/controllers/ProductController.js'; 

const router = Router();
const authController = new AuthController();
const productController = new ProductController(); // Instancie o controller

// Rotas de Autenticação
router.get('/auth/login', (req, res) => authController.login(req, res));
router.get('/auth/callback', (req, res) => authController.callback(req, res));

// Rota de Produtos (O que estava faltando!)
router.get('/product/:id', (req, res) => productController.getDetails(req, res));

export { router };