import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from buffer based on mimetype.
 * Supports application/pdf and application/vnd.openxmlformats-officedocument.wordprocessingml.document
 */
export const extractTextFromFile = async (buffer, mimetype) => {
    try {
        if (!buffer || buffer.length === 0) {
            console.error('Buffer is empty or null');
            return '';
        }

        console.log(`Extracting text from buffer of size ${buffer.length} with mimetype ${mimetype}`);

        if (mimetype === 'application/pdf') {
            const data = await pdfParse(buffer);
            console.log(`Extracted PDF text length: ${data?.text?.length || 0}`);
            return data.text || '';
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            mimetype === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            console.log(`Extracted DOCX text length: ${result?.value?.length || 0}`);
            return result.value || '';
        } else {
            console.warn(`Unsupported mimetype: ${mimetype}. Attempting to parse as PDF.`);
            const data = await pdfParse(buffer);
            return data.text || '';
        }
    } catch (error) {
        console.error('Error extracting text from file:', error);
        return '';
    }
};

/**
 * Smart Regex/Keyword Detection algorithm.
 * Used as a fallback if the Gemini API is unavailable or disabled.
 */
export const fallbackExtractData = (text) => {
    // We will ensure it doesn't just return "Academic Project" unless completely devoid of text.
    let parsedText = text || '';
    
    // Fallback dictionary
    const skillDictionary = [
        "java", "python", "javascript", "typescript", "c++", "c#", "ruby", "go", "php",
        "react", "angular", "vue", "node.js", "express", "django", "flask", "spring",
        "html", "css", "tailwind", "bootstrap", "mongodb", "sql", "postgresql", "mysql",
        "aws", "docker", "kubernetes", "git", "linux", "jenkins", "machine learning", "dsa",
        "data structures", "algorithms"
    ];

    const lowerText = parsedText.toLowerCase();
    
    // Find skills
    const foundSkills = skillDictionary.filter(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(lowerText);
    });

    // Determine Domain
    let domain = "Software Engineer";
    if (lowerText.includes("data scientist") || lowerText.includes("machine learning")) {
        domain = "Data Scientist";
    } else if (lowerText.includes("frontend") || lowerText.includes("ui") || lowerText.includes("react")) {
        domain = "Frontend Developer";
    } else if (lowerText.includes("backend") || lowerText.includes("node.js") || lowerText.includes("database")) {
        domain = "Backend Developer";
    } else if (lowerText.includes("full stack") || lowerText.includes("full-stack")) {
        domain = "Full Stack Developer";
    }

    // Pattern Recognition for CGPA
    let cgpa = null;
    const cgpaRegex = /(?:cgpa|gpa|score)[\s:-]*([0-9]{1}\.[0-9]{1,2})/i;
    const match = parsedText.match(cgpaRegex);
    if (match && match[1]) {
        cgpa = parseFloat(match[1]);
    }

    // Guess Projects based on common words near "Project" or "App"
    const projects = [];
    const keywords = ["app", "system", "platform", "website", "portal", "dashboard", "bot", "tool"];
    
    // Try to pluck capitalized phrases that contain these keywords
    // For example "E-Commerce App" or "Student Management System"
    const projectRegex = new RegExp(`([A-Z][A-Za-z0-9\\s\\-]{3,30}?(?:${keywords.join('|')}))\\b`, 'gi');
    let projMatch;
    const projectSet = new Set();
    while ((projMatch = projectRegex.exec(parsedText)) !== null) {
        if (projMatch[1].trim().length > 5) {
            // Capitalize first letters
            const cleanName = projMatch[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            projectSet.add(cleanName);
        }
    }
    
    projectSet.forEach(p => projects.push(p));

    // Fallbacks if extraction failed
    if (projects.length === 0) {
        if (parsedText.length > 50) {
            projects.push("Main Capstone Project");
        } else {
            projects.push("Academic Project");
        }
    }

    if (foundSkills.length === 0) {
        foundSkills.push("HTML", "CSS", "Basic JavaScript");
    }

    return {
        skills: foundSkills,
        domain: domain,
        projects: projects.slice(0, 3), // max 3 projects
        cgpa: cgpa || "N/A"
    };
};
