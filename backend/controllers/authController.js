import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail } from '../utils/emailService.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {

            // Check if company is approved
            if (user.role === 'company' && !user.isApproved) {
                return res.status(401).json({ message: 'Company account is pending approval.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                resume: user.resume,
                companyDetails: user.companyDetails,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, companyName, description, website, phone } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            phone,
            companyDetails: role === 'company' ? {
                companyName,
                description,
                website,
                hrName: name // assuming registrant name as HR name initially
            } : undefined,
            isApproved: role === 'company' ? false : true, // Companies need approval
        });

        if (user) {
            // Send welcome email
            const subject = 'Welcome to Campus Job Portal';
            const text = `Hi ${user.name},\n\nThank you for registering with us. Your account has been created successfully.\n\nBest Regards,\nCampus Job Portal Team`;
            // Don't await strictly to not block response
            sendEmail(user.email, subject, text);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

export { authUser, registerUser };
