import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        let company = await User.findOne({ email: 'softcrowd@gmail.com' });
        if (!company) {
            console.log('Company not found');
            return;
        }

        console.log('Current state:', JSON.stringify(company, null, 2));

        // Let's try to manually set companyDetails
        if (!company.companyDetails) company.companyDetails = {};
        company.companyDetails.logo = 'uploads/logo-test.png';
        company.companyDetails.companyName = 'SoftCrowd Technologies Pvt. Ltd.';

        company.markModified('companyDetails');
        await company.save();
        console.log('Saved successfully');

        // Fetch again to verify
        const updated = await User.findOne({ email: 'softcrowd@gmail.com' });
        console.log('Updated state:', JSON.stringify(updated.companyDetails, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

runTest();
