import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.isApproved) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const branch = searchParams.get('branch');
        const year = searchParams.get('year');
        const search = searchParams.get('search');

        const where: any = {
            isApproved: true,
        };

        if (branch) {
            // Handle both CP and CP-GIA, ME and ME-GIA
            if (branch === 'CP' || branch === 'CP-GIA') {
                where.branch = 'CP';
            } else if (branch === 'ME' || branch === 'ME-GIA') {
                where.branch = 'ME';
            } else {
                where.branch = branch;
            }
        }

        if (year) {
            where.year = parseInt(year);
        }

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        const students = await prisma.user.findMany({
            where,
            select: {
                id: true,
                studentId: true,
                name: true,
                year: true,
                branch: true,
                profilePicture: true,
                bio: true,
                skills: true,
                extracurriculars: true,
            },
            orderBy: [
                { year: 'desc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
