# Linkyfy - Modern URL Shortener

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.3-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.1-646CFF)](https://vitejs.dev/)

**Linkyfy** is a sleek, modern, and powerful full-stack URL shortening service designed with a focus on ease of use and visual appeal. It features a premium glassmorphism-style UI and a robust backend for reliable link redirection and analytical tracking.

---

## ✨ Features

- **🚀 Instant URL Shortening**: Create concise, shareable links in seconds.
- **🎨 Glassmorphism UI**: A stunning, modern design for a premium user experience.
- **🛡️ Secure Access**: JWT-based authentication for user registration and login.
- **📊 Analytics Dashboard**: Track who's clicking your links and when.
- **🔗 Reliable Redirection**: Fast and dependable redirect system built with Spring Boot.
- **📱 Fully Responsive**: Seamless experience across mobile and desktop devices.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 4.0.3
- **Language**: Java 17
- **Database**: MySQL / JPA Hibernate
- **Security**: JWT (JSON Web Token)
- **Tooling**: Maven

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Custom Design System)
- **Navigation**: React Router 7
- **API Interaction**: Axios
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
- [Java 17+](https://adoptium.net/)
- [Node.js 18+](https://nodejs.org/)
- [MySQL 8+](https://www.mysql.com/)
- [Maven](https://maven.apache.org/download.cgi)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/madeshwari/Linkyfy.git
   cd url-shortener
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd url-shortener-sb
     ```
   - Configure your MySQL settings in `src/main/resources/application.properties`.
   - Run the Spring Boot application:
     ```bash
     mvn spring-boot:run
     ```

3. **Frontend Setup**:
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

---

## 📸 Screenshots

*(Add your screenshots here)*

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Linkyfy - Making the web shorter and more beautiful.*
