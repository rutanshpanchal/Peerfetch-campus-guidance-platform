import { NextRequest, NextResponse } from 'next/server';
import { createUser, validateStudentId, parseStudentId } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { studentId, password, name, email } = await request.json();

        if (!studentId || !password || !name) {
            return NextResponse.json(
                { error: 'Student ID, password, and name are required' },
                { status: 400 }
            );
        }

        // Validate student ID format
        const validation = await validateStudentId(studentId);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Parse student ID to get branch and year
        const parsed = parseStudentId(studentId);
        if (!parsed) {
            return NextResponse.json(
                { error: 'Invalid student ID format' },
                { status: 400 }
            );
        }

        // Create user
        const user = await createUser({
            studentId,
            password,
            name,
            email: email || `${studentId.toLowerCase()}@college.edu`,
            branch: parsed.branch,
            year: parsed.year,
            batch: parsed.batch,
        });

        return NextResponse.json({
            success: true,
            user,
            message: 'Account created successfully. Please wait for admin approval.',
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
