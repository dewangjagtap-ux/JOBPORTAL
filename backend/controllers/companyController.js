import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private/Admin
const getCompanies = async (req, res) => {
    const companies = await User.find({ role: 'company' }).select('-password');
    res.json(companies);
};

// @desc    Approve a company
// @route   PATCH /api/companies/:id/approve
// @access  Private/Admin
const approveCompany = async (req, res) => {
    try {
        console.log(`Approving company with ID: ${req.params.id}`);
        const user = await User.findById(req.params.id);

        if (!user) {
            console.log('User not found for approval');
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'company') {
            console.log(`User role is ${user.role}, not company`);
            return res.status(400).json({ message: 'User is not a company' });
        }

        user.isApproved = true;
        await user.save();
        console.log(`Successfully approved company: ${user.name}`);

        res.json({ message: 'Company approved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get stats for a company
// @route   GET /api/companies/stats
// @access  Private/Company
const getCompanyStats = async (req, res) => {
    try {
        const companyId = req.user._id;
        const totalJobs = await Job.countDocuments({ company: companyId });

        // Find all jobs by this company to count applicants
        const companyJobs = await Job.find({ company: companyId }).select('_id');
        const jobIds = companyJobs.map(j => j._id);

        const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newApplications = await Application.countDocuments({
            job: { $in: jobIds },
            createdAt: { $gte: sevenDaysAgo }
        });

        res.json({
            totalJobs,
            totalApplicants,
            newApplications
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get company profile
// @route   GET /api/companies/profile
// @access  Private/Company
const getCompanyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Company not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update company profile
// @route   PUT /api/companies/profile
// @access  Private/Company
const updateCompanyProfile = async (req, res) => {
    try {
        console.log('Update Request Body:', req.body);
        console.log('Update Request File:', req.file);
        const user = await User.findById(req.user._id);

        if (user) {
            console.log('User found before update:', user.name);
            console.log('Current companyDetails:', JSON.stringify(user.companyDetails, null, 2));
            const { name, hrName, phone, website, description, address } = req.body;

            // Root level fields
            if (name !== undefined) user.name = name;
            if (phone !== undefined) user.phone = phone;

            if (!user.companyDetails) {
                console.log('Initializing empty companyDetails');
                user.companyDetails = {};
            }

            // Nested fields
            if (name !== undefined) user.companyDetails.companyName = name;
            if (hrName !== undefined) user.companyDetails.hrName = hrName;
            if (website !== undefined) user.companyDetails.website = website;
            if (description !== undefined) user.companyDetails.description = description;
            if (address !== undefined) user.companyDetails.address = address;

            if (req.file) {
                console.log('Saving new logo path:', req.file.path);
                user.companyDetails.logo = req.file.path;
            } else {
                console.log('No new logo file in request');
            }

            // Explicitly mark companyDetails as modified for Mongoose tracking
            user.markModified('companyDetails');

            console.log('CompanyDetails object before save:', JSON.stringify(user.companyDetails, null, 2));
            console.log('Saving updated user details...');
            const updatedUser = await user.save();
            console.log('User saved successfully. New logo in DB:', updatedUser.companyDetails?.logo);

            res.json(updatedUser);
        } else {
            console.log('User not found with ID:', req.user._id);
            res.status(404).json({ message: 'Company not found' });
        }
    } catch (error) {
        console.error('Update Profile Error Details:', error);
        res.status(500).json({ message: error.message || 'Error saving user profile' });
    }
};

export { getCompanies, approveCompany, getCompanyStats, getCompanyProfile, updateCompanyProfile };
