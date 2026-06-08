import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

// Because we installed v1.1.1, this will work flawlessly.
const pdfParse = require('pdf-parse');

dotenv.config();

const router: Router = express.Router();

// Store the uploaded file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define the interface for the expected AI output
interface ExtractedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  phoneCode?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  bio?: string;
}

router.post(
  '/extract-resume-data',
  upload.single('resume'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Ensure a file was uploaded
      if (!req.file) {
        res.status(400).json({ message: 'No resume file uploaded' });
        return;
      }

      // 2. Extract raw text from the PDF buffer
      const pdfData = await pdfParse(req.file.buffer);
      const rawText: string = pdfData.text;

      if (!rawText || rawText.trim().length === 0) {
         res.status(400).json({ message: 'Could not read text from this PDF.' });
         return;
      }

      // 3. Define the prompt
      const prompt = `
        You are an expert HR assistant. Extract the following information from the resume text provided below.
        Return the output ONLY as a valid JSON object. Do not include any explanations or markdown blocks.
        
        Required JSON structure:
        {
          "name": "Full name",
          "email": "Email address",
          "phone": "Phone number without country code",
          "phoneCode": "Country code (e.g., +1, +91, +44)",
          "skills": ["Skill 1", "Skill 2", "Skill 3"],
          "experience": "A brief 1-2 sentence summary of their total experience (e.g., '4 years of full stack development')",
          "education": "Highest degree and university",
          "bio": "A professional summary or bio (maximum 400 characters)"
        }

        Resume Text:
        ${rawText}
      `;

      // 4. Call the Groq model
      // 4. Call the Groq model
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an API that outputs strict JSON.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile', // <--- Update this line right here!
        temperature: 0, 
        response_format: { type: 'json_object' }, 
      });

      // 5. Extract the response content
      const aiResponse: string = chatCompletion.choices[0]?.message?.content || '{}';

      // 6. Parse and strongly type the JSON
      const extractedData: ExtractedResumeData = JSON.parse(aiResponse);
      
      res.status(200).json(extractedData);

    } catch (error: any) {
      console.error('Error extracting resume data with Groq:', error);
      res.status(500).json({ 
        message: 'Failed to analyze resume', 
        error: error.message 
      });
    }
  }
);

export default router;