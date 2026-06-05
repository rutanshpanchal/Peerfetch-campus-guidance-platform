import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!session.isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const users = await prisma.user.findMany({
            where: {
                isApproved: false,
                isAdmin: false,
            },
            select: {
                id: true,
                studentId: true,
                name: true,
                email: true,
                branch: true,
                year: true,
                batch: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching pending users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
