import mongoose from 'mongoose';

const jobSchema = mongoose.Schema({
    title: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    salary: { type: String },
    jobType: { type: String, enum: ['Full-time', 'Internship', 'Contract'], default: 'Full-time' },
    skills: [{ type: String }],
    experience: { type: String },
    deadline: { type: Date },
    maxApplicants: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
