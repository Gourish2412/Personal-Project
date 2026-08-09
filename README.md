# Lumina AI - The Ultimate AI Career Mentor 🚀

Welcome to Lumina AI, a full-stack MERN application that serves as a personalized AI Career Mentor. This platform not only teaches you programming concepts but dynamically plans your roadmap, adapts to your schedule, evaluates your code, and tracks your progress along the way.

## 🌟 Key Features

1. **AI Career Mentor (OpenAI Integrated)**
   - Context-aware chatbot.
   - Remembers past interactions.
   - Understands your time constraints and adjusts daily goals automatically.
   - Markdown & Code highlighting built-in.
   
2. **Dynamic Progress Dashboard**
   - Automatically tracks consistency and streak.
   - Highlights Weakest Areas and directs learning.
   - Beautiful, fully responsive layout using Custom CSS (Glassmorphism & Gradients).

3. **Project Builder and Code Review**
   - Provides step-by-step guidance on projects instead of spoon-feeding the whole code.
   - Live mock testing and AI evaluation of code submissions.
   - "Hints" instead of answers, turning learning into doing.

4. **Production Ready Architecture**
   - **Frontend**: Designed with React + Vite. Features Dark Mode, Framer Motion animations, Sonner toasts, modular CSS, lazy loading strategies (Memoization).
   - **Backend**: Express + MongoDB. Handles authentication (JWT), automatic conversation tracking, Roadmap caching, and Progress updates.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Custom CSS Variables (Theme Toggling), Framer Motion (Animations), React-Markdown (Code blocks & syntax highlighting).
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, OpenAI API.
- **Tools:** Axios (API Layer w/ Interceptors), Nodemon.

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file locally containing:
# MONGO_URI="mongodb://localhost:27017/ai-mentor"
# JWT_SECRET="your_secret_here"
# OPENAI_API_KEY="sk-..." (Optional, has a smart fallback if missing)
npm run dev
```

### 2. Frontend Setup
```bash
cd mentor-app
npm install
npm run dev
```
Access the application locally at `http://localhost:5173`.

---

## 📦 Deployment Configuration

### Frontend (Vercel)
The Vite frontend is optimized for zero-config Vercel deployment.
1. Connect the repository to Vercel.
2. Select the `mentor-app` as the root directory.
3. Framework Preset: Vite.
4. Add environment variables if applicable. 

### Backend (Render / Heroku / DigitalOcean)
The `backend/server.js` starts automatically via the `start` script.
1. Ensure your MongoDB cluster (e.g. MongoDB Atlas) is whitelisting all IP addresses (`0.0.0.0/0`) if using Render.
2. Add your production `MONGO_URI`, `OPENAI_API_KEY`, and `JWT_SECRET` in the provider's environment settings.

---

> Built with a passion for learning by Jay Sharma. 
