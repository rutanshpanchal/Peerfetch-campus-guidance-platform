import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const { studentId, password } = await request.json();

        if (!studentId || !password) {
            return NextResponse.json(
                { error: 'Student ID and password are required' },
                { status: 400 }
            );
        }

        const user = await authenticate(studentId, password);

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create session
        await createSession(user.id);

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
