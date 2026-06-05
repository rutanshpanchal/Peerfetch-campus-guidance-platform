import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { bio, skills, extracurriculars, linkedinUrl } = await request.json();

        await prisma.user.update({
            where: { id: session.id },
            data: {
                bio: bio || null,
                skills: skills && skills.length > 0 ? JSON.stringify(skills) : null,
                extracurriculars: extracurriculars && extracurriculars.length > 0 ? JSON.stringify(extracurriculars) : null,
                linkedinUrl: linkedinUrl || null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
