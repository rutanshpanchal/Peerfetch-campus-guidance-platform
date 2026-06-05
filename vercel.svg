import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Branch configurations
const branches = [
    { code: 'CP', name: 'Computer SFI', fullName: 'Computer SFI' },
    { code: 'CP', name: 'Computer GIA', fullName: 'Computer GIA' },
    { code: 'EL', name: 'Electronics', fullName: 'Electronics' },
    { code: 'EC', name: 'Electronics and Communication', fullName: 'Electronics and Communication' },
    { code: 'EE', name: 'Electrical', fullName: 'Electrical' },
    { code: 'ME', name: 'Mechanical SFI', fullName: 'Mechanical SFI' },
    { code: 'ME', name: 'Mechanical GIA', fullName: 'Mechanical GIA' },
    { code: 'CE', name: 'Civil', fullName: 'Civil' },
    { code: 'PE', name: 'Production', fullName: 'Production' },
    { code: 'IT', name: 'IT', fullName: 'IT' }
];

const extracurriculars = ['TRS', 'TSA', 'BAHA', 'IEEE', 'IEI'];

const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Vedant', 'Aadhya', 'Diya', 'Ananya', 'Aarohi', 'Pari',
    'Navya', 'Angel', 'Anika', 'Sara', 'Myra', 'Priya', 'Riya', 'Kavya', 'Kiara', 'Saanvi'
];

const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Iyer', 'Nair', 'Rao',
    'Desai', 'Kulkarni', 'Joshi', 'Agarwal', 'Mehta', 'Shah', 'Kapoor', 'Malhotra', 'Bhat', 'Menon'
];

const skills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'C++', 'Machine Learning', 'Data Science',
    'Web Development', 'Mobile Development', 'Cloud Computing', 'DevOps', 'UI/UX Design', 'SQL',
    'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'Agile', 'Problem Solving'
];

const bios = [
    'Passionate about technology and innovation. Always eager to learn new things.',
    'Engineering student with a keen interest in software development.',
    'Tech enthusiast exploring the realms of computer science.',
    'Aspiring engineer with strong problem-solving skills.',
    'Dedicated student focused on building impactful solutions.',
    'Love coding and creating innovative projects.',
    'Future engineer passionate about emerging technologies.',
    'Engineering student with diverse technical interests.',
];

function getRandomElements(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    console.log('🗑️  Cleared existing data');

    let studentCount = 0;
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Generate 50 students per branch per year
    let globalRollCounter = 1; // Global counter to ensure unique student IDs

    for (const branch of branches) {
        for (let year = 1; year <= 4; year++) {
            // Calculate batch year based on current year and student year
            const currentYear = new Date().getFullYear();
            const batchYear = currentYear - year + 1;
            const batch = batchYear.toString().slice(-2); // Get last 2 digits

            for (let i = 1; i <= 50; i++) {
                const rollNumber = String(globalRollCounter).padStart(3, '0');
                const studentId = `${batch}${branch.code}${rollNumber}`;

                const firstName = getRandomElement(firstNames);
                const lastName = getRandomElement(lastNames);
                const fullName = `${firstName} ${lastName}`;

                const randomSkills = getRandomElements(skills, 3 + Math.floor(Math.random() * 4));
                const randomExtras = getRandomElements(extracurriculars, 1 + Math.floor(Math.random() * 3));
                const bio = getRandomElement(bios);

                await prisma.user.create({
                    data: {
                        studentId,
                        password: hashedPassword,
                        profile: {
                            create: {
                                name: fullName,
                                batch,
                                branch: branch.code,
                                branchName: branch.fullName,
                                year,
                                bio,
                                skills: JSON.stringify(randomSkills),
                                extracurriculars: JSON.stringify(randomExtras),
                                profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentId}`
                            }
                        }
                    }
                });

                studentCount++;
                globalRollCounter++;

                // Reset counter if it exceeds 999
                if (globalRollCounter > 999) {
                    globalRollCounter = 1;
                }
            }
        }
    }

    console.log(`✅ Created ${studentCount} students`);
    console.log('🎉 Seed completed successfully!');
    console.log('\n📝 You can login with any student ID (e.g., 25EL001) using password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
