import mongoose from 'mongoose';

const applicationSchema = mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: String }, // Path to resume file
    status: { type: String, enum: ['Applied', 'Shortlisted', 'Rejected', 'Accepted'], default: 'Applied' },
}, {
    timestamps: true,
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
