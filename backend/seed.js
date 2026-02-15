import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Application.deleteMany();
        await Job.deleteMany();
        await User.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const userHashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin',
            },
            {
                name: 'John Student',
                email: 'student@gmail.com',
                password: userHashedPassword,
                role: 'student',
            },
            {
                name: 'Acme Corp HR',
                email: 'company@gmail.com',
                password: userHashedPassword,
                role: 'company',
                companyDetails: {
                    companyName: 'Acme Corp',
                    description: 'We make everything.',
                    website: 'https://acme.com',
                    hrName: 'Jane Smith'
                },
                isApproved: true,
            },
        ];

        const createdUsers = await User.insertMany(users);
        const companyUser = createdUsers[2];

        const jobs = [
            {
                title: 'Frontend Developer',
                company: companyUser._id,
                companyName: companyUser.companyDetails.companyName,
                location: 'Remote',
                salary: '8-12 LPA',
                jobType: 'Full-time',
                description: 'We are looking for a React developer.',
                skills: ['React', 'JavaScript', 'CSS'],
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Backend Developer',
                company: companyUser._id,
                companyName: companyUser.companyDetails.companyName,
                location: 'New York',
                salary: '10-15 LPA',
                jobType: 'Full-time',
                description: 'Node.js and MongoDB expert needed.',
                skills: ['Node.js', 'MongoDB', 'Express'],
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            },
        ];

        await Job.insertMany(jobs);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Application.deleteMany();
        await Job.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
