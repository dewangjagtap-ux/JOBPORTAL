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
        if (!buffer) return '';

        if (mimetype === 'application/pdf') {
            const data = await pdfParse(buffer);
            return data.text || '';
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            mimetype === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer });
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
    // 1. Default Handling
    if (!text || text.trim() === '') {
        return {
            skills: ["HTML", "CSS", "Basic JavaScript"],
            projects: ["Academic Project"],
            cgpa: null,
            domain: "General Software Engineer"
        };
    }

    const lowerText = text.toLowerCase();
    
    // 2. Keyword matching for skills
    const skillDictionary = [
        "java", "python", "c++", "c#", "javascript", "typescript", 
        "react", "angular", "vue", "node.js", "express", "django",
        "spring boot", "mongodb", "sql", "postgresql", "mysql",
        "aws", "docker", "kubernetes", "git", "machine learning", "dsa"
    ];
    
    const foundSkills = skillDictionary.filter(skill => {
        // Use word boundaries for strict matching where possible
        const regex = new RegExp(`\\b${skill === 'c++' ? 'c\\+\\+' : skill.replace('.', '\\.')}\\b`, 'i');
        return regex.test(lowerText);
    });

    // 3. Pattern Recognition for CGPA
    let cgpa = null;
    // Matches commonly formatted CGPA strings: "CGPA: 8.5", "CGPA 9.1", "GPA: 3.8/4.0"
    const cgpaRegex = /(?:cgpa|gpa)[\s:-]*([0-9]{1}\.[0-9]{1,2})/i;
    const match = text.match(cgpaRegex);
    if (match && match[1]) {
        cgpa = parseFloat(match[1]);
    }

    // 4. Pattern Recognition for Domain
    let domain = "Software Developer";
    if (lowerText.includes("data scientist") || lowerText.includes("machine learning")) {
        domain = "Data Scientist";
    } else if (lowerText.includes("frontend") || lowerText.includes("ui/ux")) {
        domain = "Frontend Developer";
    } else if (lowerText.includes("backend")) {
        domain = "Backend Developer";
    }

    // 5. Naive Project extraction based on common resume structures
    const projects = [];
    if (lowerText.includes("e-commerce") || lowerText.includes("ecommerce")) projects.push("E-Commerce Platform");
    if (lowerText.includes("chat app") || lowerText.includes("client-server")) projects.push("Chat Application");
    if (lowerText.includes("portfolio")) projects.push("Personal Portfolio");
    if (lowerText.includes("management system")) projects.push("Management System");
    
    if (projects.length === 0) {
        projects.push("Personal Project");
    }

    return {
        skills: foundSkills.length > 0 ? foundSkills : ["Programming Fundamentals"],
        projects,
        cgpa,
        domain
    };
};
