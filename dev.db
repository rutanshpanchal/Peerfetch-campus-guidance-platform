import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Check if tables exist by trying to count users
        let tablesExist = false;
        try {
            await prisma.user.count();
            tablesExist = true;
        } catch (e) {
            tablesExist = false;
        }

        if (!tablesExist) {
            return NextResponse.json({
                error: 'Database tables not created',
                solution: 'You need to run Prisma migrations manually',
                instructions: [
                    '1. Install Vercel CLI: npm i -g vercel',
                    '2. Link project: vercel link',
                    '3. Pull environment: vercel env pull',
                    '4. Run migration: npx prisma db push',
                    '5. Run this endpoint again'
                ]
            }, { status: 500 });
        }

        // Check if admin exists
        const existingAdmin = await prisma.user.findUnique({
            where: { studentId: 'ADMIN001' }
        });

        if (existingAdmin) {
            return NextResponse.json({
                message: 'Database already seeded!',
                admin: 'ADMIN001 already exists',
                loginUrl: 'https://peer-fetch-r131.vercel.app',
                credentials: {
                    studentId: 'ADMIN001',
                    password: 'admin123'
                }
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

        // Create sample students
        const students = [];
        for (let i = 1; i <= 10; i++) {
            const studentId = `25EL${String(i).padStart(3, '0')}`;
            students.push({
                studentId,
                password: await bcrypt.hash('password123', 10),
                name: `Student ${i}`,
                email: `student${i}@college.edu`,
                branch: 'EL',
                year: 2,
                batch: 2025,
                isAdmin: false,
                isApproved: true,
                bio: `Hi, I'm a second year Electronics student!`,
            });
        }

        await prisma.user.createMany({
            data: students
        });

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully!',
            created: {
                admin: 1,
                students: 10
            },
            credentials: {
                admin: {
                    studentId: 'ADMIN001',
                    password: 'admin123'
                },
                student: {
                    studentId: '25EL001',
                    password: 'password123'
                }
            },
            loginUrl: 'https://peer-fetch-r131.vercel.app'
        });

    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({
            error: 'Seeding failed',
            details: error.message,
        }, { status: 500 });
    }
}
