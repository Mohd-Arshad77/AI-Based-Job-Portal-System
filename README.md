# AI-Based Job Portal System (HireOn)

A comprehensive, full-stack MERN application designed to streamline the recruitment process. This platform features AI-driven resume parsing, smart job matching, real-time socket communication, secure authentication, and strict role-based access control for Admins, Recruiters, and Users.

## 🚀 Features

* **🔐 Secure Authentication:** Robust login/registration system using standard Email/Password with OTP verification (via Nodemailer) and Google OAuth integration.
* **👥 Role-Based Access Control (RBAC):** Distinct dashboards, routing, and permissions for three main roles: `Admin`, `Recruiter`, and `User`.
* **📄 AI Resume Parsing:** Automated extraction of skills, experience, and projects from uploaded PDF resumes using `pdf-parse` and advanced keyword matching algorithms.
* **🎯 Smart Job Matching:** Dynamic calculation of a "Job Match Score" percentage based on the candidate's parsed skills against the specific job requirements.
* **💬 Real-Time Notifications:** Integrated `Socket.io` for live updates on application statuses, interview schedules, and platform alerts.
* **📅 Interview Scheduling:** Dedicated workflows for recruiters to schedule interviews and instantly notify candidates.
* **💼 Comprehensive Job Management:** Recruiters can seamlessly post, update, manage job listings, and review applicant profiles.
* **📊 Admin Dashboard:** Centralized control panel for platform administrators to monitor users, manage jobs, and oversee system metrics.

## 🛠️ Tech Stack

### Frontend
* **Core:** React 19, Vite
* **Styling & UI:** TailwindCSS 4, Framer Motion, Lucide React
* **Routing:** React Router v7
* **State Management & Data Fetching:** Axios
* **Real-time:** Socket.io-client
* **Authentication:** Google OAuth (`@react-oauth/google`)

### Backend
* **Core:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Real-time:** Socket.io
* **Authentication & Security:** JSON Web Tokens (JWT), bcryptjs, Google Auth Library
* **File Processing:** Multer (Uploads), pdf-parse (Text extraction)
* **Email Services:** Nodemailer (OTP and Notifications)

## 📂 Project Structure

```
AI RESUME ANALYSIS/
├── BACKEND/
│   ├── controllers/      # Route controllers (auth, user, job, resume, etc.)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express API routes
│   ├── services/         # Business logic (e.g., pdfService)
│   ├── utils/            # Helper functions (resumeParser, sendEmail, etc.)
│   ├── package.json
│   └── server.js         # Entry point for the backend
│
├── FRONTEND/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Role-specific pages (admin, recruiter, user, auth)
│   │   ├── config.js     # Global configuration and environment setup
│   │   ├── App.jsx       # Main application routing
│   │   └── main.jsx      # React DOM rendering
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have the following installed:
* Node.js (v18 or higher recommended)
* MongoDB (Local instance or MongoDB Atlas)

### 2. Clone the Repository
```bash
git clone <repository-url>
cd "AI RESUME ANALYSIS"
```

### 3. Backend Setup
Navigate to the `BACKEND` directory, install dependencies, and configure environment variables.
```bash
cd BACKEND
npm install
```
Create a `.env` file in the `BACKEND` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Frontend Setup
Open a new terminal, navigate to the `FRONTEND` directory, install dependencies, and configure environment variables.
```bash
cd ../FRONTEND
npm install
```
Create a `.env` file in the `FRONTEND` directory with the following variables:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 5. Running the Application
**Start the Backend Server (Terminal 1):**
```bash
cd BACKEND
npm run dev
```

**Start the Frontend Development Server (Terminal 2):**
```bash
cd FRONTEND
npm run dev
```

The frontend will be accessible at `http://localhost:5173` and the backend API will run on `http://localhost:5000`.

## 📜 License
This project is for educational and portfolio purposes.
