import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'company', 'admin'], default: 'student' },
    // Student Profile fields
    phone: { type: String },
    photo: { type: String },
    resume: { type: String },
    branch: { type: String },
    year: { type: String },
    college: { type: String },
    cgpa: { type: String },
    skills: [String],
    about: { type: String },
    linkedin: { type: String },
    github: { type: String },
    // Company Profile fields
    companyDetails: {
        companyName: { type: String },
        description: { type: String },
        website: { type: String },
        logo: { type: String },
        hrName: { type: String },
        address: { type: String },
    },
    // Admin Profile fields
    adminDetails: {
        designation: { type: String },
        department: { type: String },
        phone: { type: String },
        photo: { type: String },
    },
    isApproved: { type: Boolean, default: false }
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
