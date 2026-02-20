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

            if (req.body.skills !== undefined) {
                if (Array.isArray(req.body.skills)) {
                    user.skills = req.body.skills;
                } else if (typeof req.body.skills === 'string') {
                    user.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
                }
            }

            user.about = req.body.about || user.about;
            user.linkedin = req.body.linkedin || user.linkedin;
            user.github = req.body.github || user.github;

            if (req.files) {
                if (req.files.resume) {
                    console.log('New resume uploaded:', req.files.resume[0].path);
                    user.resume = req.files.resume[0].path;
                }
                if (req.files.photo) {
                    console.log('New photo uploaded:', req.files.photo[0].path);
                    user.photo = req.files.photo[0].path;
                }
            }

            console.log('Saving updated student...');
            const updatedUser = await user.save();
            console.log('Student saved successfully');

            res.json(updatedUser);
        } else {
            console.log('Student not found');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Student Profile Error:', error);
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
