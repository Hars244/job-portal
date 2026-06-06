# HireAI — AI-Powered Job Portal

<div align="center">

![HireAI Banner](https://img.shields.io/badge/HireAI-AI%20Powered%20Job%20Portal-blue?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**A full-stack, AI-powered job portal built with the MERN stack + TypeScript**

[Live Demo](https://job-portal-j12k.vercel.app) 
[API Health](https://job-portal-mfgk.onrender.com/api/v1/health) 
[Report Bug](https://github.com/Hars244/job-portal/issues)

</div>

---

## 🚀 Features

### For Job Seekers
- 🔍 **Advanced Job Search** — Filter by location, job type, experience level, salary range
- 🤖 **AI Job Matching** — AI analyzes your profile and recommends the most relevant jobs
- 📄 **AI Resume Analyzer** — Get a match score and improvement suggestions for your resume
- 🎯 **AI Interview Prep** — AI generates role-specific interview questions with tips
- 📌 **Save Jobs** — Bookmark jobs to apply later
- 📊 **Application Tracking** — Track all your applications with status timeline
- 🔔 **Real-time Notifications** — Instant alerts when your application status changes

### For Recruiters
- 📝 **Post Jobs** — Create detailed job listings with all required information
- ⚡ **AI JD Generator** — Generate professional job descriptions in seconds using AI
- 👥 **Application Management** — Review, shortlist, reject or hire candidates
- 📈 **Analytics Dashboard** — Track views, applications, and hiring funnel with charts
- 🏢 **Company Profile** — Create and manage your company profile

### General
- 🌙 **Dark Mode** — Full dark/light mode support
- 📱 **Responsive Design** — Works on all devices
- 🔐 **Secure Auth** — JWT access + refresh token system with role-based access
- ⚡ **Real-time** — Socket.io powered real-time notifications

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Server runtime |
| Express.js | Web framework |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time notifications |
| JWT | Authentication |
| Groq API (LLaMA 3.3) | AI features |
| Cloudinary | File storage (resumes) |
| Resend | Email notifications |
| Zod | Input validation |
| Multer | File upload handling |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| React Query | Data fetching & caching |
| Zustand | State management |
| React Hook Form + Zod | Form validation |
| Recharts | Analytics charts |
| Socket.io Client | Real-time updates |
| Lucide React | Icons |

---

## 📁 Project Structure
job-portal/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # DB, Cloudinary config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI, Email, Socket services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/               # React + Vite
├── src/
│   ├── api/            # Axios instance
│   ├── components/     # Reusable components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # All pages
│   ├── store/          # Zustand auth store
│   ├── types/          # TypeScript interfaces
│   └── utils/          # Helper functions
├── .env.example
└── package.json

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)
- Cloudinary account (free)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Hars244/job-portal.git
cd job-portal
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm run dev
```

**3. Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Add VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```

**4. Open in browser**

Frontend: http://localhost:5173
Backend:  http://localhost:5000/api/v1/health

---

## 🔑 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
GROQ_API_KEY=your_groq_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=onboarding@resend.dev
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 🚀 Deployment

- **Backend:** Render
- **Frontend:** Vercel
- **Database:** MongoDB Atlas
- **Files:** Cloudinary

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 👨‍💻 Author

**Harsh Dwivedi**
- GitHub: [@Hars244](https://github.com/Hars244)
- LinkedIn: [Add your LinkedIn URL]

---

<div align="center">
Built with ❤️ using MERN Stack + AI
</div>