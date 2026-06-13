# ⚡ Smart Energy Bill Analyzer & Complaint Portal

A full-stack web application that allows electricity consumers to upload bills, 
track consumption, and file complaints — built with the MERN stack.

## Features
- User authentication (JWT)
- Upload electricity bills (PDF/Image)
- Track monthly consumption
- File and track complaints (pending → in review → resolved)
- Admin panel to manage complaints
- AI-powered energy saving tips (Groq API)

## Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Auth:** JWT
- **AI:** Groq API (Llama 3.3 70B)

## Setup
1. Clone the repo
2. cd server → npm install
3. Add .env file with MONGO_URI, PORT, JWT_SECRET
4. node server.js
