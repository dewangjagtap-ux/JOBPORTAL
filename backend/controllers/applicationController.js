import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Student
const applyForJob = async (req, res) => {
    const { jobId } = req.body;
    let resume = req.file ? req.file.path : null;

    // If no new resume uploaded, check if user has one in their profile
    if (!resume) {
        const user = await User.findById(req.user._id);
        if (user && user.resume) {
            resume = user.resume;
        }
    }

    if (!resume) {
        res.status(400);
        throw new Error('Please upload a resume in your profile before applying or provide one now');
    }

    const job = await Job.findById(jobId);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const existingApplication = await Application.findOne({
        job: jobId,
        student: req.user._id,
    });

    if (existingApplication) {
        res.status(400);
        throw new Error('You have already applied for this job');
    }

    const application = new Application({
        job: jobId,
        student: req.user._id,
        resume,
    });

    const createdApplication = await application.save();

    if (createdApplication) {
        // Notify Company
        const jobDetails = await Job.findById(jobId).populate('company');
        if (jobDetails && jobDetails.company && jobDetails.company.email) {
            const subject = `New Application for ${jobDetails.title}`;
            const text = `Hello ${jobDetails.company.name},\n\nA student has applied for your job opening: ${jobDetails.title}.\n\nPlease login to the portal to view the application.\n\nBest Regards,\nCampus Job Portal`;
            sendEmail(jobDetails.company.email, subject, text);
        }

        res.status(201).json(createdApplication);
    } else {
        res.status(500);
        throw new Error('Application could not be saved');
    }
};

// @desc    Get logged in user applications
// @route   GET /api/applications/my
// @access  Private/Student
const getMyApplications = async (req, res) => {
    const applications = await Application.find({ student: req.user._id })
        .populate('job', 'title companyName location')
        .sort('-createdAt');
    res.json(applications);
};

// @desc    Get applications for a job (Company)
// @route   GET /api/applications/job/:jobId
// @access  Private/Company
const getJobApplications = async (req, res) => {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    if (job.company.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to view applications for this job');
    }

    const applications = await Application.find({ job: req.params.jobId })
        .populate('student', 'name email phone')
        .sort('-createdAt');

    res.json(applications);
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private/Company
const updateApplicationStatus = async (req, res) => {
    const { status } = req.body;

    const application = await Application.findById(req.params.id).populate('student').populate('job');

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    if (application.job.company.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this application');
    }

    application.status = status;
    const updatedApplication = await application.save();

    // Notify Student
    if (application.student && application.student.email) {
        const subject = `Application Status Update: ${application.job.title}`;
        const text = `Hello ${application.student.name},\n\nYour application status for the job "${application.job.title}" has been updated to: ${status}.\n\nLogin to check details.\n\nBest Regards,\nCampus Job Portal`;
        sendEmail(application.student.email, subject, text);
    }

    res.json(updatedApplication);
};

// @desc    Get all applications for a company
// @route   GET /api/applications/company
// @access  Private/Company
const getCompanyApplications = async (req, res) => {
    try {
        // Find all jobs by this company
        const jobs = await Job.find({ company: req.user._id });
        const jobIds = jobs.map(j => j._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('job', 'title')
            .populate('student', 'name email phone')
            .sort('-createdAt');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    getCompanyApplications,
};
