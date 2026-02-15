import Job from '../models/Job.js';

// @desc    Fetch all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const query = {};
        if (req.query.companyId) {
            query.company = req.query.companyId;
        }
        const jobs = await Job.find(query).populate('company', 'name email');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
    const job = await Job.findById(req.params.id).populate('company', 'name email');

    if (job) {
        res.json(job);
    } else {
        res.status(404);
        throw new Error('Job not found');
    }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Company
const createJob = async (req, res) => {
    const { title, location, description, skills, salary, jobType, deadline } = req.body;

    const job = new Job({
        title,
        location,
        description,
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
        salary,
        jobType,
        deadline,
        company: req.user._id,
        companyName: req.user.companyDetails?.companyName || req.user.name,
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Company/Admin
const deleteJob = async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (job) {
        if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to delete this job');
        }

        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } else {
        res.status(404);
        throw new Error('Job not found');
    }
};

export { getJobs, getJobById, createJob, deleteJob };
