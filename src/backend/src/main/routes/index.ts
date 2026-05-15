// src/main/routes/index.ts
import { Router } from 'express';
import { AuthController } from '../../interfaces/controllers/AuthController.js';

const router = Router();
const authController = new AuthController();

router.get('/auth/login', (req, res) => authController.login(req, res));
router.get('/auth/callback', (req, res) => authController.callback(req, res));

export { router };