import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// PUT /api/profile - Update current user's profile
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { bio, skills, extracurriculars, profilePicture } = req.body;

        const profile = await prisma.profile.findFirst({
            where: { userId: req.userId }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const updatedProfile = await prisma.profile.update({
            where: { id: profile.id },
            data: {
                bio: bio !== undefined ? bio : profile.bio,
                skills: skills !== undefined ? JSON.stringify(skills) : profile.skills,
                extracurriculars: extracurriculars !== undefined ? JSON.stringify(extracurriculars) : profile.extracurriculars,
                profilePicture: profilePicture !== undefined ? profilePicture : profile.profilePicture
            }
        });

        res.json({
            ...updatedProfile,
            skills: JSON.parse(updatedProfile.skills || '[]'),
            extracurriculars: JSON.parse(updatedProfile.extracurriculars || '[]')
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// GET /api/profile - Get current user's profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { profile: true }
        });

        if (!user || !user.profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            ...user.profile,
            skills: JSON.parse(user.profile.skills || '[]'),
            extracurriculars: JSON.parse(user.profile.extracurriculars || '[]'),
            studentId: user.studentId
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

export default router;
