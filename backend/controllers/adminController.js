import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalCompanies = await User.countDocuments({ role: 'company' });
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const recentJobs = await Job.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const recentStudents = await User.countDocuments({
            role: 'student',
            createdAt: { $gte: sevenDaysAgo }
        });

        // Mock placements count based on 'Accepted' applications
        const placements = await Application.countDocuments({ status: 'Accepted' });

        res.json({
            totalStudents,
            totalCompanies,
            totalJobs,
            totalApplications,
            recentJobs,
            recentStudents,
            placements
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
const updateAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const { name, phone, designation, department } = req.body;

            if (name !== undefined) user.name = name;

            if (!user.adminDetails) user.adminDetails = {};

            if (phone !== undefined) user.adminDetails.phone = phone;
            if (designation !== undefined) user.adminDetails.designation = designation;
            if (department !== undefined) user.adminDetails.department = department;

            if (req.body.removePhoto === 'true') {
                console.log('Removing admin photo');
                user.adminDetails.photo = '';
            } else if (req.file) {
                console.log('New admin photo uploaded:', req.file.path);
                user.adminDetails.photo = req.file.path;
            }

            user.markModified('adminDetails');
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getPlatformStats, getAllUsers, deleteUser, getAdminProfile, updateAdminProfile };
