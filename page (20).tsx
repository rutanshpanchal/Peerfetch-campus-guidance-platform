import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// GET - List conversations or messages with a specific user
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
        const userId = searchParams.get('userId');

        if (userId) {
            // Get messages with specific user
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: session.id, receiverId: userId },
                        { senderId: userId, receiverId: session.id },
                    ],
                },
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                },
            });

            // Mark unread messages as read
            await prisma.message.updateMany({
                where: {
                    senderId: userId,
                    receiverId: session.id,
                    isRead: false,
                },
                data: { isRead: true },
            });

            return NextResponse.json({ messages });
        } else {
            // Get all conversations (list of users with latest message)
            const sentMessages = await prisma.message.findMany({
                where: { senderId: session.id },
                distinct: ['receiverId'],
                orderBy: { createdAt: 'desc' },
                include: {
                    receiver: {
                        select: {
                            id: true,
                            studentId: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                },
            });

            const receivedMessages = await prisma.message.findMany({
                where: { receiverId: session.id },
                distinct: ['senderId'],
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: {
                        select: {
                            id: true,
                            studentId: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                },
            });

            // Combine and get unique users
            const userMap = new Map();

            for (const msg of sentMessages) {
                if (!userMap.has(msg.receiverId)) {
                    const unreadCount = await prisma.message.count({
                        where: {
                            senderId: msg.receiverId,
                            receiverId: session.id,
                            isRead: false,
                        },
                    });

                    userMap.set(msg.receiverId, {
                        user: msg.receiver,
                        lastMessage: msg.content,
                        lastMessageTime: msg.createdAt,
                        unreadCount,
                    });
                }
            }

            for (const msg of receivedMessages) {
                if (!userMap.has(msg.senderId)) {
                    const unreadCount = await prisma.message.count({
                        where: {
                            senderId: msg.senderId,
                            receiverId: session.id,
                            isRead: false,
                        },
                    });

                    userMap.set(msg.senderId, {
                        user: msg.sender,
                        lastMessage: msg.content,
                        lastMessageTime: msg.createdAt,
                        unreadCount,
                    });
                }
            }

            const conversations = Array.from(userMap.values()).sort(
                (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
            );

            return NextResponse.json({ conversations });
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Send a message
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.isApproved) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { receiverId, content } = await request.json();

        if (!receiverId || !content) {
            return NextResponse.json(
                { error: 'Receiver ID and content are required' },
                { status: 400 }
            );
        }

        // Check if users are connected
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId: session.id, receiverId, status: 'accepted' },
                    { senderId: receiverId, receiverId: session.id, status: 'accepted' },
                ],
            },
        });

        if (!connection) {
            return NextResponse.json(
                { error: 'You can only message connected users' },
                { status: 403 }
            );
        }

        const message = await prisma.message.create({
            data: {
                senderId: session.id,
                receiverId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                    },
                },
            },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
