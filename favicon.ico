import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Student ID validation regex: 24-27 (batch) + branch code + 001-999
const STUDENT_ID_REGEX = /^(24|25|26|27)(EL|CP|EC|EE|ME|CE|PE|IT)\d{3}$/;

// Branch code to name mapping
const BRANCH_NAMES = {
    'CP': 'Computer',
    'EL': 'Electronics',
    'EC': 'Electronics and Communication',
    'EE': 'Electrical',
    'ME': 'Mechanical',
    'CE': 'Civil',
    'PE': 'Production',
    'IT': 'IT'
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { studentId, password, name, branchVariant } = req.body;

        // Validate student ID format
        if (!STUDENT_ID_REGEX.test(studentId)) {
            return res.status(400).json({
                error: 'Invalid student ID format. Expected format: 25EL011'
            });
        }

        // Check if student ID already exists
        const existingUser = await prisma.user.findUnique({
            where: { studentId }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Student ID already registered' });
        }

        // Extract batch, branch, and calculate year
        const batch = studentId.substring(0, 2);
        const branchCode = studentId.substring(2, 4);
        const currentYear = new Date().getFullYear();
        const batchYear = 2000 + parseInt(batch);
        const year = currentYear - batchYear + 1;

        // Determine full branch name (with SFI/GIA variant if applicable)
        let branchName = BRANCH_NAMES[branchCode];
        if ((branchCode === 'CP' || branchCode === 'ME') && branchVariant) {
            branchName = `${branchName} ${branchVariant}`;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with profile
        const user = await prisma.user.create({
            data: {
                studentId,
                password: hashedPassword,
                profile: {
                    create: {
                        name,
                        batch,
                        branch: branchCode,
                        branchName,
                        year: Math.max(1, Math.min(4, year)),
                        skills: JSON.stringify([]),
                        extracurriculars: JSON.stringify([]),
                        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentId}`
                    }
                }
            },
            include: { profile: true }
        });

        res.status(201).json({
            message: 'Registration successful! You can now login.',
            studentId: user.studentId
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { studentId, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { studentId },
            include: { profile: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid student ID or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid student ID or password' });
        }

        const token = jwt.sign(
            { userId: user.id, studentId: user.studentId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                studentId: user.studentId,
                profile: user.profile
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { profile: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            studentId: user.studentId,
            profile: user.profile
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

export default router;
