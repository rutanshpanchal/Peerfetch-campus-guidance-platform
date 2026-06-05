import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/students - Get all students with optional filters
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { branch, year, extracurriculars } = req.query;

        const where = {};

        if (branch) {
            where.branch = branch;
        }

        if (year) {
            where.year = parseInt(year);
        }

        let profiles = await prisma.profile.findMany({
            where,
            include: {
                user: {
                    select: {
                        studentId: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Filter by extracurriculars if provided
        if (extracurriculars) {
            const extrasArray = extracurriculars.split(',');
            profiles = profiles.filter(profile => {
                const profileExtras = JSON.parse(profile.extracurriculars || '[]');
                return extrasArray.some(extra => profileExtras.includes(extra));
            });
        }

        // Parse JSON fields
        profiles = profiles.map(profile => ({
            ...profile,
            skills: JSON.parse(profile.skills || '[]'),
            extracurriculars: JSON.parse(profile.extracurriculars || '[]'),
            studentId: profile.user.studentId
        }));

        res.json(profiles);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// GET /api/students/search - Search students by name
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json([]);
        }

        let profiles = await prisma.profile.findMany({
            where: {
                name: {
                    contains: q,
                    mode: 'insensitive'
                }
            },
            include: {
                user: {
                    select: {
                        studentId: true
                    }
                }
            },
            take: 20,
            orderBy: {
                name: 'asc'
            }
        });

        // Parse JSON fields
        profiles = profiles.map(profile => ({
            ...profile,
            skills: JSON.parse(profile.skills || '[]'),
            extracurriculars: JSON.parse(profile.extracurriculars || '[]'),
            studentId: profile.user.studentId
        }));

        res.json(profiles);
    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({ error: 'Failed to search students' });
    }
});

// GET /api/students/:studentId - Get specific student profile
router.get('/:studentId', authMiddleware, async (req, res) => {
    try {
        const { studentId } = req.params;

        const user = await prisma.user.findUnique({
            where: { studentId },
            include: { profile: true }
        });

        if (!user || !user.profile) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const profile = {
            ...user.profile,
            skills: JSON.parse(user.profile.skills || '[]'),
            extracurriculars: JSON.parse(user.profile.extracurriculars || '[]'),
            studentId: user.studentId
        };

        res.json(profile);
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

export default router;
