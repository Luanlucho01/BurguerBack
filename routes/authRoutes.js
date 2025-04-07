import express from 'express';
import { getUserDetails, login, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/register-user', register)
router.post('/login-user', login)
router.get('/getUserData', getUserDetails)

export default router;