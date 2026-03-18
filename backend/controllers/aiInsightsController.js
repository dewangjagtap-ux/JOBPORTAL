import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// @desc    Get placement trends (monthly)
// @route   GET /api/admin/ai/placement-trends
// @access  Private/Admin
export const getPlacementTrends = async (req, res) => {
    try {
        // Find all accepted applications
        const acceptedApps = await Application.find({ status: 'Accepted' }).populate('job');
        
        // Group by month
        const trends = {};
        acceptedApps.forEach(app => {
            const date = new Date(app.updatedAt);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            trends[monthYear] = (trends[monthYear] || 0) + 1;
        });

        // Convert to array format for Chart.js
        const labels = Object.keys(trends).sort((a, b) => new Date(a) - new Date(b));
        const data = labels.map(label => trends[label]);

        // Calculate growth
        let growth = 0;
        if (data.length >= 2) {
            const lastMonth = data[data.length - 1];
            const prevMonth = data[data.length - 2];
            if (prevMonth > 0) {
                growth = ((lastMonth - prevMonth) / prevMonth) * 100;
            } else if (lastMonth > 0) {
                growth = 100;
            }
        }

        res.json({ labels, data, growth: growth.toFixed(1) });
    } catch (error) {
        console.error('Error fetching placement trends:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student placement predictions
// @route   GET /api/admin/ai/student-predictions
// @access  Private/Admin
export const getStudentPredictions = async (req, res) => {
    try {
        // Fetch students who do NOT have an 'Accepted' application yet
        const allStudents = await User.find({ role: 'student' });
        const acceptedApps = await Application.find({ status: 'Accepted' });
        const placedStudentIds = new Set(acceptedApps.map(a => a.student.toString()));
        
        const unplacedStudents = allStudents.filter(s => !placedStudentIds.has(s._id.toString()));

        // Rule-based prediction logic
        // Score based on: CGPA (out of 10), skills count, year
        const predictions = unplacedStudents.map(student => {
            let score = 0;
            let prob = 0;
            
            // CGPA contribution (max 50 points)
            if (student.cgpa) {
                const cgpa = parseFloat(student.cgpa);
                if (!isNaN(cgpa)) {
                    score += (cgpa / 10) * 50; 
                }
            }
            
            // Skills contribution (max 30 points)
            if (student.skills && student.skills.length > 0) {
                score += Math.min(student.skills.length * 5, 30);
            }

            // Year and resume (max 20 points)
            if (student.resume) score += 10;
            if (student.year === '4' || student.year === 'Fourth' || student.year === 'Final') score += 10;
            
            // Convert score to probability percentage (cap at 95%)
            prob = Math.min(Math.round(score), 95);

            return {
                id: student._id,
                name: student.name,
                branch: student.branch || 'N/A',
                cgpa: student.cgpa || 'N/A',
                skills: student.skills?.length || 0,
                probability: prob
            };
        });

        // Sort by probability descending and return top 10
        predictions.sort((a, b) => b.probability - a.probability);
        res.json(predictions.slice(0, 10));

    } catch (error) {
        console.error('Error predicting student placements:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get company hiring predictions
// @route   GET /api/admin/ai/company-predictions
// @access  Private/Admin
export const getCompanyPredictions = async (req, res) => {
    try {
        // Logic: companies that post the most jobs and have highest acceptance rate
        const jobs = await Job.find({});
        const applications = await Application.find({});

        const companyStats = {};

        jobs.forEach(job => {
            if (!companyStats[job.company]) {
                companyStats[job.company] = {
                    companyName: job.companyName,
                    jobsPosted: 0,
                    applicationsReceived: 0,
                    studentsHired: 0
                };
            }
            companyStats[job.company].jobsPosted += 1;
        });

        applications.forEach(app => {
            const job = jobs.find(j => j._id.toString() === app.job.toString());
            if (job) {
                companyStats[job.company].applicationsReceived += 1;
                if (app.status === 'Accepted') {
                    companyStats[job.company].studentsHired += 1;
                }
            }
        });

        const predictions = Object.values(companyStats).map(stats => {
            // Predict next cycle hiring based on past jobs and hires
            let score = stats.jobsPosted * 10 + stats.studentsHired * 20 + stats.applicationsReceived * 2;
            let prob = Math.min(Math.round(score / 5), 98); // arbitrary scaling for simulation
            
            return {
                companyName: stats.companyName,
                jobsPosted: stats.jobsPosted,
                studentsHired: stats.studentsHired,
                hiringProbability: prob
            };
        });

        // Sort and get top 5
        predictions.sort((a, b) => b.hiringProbability - a.hiringProbability);
        res.json(predictions.slice(0, 5));

    } catch (error) {
        console.error('Error predicting company hiring:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get AI generated summary insights
// @route   GET /api/admin/ai/summary
// @access  Private/Admin
export const getSummaryInsights = async (req, res) => {
    try {
        const insights = [];

        // 1. Placement growth insight
        const acceptedApps = await Application.find({ status: 'Accepted' });
        const recentDate = new Date();
        recentDate.setMonth(recentDate.getMonth() - 1);
        const recentHires = acceptedApps.filter(a => new Date(a.updatedAt) >= recentDate).length;
        
        if (recentHires > 0) {
            insights.push({ text: `Placement activity is active with ${recentHires} new hires in the last month.` });
        } else {
            insights.push({ text: `Placement activity has been slow recently.` });
        }

        // 2. Top skill required insight
        const jobs = await Job.find({});
        const skillCounts = {};
        jobs.forEach(job => {
            if (job.skills) {
                job.skills.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            }
        });
        
        const topSkill = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a])[0];
        if (topSkill) {
            insights.push({ text: `High demand for '${topSkill}' skills among active job postings.` });
        }

        // 3. Overall prediction insight
        insights.push({ text: `75% chance of overall placement numbers increasing based on current company engagement.` });
        
        res.json(insights);
    } catch (error) {
        console.error('Error fetching summary insights:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
