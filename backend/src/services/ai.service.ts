import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const parseJSON = (text: string) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

const chat = async (prompt: string): Promise<string> => {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return response.choices[0].message.content || '';
};

// ── Resume Analyzer ────────────────────────────────────────
export const analyzeResume = async (
  resumeText: string,
  jobDescription: string,
  jobTitle: string
): Promise<{
  score: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  summary: string;
}> => {
  const prompt = `You are an expert HR recruiter and resume analyst.
Analyze this resume against the job description and respond ONLY with a valid JSON object, no markdown, no explanation.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Resume: ${resumeText}

Respond with exactly this JSON structure:
{
  "score": <number 0-100>,
  "strengths": [<3-5 specific strengths from the resume that match the job>],
  "gaps": [<3-5 specific gaps or missing requirements>],
  "suggestions": [<3-5 actionable suggestions to improve the resume for this job>],
  "summary": "<2-3 sentence overall assessment>"
}`;

  const text = await chat(prompt);
  return parseJSON(text);
};

// ── Smart Job Matching ─────────────────────────────────────
export const getJobMatches = async (
  userProfile: {
    skills: string[];
    experience: string;
    education: string;
    bio: string;
  },
  jobs: Array<{ id: string; title: string; description: string; skills: string[]; experienceLevel: string }>
): Promise<Array<{ jobId: string; matchScore: number; reason: string }>> => {
  const prompt = `You are a job matching expert. Match this candidate profile to the provided jobs.
Respond ONLY with a valid JSON array, no markdown, no explanation.

Candidate Profile:
- Skills: ${userProfile.skills.join(', ')}
- Experience: ${userProfile.experience}
- Education: ${userProfile.education}
- Bio: ${userProfile.bio}

Jobs to match:
${jobs.map((j) => `ID: ${j.id} | Title: ${j.title} | Skills: ${j.skills.join(', ')} | Level: ${j.experienceLevel}`).join('\n')}

Respond with exactly this JSON structure:
[
  {
    "jobId": "<job id>",
    "matchScore": <number 0-100>,
    "reason": "<one sentence explaining the match>"
  }
]
Sort by matchScore descending.`;

  const text = await chat(prompt);
  return parseJSON(text);
};

// ── JD Generator ───────────────────────────────────────────
export const generateJobDescription = async (input: {
  title: string;
  industry: string;
  experienceLevel: string;
  skills: string[];
  location: string;
  jobType: string;
  companyName: string;
  additionalNotes?: string;
}): Promise<{
  description: string;
  requirements: string[];
  responsibilities: string[];
  tags: string[];
}> => {
  const prompt = `You are an expert technical recruiter. Write a professional job description.
Respond ONLY with a valid JSON object, no markdown, no explanation.

Job Details:
- Title: ${input.title}
- Company: ${input.companyName}
- Industry: ${input.industry}
- Experience Level: ${input.experienceLevel}
- Required Skills: ${input.skills.join(', ')}
- Location: ${input.location}
- Job Type: ${input.jobType}
- Additional Notes: ${input.additionalNotes || 'None'}

Respond with exactly this JSON structure:
{
  "description": "<compelling 3-4 paragraph job description>",
  "requirements": [<6-8 specific requirements>],
  "responsibilities": [<6-8 specific responsibilities>],
  "tags": [<5-7 relevant tags/keywords>]
}`;

  const text = await chat(prompt);
  return parseJSON(text);
};

// ── Interview Prep Bot ─────────────────────────────────────
export const generateInterviewQuestions = async (
  jobTitle: string,
  jobDescription: string,
  experienceLevel: string,
  skills: string[]
): Promise<{
  technical: Array<{ question: string; tip: string }>;
  behavioral: Array<{ question: string; tip: string }>;
  roleSpecific: Array<{ question: string; tip: string }>;
}> => {
  const prompt = `You are an expert interview coach. Generate interview questions for this role.
Respond ONLY with a valid JSON object, no markdown, no explanation.

Role: ${jobTitle}
Experience Level: ${experienceLevel}
Key Skills: ${skills.join(', ')}
Job Description: ${jobDescription.slice(0, 500)}

Respond with exactly this JSON structure:
{
  "technical": [
    { "question": "<technical question>", "tip": "<brief answering tip>" }
  ],
  "behavioral": [
    { "question": "<behavioral question>", "tip": "<brief answering tip>" }
  ],
  "roleSpecific": [
    { "question": "<role specific question>", "tip": "<brief answering tip>" }
  ]
}
Include 4 questions in each category.`;

  const text = await chat(prompt);
  return parseJSON(text);
};