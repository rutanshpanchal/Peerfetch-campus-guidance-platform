import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// GET - List user's connections
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.isApproved) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'accepted';

        // Get connections where user is either sender or receiver
        const sentConnections = await prisma.connection.findMany({
            where: {
                senderId: session.id,
                status,
            },
            include: {
                receiver: {
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
                    },
                },
            },
        });

        const receivedConnections = await prisma.connection.findMany({
            where: {
                receiverId: session.id,
                status,
            },
            include: {
                sender: {
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
                    },
                },
            },
        });

        // Combine and format connections
        const connections = [
            ...sentConnections.map((conn) => ({
                id: conn.id,
                user: conn.receiver,
                status: conn.status,
                createdAt: conn.createdAt,
                type: 'sent',
            })),
            ...receivedConnections.map((conn) => ({
                id: conn.id,
                user: conn.sender,
                status: conn.status,
                createdAt: conn.createdAt,
                type: 'received',
            })),
        ];

        return NextResponse.json({ connections });
    } catch (error) {
        console.error('Error fetching connections:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Send connection request
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.isApproved) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { receiverId } = await request.json();

        if (!receiverId) {
            return NextResponse.json(
                { error: 'Receiver ID is required' },
                { status: 400 }
            );
        }

        if (receiverId === session.id) {
            return NextResponse.json(
                { error: 'Cannot connect with yourself' },
                { status: 400 }
            );
        }

        // Check if connection already exists
        const existingConnection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId: session.id, receiverId },
                    { senderId: receiverId, receiverId: session.id },
                ],
            },
        });

        if (existingConnection) {
            return NextResponse.json(
                { error: 'Connection already exists' },
                { status: 400 }
            );
        }

        const connection = await prisma.connection.create({
            data: {
                senderId: session.id,
                receiverId,
                status: 'pending',
            },
        });

        return NextResponse.json({ connection });
    } catch (error) {
        console.error('Error creating connection:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Accept/reject connection
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.isApproved) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { connectionId, action } = await request.json();

        if (!connectionId || !action) {
            return NextResponse.json(
                { error: 'Connection ID and action are required' },
                { status: 400 }
            );
        }

        if (!['accept', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        // Verify user is the receiver of this connection
        const connection = await prisma.connection.findUnique({
            where: { id: connectionId },
        });

        if (!connection) {
            return NextResponse.json(
                { error: 'Connection not found' },
                { status: 404 }
            );
        }

        if (connection.receiverId !== session.id) {
            return NextResponse.json(
                { error: 'You can only respond to your own requests' },
                { status: 403 }
            );
        }

        const updatedConnection = await prisma.connection.update({
            where: { id: connectionId },
            data: { status: action === 'accept' ? 'accepted' : 'rejected' },
        });

        return NextResponse.json({ connection: updatedConnection });
    } catch (error) {
        console.error('Error updating connection:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Remove connection
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.isApproved) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const connectionId = searchParams.get('id');

        if (!connectionId) {
            return NextResponse.json(
                { error: 'Connection ID is required' },
                { status: 400 }
            );
        }

        const connection = await prisma.connection.findUnique({
            where: { id: connectionId },
        });

        if (!connection) {
            return NextResponse.json(
                { error: 'Connection not found' },
                { status: 404 }
            );
        }

        // Only allow deleting if user is either sender or receiver
        if (connection.senderId !== session.id && connection.receiverId !== session.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        await prisma.connection.delete({
            where: { id: connectionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting connection:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
