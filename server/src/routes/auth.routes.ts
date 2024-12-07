import { Router, Request, Response } from 'express';
import authController from '../controllers/auth.controller.js';
import { verifyToken } from '../utils/jwt.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Login route
router.post('/login', (req: Request, res: Response) => authController.login(req, res));

// Register route
router.post('/register', (req: Request, res: Response) => authController.register(req, res));

// Get authenticated user info
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token not provided' });
        }

        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
});

export default router;