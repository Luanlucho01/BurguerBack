import express from 'express';
import { getUserFromToken, login, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/register-user', register)
router.post('/login-user', login)
router.get('/getUserData',getUserFromToken)

export default router;