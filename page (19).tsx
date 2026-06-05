import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.isApproved) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { mentorId, message } = await request.json();

        if (!mentorId) {
            return NextResponse.json(
                { error: 'Mentor ID is required' },
                { status: 400 }
            );
        }

        // Check if request already exists
        const existing = await prisma.mentorshipRequest.findUnique({
            where: {
                mentorId_menteeId: {
                    mentorId,
                    menteeId: session.id,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Request already sent' },
                { status: 400 }
            );
        }

        const mentorshipRequest = await prisma.mentorshipRequest.create({
            data: {
                mentorId,
                menteeId: session.id,
                message: message || 'Hi! I would like to connect with you for mentorship.',
                status: 'pending',
            },
        });

        return NextResponse.json({ success: true, request: mentorshipRequest });
    } catch (error) {
        console.error('Error creating mentorship request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
