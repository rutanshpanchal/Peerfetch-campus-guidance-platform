import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { studentId: 'ADMIN001' }
        });

        if (existingAdmin) {
            return NextResponse.json({
                message: 'Database already initialized!',
                admin: 'ADMIN001 already exists'
            });
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await prisma.user.create({
            data: {
                studentId: 'ADMIN001',
                password: hashedPassword,
                name: 'Admin User',
                email: 'admin@peerfetch.com',
                branch: 'CP',
                year: 4,
                batch: 2024,
                isAdmin: true,
                isApproved: true,
            }
        });

        // Create a few sample students
        for (let i = 1; i <= 5; i++) {
            const studentId = `25EL${String(i).padStart(3, '0')}`;
            await prisma.user.create({
                data: {
                    studentId,
                    password: await bcrypt.hash('password123', 10),
                    name: `Student ${i}`,
                    email: `student${i}@college.edu`,
                    branch: 'EL',
                    year: 2,
                    batch: 2025,
                    isAdmin: false,
                    isApproved: true,
                    bio: `Hi, I'm a second year Electronics student interested in learning and networking!`,
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully!',
            credentials: {
                admin: {
                    studentId: 'ADMIN001',
                    password: 'admin123'
                },
                student: {
                    studentId: '25EL001',
                    password: 'password123'
                }
            }
        });

    } catch (error: any) {
        console.error('Setup error:', error);
        return NextResponse.json({
            error: 'Setup failed',
            details: error.message,
            hint: 'Make sure DATABASE_URL is set in Vercel environment variables'
        }, { status: 500 });
    }
}
