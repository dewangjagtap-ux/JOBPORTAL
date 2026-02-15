import User from '../models/User.js';

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private/Student
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.branch = req.body.branch || user.branch;
            user.year = req.body.year || user.year;
            user.college = req.body.college || user.college;
            user.cgpa = req.body.cgpa || user.cgpa;

            if (req.body.skills) {
                user.skills = Array.isArray(req.body.skills)
                    ? req.body.skills
                    : req.body.skills.split(',').map(s => s.trim());
            }

            user.about = req.body.about || user.about;
            user.linkedin = req.body.linkedin || user.linkedin;
            user.github = req.body.github || user.github;

            if (req.files) {
                if (req.files.resume) {
                    user.resume = req.files.resume[0].path;
                }
                if (req.files.photo) {
                    user.photo = req.files.photo[0].path;
                }
            }

            const updatedUser = await user.save();

            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private/Student
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { updateProfile, getProfile };
