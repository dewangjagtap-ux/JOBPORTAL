import User from '../models/User.js';
import Application from '../models/Application.js';
import * as geminiService from '../services/geminiService.js';
import { extractTextFromFile } from '../services/resumeParser.js';

// @desc    Get student placement probability
// @route   GET /api/ai/student/placement-probability/:studentId
// @access  Private (Student)
export const getStudentPlacementProbability = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Verify the user requesting is the same user or admin
        if (req.user._id.toString() !== studentId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this data' });
        }

        const student = await User.findById(studentId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const applications = await Application.find({ student: studentId });

        let skillsScore = 0;
        let cgpaScore = 0;
        let appScore = 0;
        let suggestions = [];

        // 1. Skills (40% weight -> max 40 points)
        // Assume having 5 valid skills gives full 40 points (8 points per skill)
        if (student.skills && student.skills.length > 0) {
            skillsScore = Math.min(student.skills.length * 8, 40);
            if (skillsScore < 40) {
                suggestions.push('Add more relevant skills to your profile to stand out.');
            }
        } else {
            suggestions.push('You have no skills listed. Add technical skills (e.g., Java, DSA).');
        }

        // 2. CGPA (30% weight -> max 30 points)
        // Assume CGPA is out of 10.
        // CGPA > 6 starts earning points. For example: cgpa * 3.
        if (student.cgpa) {
            const cgpa = parseFloat(student.cgpa);
            if (!isNaN(cgpa)) {
                cgpaScore = Math.min((cgpa / 10) * 30, 30);
                if (cgpa < 7.5) {
                    suggestions.push('Try to improve your CGPA to boost your chances.');
                }
            } else {
                suggestions.push('Invalid CGPA format. Please update your profile.');
            }
        } else {
            suggestions.push('Add your CGPA to your profile for better predictions.');
        }

        // 3. Applications (30% weight -> max 30 points)
        // Assume 5 applications give full 30 points (6 points per application)
        const appCount = applications.length;
        if (appCount > 0) {
            appScore = Math.min(appCount * 6, 30);
            if (appScore < 30) {
                suggestions.push('Apply to more jobs to increase visibility & opportunities.');
            }
        } else {
            suggestions.push('You haven\'t applied to any jobs yet. Start applying!');
        }

        // Optional: Ensure at least a few random suggestions if missing.
        // For demonstration, these are rule-based.
        
        // Calculate Total Score (0-100)
        let totalScore = Math.round(skillsScore + cgpaScore + appScore);

        // Cap score at 98% just in case
        totalScore = Math.min(totalScore, 98);

        // Determine Level
        let level = 'Low';
        if (totalScore >= 80) {
            level = 'High';
        } else if (totalScore >= 50) {
            level = 'Medium';
        }

        if (totalScore >= 80 && suggestions.length === 0) {
            suggestions.push('Keep up the excellent work! Prepare well for interviews.');
        }

        res.json({
            probability: totalScore,
            level: level,
            suggestions: suggestions
        });

    } catch (error) {
        console.error('Error fetching placement probability:', error);
        res.status(500).json({ message: 'Server error while calculating probability' });
    }
};



// @desc    Upload resume, parse and extract data
// @route   POST /api/ai/resume/upload
// @access  Private (Student)
export const uploadResumeForAI = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF or DOCX file' });
        }

        // Extract text using dedicated parser service
        const resumeText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
        
        // Use Gemini Service to extract structured info
        const extractedData = await geminiService.extractResumeData(resumeText);

        res.json({ success: true, extractedData });

    } catch (error) {
        console.error('Error extracting resume data:', error);
        res.status(500).json({ message: 'Server error processing resume' });
    }
};

// @desc    Generate personalized interview questions based on resume data
// @route   GET /api/ai/interview/resume-questions/:studentId
// @access  Private (Student)
export const getResumeBasedQuestions = async (req, res) => {
    try {
        const resumeDataStr = req.query.resumeData;
        if (!resumeDataStr) {
             return res.status(400).json({ message: 'Missing resume data query parameter' });
        }

        const resumeData = JSON.parse(decodeURIComponent(resumeDataStr));

        // Use Gemini Service
        const questionsData = await geminiService.generateInterviewQuestions(resumeData);
        res.json(questionsData);

    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ message: 'Server error generating interview questions' });
    }
};

// @desc    Evaluate a mock interview answer
// @route   POST /api/ai/interview/mock
// @access  Private (Student)
export const evaluateMockAnswer = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
             return res.status(400).json({ message: 'Question and answer are required' });
        }

        // Use Gemini Service
        const evalData = await geminiService.evaluateMockAnswer(question, answer);
        res.json(evalData);

    } catch(error) {
        console.error('Error evaluating answer:', error);
        res.status(500).json({ message: 'Server error processing AI evaluation' });
    }
};
