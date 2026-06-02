# Shortify - Modern URL Shortener

![Shortify Banner](https://img.shields.io/badge/MERN-Stack-green)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Shortify** is a modern URL shortening platform built using the MERN stack. It allows users to create short, shareable links, track analytics, and manage URLs through a clean and responsive dashboard.

---

# 🚀 Features

* 🔗 Create short URLs instantly
* 📊 View detailed click analytics
* 🔐 Secure JWT-based Authentication
* 👤 User Registration & Login
* 📱 Fully Responsive Design
* 🌙 Dark/Light Theme Support
* ⚡ Fast and Reliable URL Redirection
* 📈 Dashboard for URL Management
* 📱 Automatic QR Code Generation for easy sharing and mobile access

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* React Router
* Axios
* Lucide React
* Custom CSS

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcryptjs

---

# 📂 Project Structure

```text
Shortify/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Setup Instructions

## Prerequisites

* Node.js (v18 or higher)
* npm
* MongoDB Atlas Account

---

## 1. Clone Repository

```bash
git clone https://github.com/madeshwari/Shortify.git

cd Shortify
```

---

## 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
```

Run the backend:

```bash
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🔍 Assumptions Made

1. Users must register before creating and managing URLs.
2. MongoDB Atlas is used as the primary database.
3. JWT tokens are stored securely on the client side.
4. Internet access is required for URL redirection.
5. Analytics are based on successful URL visits.
6. Users can only view and manage URLs created by their own account.

---

# 🤖 AI Planning Document

## Problem Statement

Users often need shorter URLs for sharing links across social media, emails, presentations, and messaging platforms. Long URLs are difficult to remember and less visually appealing.

## Solution

Shortify provides:

* Secure user authentication
* Fast URL shortening
* Analytics tracking
* User-friendly dashboard
* Responsive modern UI

## Development Planning

### Phase 1

* Setup MERN project structure
* Configure MongoDB Atlas
* Implement authentication

### Phase 2

* Build URL shortening APIs
* Generate unique short codes
* Create redirection logic

### Phase 3

* Build React frontend
* Dashboard implementation
* Analytics integration

### Phase 4

* Testing
* Deployment
* Documentation

---

# 🏗️ Architecture Diagram

```text
                ┌─────────────────┐
                │     Client      │
                │ React + Vite UI │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Express Server  │
                │ REST APIs       │
                └────────┬────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼                               ▼
 ┌──────────────┐               ┌──────────────┐
 │ JWT Auth     │               │ URL Service  │
 │ Login/Register│              │ Shorten URL  │
 └──────────────┘               └──────────────┘
         │                               │
         └───────────────┬───────────────┘
                         ▼
                ┌─────────────────┐
                │ MongoDB Atlas   │
                │ Users & URLs    │
                └─────────────────┘
```

---

# 🎥 Application Demo Video


---

# 📸 Screenshots

## Login Page



## Dashboard



## URL Analytics



---

# 🚀 Future Enhancements

* Custom Short URLs
* Password Protected Links
* Expiry Date Support
* Advanced Analytics
* Team Collaboration Features

---

# 📝 License

Distributed under the MIT License.

---

# 👩‍💻 Author

**Thaleshwari J**

GitHub:
https://github.com/thaleshwari

---

## Hackathon Declaration

This project is a part of a hackathon run by https://katomaran.com
