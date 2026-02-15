import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const promoteToAdmin = async () => {
    try {
        await connectDB();

        const emails = [
            'lalitpatil@gmail.com',
            'indrajitsonawane@gmail.com',
            'bhalerao@gmail.com'
        ];

        for (const email of emails) {
            const user = await User.findOne({ email });
            if (user) {
                user.role = 'admin';
                user.isApproved = true;
                await user.save();
                console.log(`User ${email} promoted to admin.`);
            } else {
                console.log(`User ${email} not found. They can now register as admin using the new UI option.`);
            }
        }

        console.log('Promotion script completed.');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

promoteToAdmin();
