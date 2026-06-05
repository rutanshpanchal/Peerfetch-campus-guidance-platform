import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();

        if (!session || !session.isApproved) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const student = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                studentId: true,
                name: true,
                email: true,
                branch: true,
                year: true,
                batch: true,
                profilePicture: true,
                bio: true,
                skills: true,
                extracurriculars: true,
                linkedinUrl: true,
            },
        });

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ student });
    } catch (error) {
        console.error('Error fetching student:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
