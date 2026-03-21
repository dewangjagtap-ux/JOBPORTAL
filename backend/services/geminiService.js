import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fallbackExtractData } from './resumeParser.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// =================== MOCK FALLBACKS =================== //
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getMockExtractedData = async () => {
    await sleep(1500 + Math.random() * 1000); // 1.5 - 2.5s simulated AI delay
    
    // 1. Randomize Skills
    const possibleSkills = ["Java", "Python", "React", "Node.js", "MongoDB", "SQL", "C++", "AWS", "Web Dev"];
    const shuffledSkills = possibleSkills.sort(() => 0.5 - Math.random());
    const skills = shuffledSkills.slice(0, Math.floor(Math.random() * 3) + 3);

    // 2. Randomize Domain
    const possibleDomains = ["Software Engineer", "Frontend Developer", "Data Analyst", "Backend Developer", "Full Stack Developer"];
    const domain = possibleDomains[Math.floor(Math.random() * possibleDomains.length)];

    // 3. Randomize Projects
    const possibleProjects = ["E-commerce Platform", "Chat Application", "Portfolio Website", "Task Management System", "Machine Learning Model"];
    const projects = possibleProjects.sort(() => 0.5 - Math.random()).slice(0, 2);

    // 4. Randomize CGPA (6.0 - 9.5)
    const cgpa = parseFloat((Math.random() * (9.5 - 6.0) + 6.0).toFixed(1));

    return { skills, domain, projects, cgpa };
};

const getMockQuestionsData = async (resumeData) => {
    await sleep(2000); 

    let techQuestions = [];
    let skillsStr = (resumeData?.skills || []).map(s => s.toLowerCase());

    // Smart logic mapping
    if (skillsStr.includes('java') || skillsStr.includes('c++')) {
        techQuestions.push("Can you explain the main principles of OOP (Object-Oriented Programming)?");
        techQuestions.push("Explain how a HashMap works internally.");
    }
    if (skillsStr.includes('react') || skillsStr.includes('node.js') || skillsStr.includes('web dev')) {
        techQuestions.push("What is the difference between Virtual DOM and Real DOM?");
        techQuestions.push("Explain closures and event delegation in JavaScript.");
    }
    if (skillsStr.includes('sql') || skillsStr.includes('mongodb')) {
        techQuestions.push("What is Database Normalization, and why is it important?");
    }

    // Fill generic questions if smart logic didn't hit 3
    if (techQuestions.length < 3) {
        techQuestions.push("How do you handle asynchronous programming and error handling?");
        techQuestions.push("Explain your approach to debugging a critical production bug.");
        techQuestions.push("What's the difference between Git Merge and Git Rebase?");
    }

    // Exact 3 questions
    techQuestions = techQuestions.sort(() => 0.5 - Math.random()).slice(0, 3);

    // Dynamic Resume Questions based on random project names
    const projNames = resumeData?.projects && resumeData.projects.length > 0 ? resumeData.projects : ["your recent project"];
    const proj1 = projNames[0];
    const topSkill = skillsStr.length > 0 ? skillsStr[0] : "technology";
    const resume_questions = [
        `Can you walk me through the architecture of your ${proj1} project, specifically highlighting how you utilized ${topSkill}?`,
        `What were the most significant technical challenges you encountered while developing ${projNames.length > 1 ? projNames[1] : proj1}, and how did you resolve them?`,
        `If you were tasked with completely rebuilding ${proj1} from scratch today, what architectural choices or tech stacks would you change and why?`
    ];

    const hrPool = [
        "Tell me about yourself.",
        "Why should we hire you for this role?",
        "Describe a time you had a conflict with a team member and how you resolved it.",
        "Where do you see yourself in 5 years?",
        "What is your greatest strength and weakness?"
    ];
    const hr_questions = hrPool.sort(() => 0.5 - Math.random()).slice(0, 3);

    return { resume_questions, technical_questions: techQuestions, hr_questions };
};

const getMockEvaluation = async () => {
    await sleep(1500);
    const score = Math.floor(Math.random() * 5) + 5; // Random score 5-9
    
    let feedback = "";
    if (score >= 8) {
        const pool = ["Great explanation! Your answer was clear and to the point.", "Solid response, good use of technical terminology.", "Excellent answer. You demonstrated deep and clear understanding."];
        feedback = pool[Math.floor(Math.random() * pool.length)];
    } else if (score >= 6) {
        const pool = ["Good attempt, but try to add more real-world examples.", "You covered the basics, but improving clarity would help.", "Reasonable answer. Mentioning common edge cases would make it stronger."];
        feedback = pool[Math.floor(Math.random() * pool.length)];
    } else {
        const pool = ["Your answer lacks depth. Try to structure it better.", "Not quite there. Make sure you understand the core concepts and provide examples.", "Needs improvement. Be more concise and highlight technical specifics."];
        feedback = pool[Math.floor(Math.random() * pool.length)];
    }

    return { score, feedback };
};

// =================== SERVICES =================== //

/**
 * Send resume text to Gemini to extract skills, projects, domain, and CGPA.
 */
export const extractResumeData = async (resumeText) => {
    // Mock if missing API key
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is missing. Using regex fallback extraction.');
        return fallbackExtractData(resumeText);
    }

    const prompt = `
    Extract skills, projects, domain, and CGPA from this resume and return JSON.
    Format exactly as:
    {
        "skills": ["skill1", "skill2"],
        "domain": "Target job domain",
        "projects": ["Project 1", "Project 2"],
        "cgpa": 8.5
    }
    Resume Text:
    """${resumeText}"""
    `;

    try {
        const result = await model.generateContent(prompt);
        let extractedText = result.response.text();
        extractedText = extractedText.replace(/```json/i, '').replace(/```/g, '').trim();
        return JSON.parse(extractedText);
    } catch (error) {
        console.error("Gemini API resume extraction failed:", error);
        return fallbackExtractData(resumeText);
    }
};

/**
 * Generate interview questions based on skills and projects. Include HR + technical.
 */
export const generateInterviewQuestions = async (resumeData) => {
    // Mock if missing API key
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is missing. Using mock questions fallback.');
        return await getMockQuestionsData(resumeData);
    }

    const prompt = `
    Generate interview questions based on skills and projects. Include HR + technical.
    Context:
    Skills: ${resumeData.skills?.join(', ') || 'None provided'}
    Domain: ${resumeData.domain || 'Software Engineering'}
    Projects: ${resumeData.projects?.join(', ') || 'None provided'}

    Return ONLY a JSON object formatted as:
    {
      "resume_questions": ["Question about generic project 1", "Question about generic project 2", "Another resume question"],
      "technical_questions": ["Question about JS", "Question about React", "Question about System Design"],
      "hr_questions": ["HR generic question 1", "HR generic question 2", "HR generic question 3"]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        let generatedText = result.response.text();
        generatedText = generatedText.replace(/```json/i, '').replace(/```/g, '').trim();
        return JSON.parse(generatedText);
    } catch (error) {
        console.error("Gemini API question generation failed:", error);
        return await getMockQuestionsData(resumeData);
    }
};

/**
 * Evaluate this answer and give score (1-10) and improvement suggestions.
 */
export const evaluateMockAnswer = async (question, answer) => {
    // Mock if missing API key
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is missing. Using mock evaluation fallback.');
        return getMockEvaluation();
    }

    const prompt = `
    Evaluate this answer and give score (1-10) and improvement suggestions.
    Interviewer Question: "${question}"
    Candidate Answer: "${answer}"

    Return ONLY a JSON object formatted exactly as:
    {
        "score": 8,
        "feedback": "A very concise paragraph assessing the response and giving one clear suggestion."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        let evalText = result.response.text();
        evalText = evalText.replace(/```json/i, '').replace(/```/g, '').trim();
        return JSON.parse(evalText);
    } catch (error) {
        console.error("Gemini API evaluation failed:", error);
        return getMockEvaluation();
    }
};
