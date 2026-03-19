import User from '../models/User.js';
import Application from '../models/Application.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';

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

// @desc    Get mock interview questions
// @route   GET /api/ai/interview-prep
// @access  Private (Student)
export const getInterviewQuestions = async (req, res) => {
    try {
        // Here we could realistically call an LLM API (like OpenAI) to dynamically generate,
        // but per requirements we'll use a rule-based / hand-crafted solid selection to start.
        
        const mockQuestions = [
            {
                category: "HR / General",
                questions: [
                    {
                        question: "Tell me about yourself.",
                        tips: [
                            "Use the Present-Past-Future formula.",
                            "Keep it professional and relevant to the role.",
                            "Highlight key achievements and current skills."
                        ]
                    },
                    {
                        question: "What are your greatest strengths and weaknesses?",
                        tips: [
                            "For strengths, provide a specific example.",
                            "For weaknesses, choose a real weakness but show how you are actively overcoming it."
                        ]
                    },
                    {
                        question: "Where do you see yourself in 5 years?",
                        tips: [
                            "Show ambition but relate it to the company's growth.",
                            "Focus on skill development and leadership."
                        ]
                    }
                ]
            },
            {
                category: "Data Structures & Algorithms (DSA)",
                questions: [
                    {
                        question: "Explain the difference between an Array and a Linked List.",
                        tips: [
                            "Arrays have contiguous memory allocation; Linked Lists do not.",
                            "Arrays allow O(1) random access. Linked List access is O(N).",
                            "Linked Lists allow O(1) insertions/deletions at known positions."
                        ]
                    },
                    {
                        question: "What is Time Complexity? Explain Big O notation.",
                        tips: [
                            "Time complexity describes how the runtime of an algorithm grows as the input size grows.",
                            "Big O represents the upper bound (worst-case scenario).",
                            "Common examples: O(1), O(log N), O(N), O(N^2)."
                        ]
                    },
                    {
                        question: "How does a Hash Map work under the hood?",
                        tips: [
                            "Uses a hash function to map keys to an index in an underlying array.",
                            "Handles collisions using chaining (Linked Lists) or open addressing.",
                            "Average lookup time is O(1)."
                        ]
                    }
                ]
            },
            {
                category: "Core Subjects",
                questions: [
                    {
                        question: "What are the four pillars of Object-Oriented Programming (OOP)?",
                        tips: [
                            "Encapsulation: Bundling data and methods.",
                            "Abstraction: Hiding complex implementation details.",
                            "Inheritance: Deriving new classes from existing ones.",
                            "Polymorphism: Using a single interface for different types."
                        ]
                    },
                    {
                        question: "Explain the concept of Normalization in DBMS.",
                        tips: [
                            "Process of organizing data to minimize redundancy.",
                            "Involves dividing large tables into smaller ones and linking them using relationships.",
                            "1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency)."
                        ]
                    },
                    {
                        question: "What is the difference between TCP and UDP?",
                        tips: [
                            "TCP is connection-oriented, reliable, and guarantees delivery (e.g., HTTP).",
                            "UDP is connectionless, faster, but does not guarantee delivery (e.g., Video Streaming)."
                        ]
                    }
                ]
            }
        ];

        res.json(mockQuestions);

    } catch (error) {
        console.error('Error fetching interview questions:', error);
        res.status(500).json({ message: 'Server error fetching interview AI data' });
    }
};

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// @desc    Upload resume, parse and extract data
// @route   POST /api/ai/resume/upload
// @access  Private (Student)
export const uploadResumeForAI = async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        // Parse PDF
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        // Use Gemini to extract structured info
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        You are an AI specialized in analyzing student resumes. Extract the following information from the provided resume text and return it STRICTLY as a valid JSON object without any backticks, markdown, or extra text.

        Expected JSON format:
        {
          "skills": ["skill1", "skill2"],
          "domain": "Target job domain or title based on resume",
          "projects": ["Project Name 1", "Project Name 2"],
          "cgpa": 8.5 (extract as a number if found, otherwise null)
        }

        Resume Text:
        """${resumeText}"""
        `;

        const result = await model.generateContent(prompt);
        let extractedText = result.response.text();
        extractedText = extractedText.replace(/```json/i, '').replace(/```/g, '').trim();

        let extractedData;
        try {
            extractedData = JSON.parse(extractedText);
        } catch (e) {
             // Fallback if AI doesn't return perfect JSON
             extractedData = {
                 skills: ["Java", "React", "Node.js (Fallback)"],
                 domain: "Software Engineer",
                 projects: ["Academic Project"],
                 cgpa: null
             }
        }

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
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
        }

        // We assume the frontend passes the extracted data in headers or query. 
        // For standard GET request, passing via query param (stringified)
        const resumeDataStr = req.query.resumeData;
        if (!resumeDataStr) {
             return res.status(400).json({ message: 'Missing resume data query parameter' });
        }

        const resumeData = JSON.parse(decodeURIComponent(resumeDataStr));

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        You are an expert technical recruiter and interviewer. Look at the following candidate details extracted from their resume:
        Skills: ${resumeData.skills?.join(', ')}
        Domain: ${resumeData.domain}
        Projects: ${resumeData.projects?.join(', ')}

        Generate three types of interview questions to test the candidate. 
        Return the result STRICTLY as a valid JSON object conforming to the following structure, without markdown (like \`\`\`json) or any additional text.

        {
          "resume_questions": [
             "Question about specific project 1",
             "Question about specific project 2"
          ],
          "technical_questions": [
             "Question about skill 1",
             "Question about skill 2"
          ],
          "hr_questions": [
             "Common HR question 1",
             "Common HR question 2"
          ]
        }
        
        Generate exactly 3 questions per category.
        `;

        const result = await model.generateContent(prompt);
        let generatedText = result.response.text();
        generatedText = generatedText.replace(/```json/i, '').replace(/```/g, '').trim();

        let questionsData;
        try {
            questionsData = JSON.parse(generatedText);
        } catch(e) {
            questionsData = {
                resume_questions: ["Could you explain your projects in detail?"],
                technical_questions: ["Explain the core concepts of the skills you mentioned."],
                hr_questions: ["Tell me about yourself."]
            }
        }

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
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
        }
        
        const { question, answer } = req.body;
        if (!question || !answer) {
             return res.status(400).json({ message: 'Question and answer are required' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        You are an expert interviewer.
        Question asked: "${question}"
        User's answer: "${answer}"

        Evaluate this answer out of 10.
        Return STRICTLY valid JSON with no markdown tags.
        {
           "score": 8,
           "feedback": "A short, actionable paragraph explaining what was good and how to improve."
        }
        `;

        const result = await model.generateContent(prompt);
        let evalText = result.response.text();
        evalText = evalText.replace(/```json/i, '').replace(/```/g, '').trim();

        let evalData;
        try {
            evalData = JSON.parse(evalText);
        } catch(e) {
            evalData = {
                score: 5,
                feedback: "Received your answer, but we were unable to generate AI feedback."
            }
        }

        res.json(evalData);

    } catch(error) {
        console.error('Error evaluating answer:', error);
        res.status(500).json({ message: 'Server error processing AI evaluation' });
    }
};
