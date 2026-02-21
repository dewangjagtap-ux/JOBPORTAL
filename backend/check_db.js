import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';
import User from './models/User.js';
import Application from './models/Application.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-job-portal');
        console.log('--- Database Status ---');
        const users = await User.find({ role: 'company' });
        console.log('--- Logo report ---');
        users.forEach(u => {
            console.log(`User: ${u.name}`);
            console.log(`Logo field: "${u.companyDetails?.logo}" (type: ${typeof u.companyDetails?.logo})`);
            console.log(`Has companyDetails: ${!!u.companyDetails}`);
        });
        console.log('Jobs:', await Job.countDocuments());
        console.log('Applications:', await Application.countDocuments());
        console.log('-----------------------');
        process.exit();
    } catch (error) {
        console.error('Error connecting to DB:', error);
        process.exit(1);
    }
};

checkDB();
