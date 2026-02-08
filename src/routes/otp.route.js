import { Router } from 'express';
import redis from "../service/redis.service.js"
import { testMail, verifyOtp } from '../controllers/user.controller.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Test Redis route
router.get('/', async (_, res) => {
  try {
    await redis.set('test', 'OK', { EX: 30 }); // 👈 FIXED
    const data = await redis.get('test');
    res.send(data);
  } catch (err) {
    console.error('Redis error:', err);
    res.status(500).send('Redis error');
  }
});

// routes
router.post('/send-mail', testMail);
router.post('/verify-otp', verifyOtp);

export default router;
