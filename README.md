# Kallakurichi Constituency Digital Office (TVK Project)

A modern full-stack web application for the **Kallakurichi Assembly Constituency Digital Office**, empowering citizens with public service management, appointment booking, volunteer registration, live news updates, and an admin management dashboard.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/) (optional, if cloning)

---

### 📥 1. Installation

If you downloaded the **ZIP file** from GitHub, extract the ZIP folder to your computer.

Open a terminal (or Command Prompt) and install dependencies for both the frontend and backend:

#### Frontend Dependencies:
```bash
cd frontend
npm install
```

#### Backend Dependencies:
```bash
cd backend
npm install
```

---

### 🏃 2. Running the Application

#### Option A: One-Click Startup (Windows)
Double-click `start_project.bat` in the root folder. It will automatically launch the backend server, frontend app, and open `http://localhost:5173/` in your browser.

#### Option B: Manual Startup

1. **Start Backend API Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *(Backend runs on `http://localhost:5000`)*

2. **Start Frontend Web App** (in a separate terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   *(Frontend runs on `http://localhost:5173`)*

3. Open your browser and navigate to:
   **`http://localhost:5173/`**

---

## ✨ Key Features

### 🏛️ Citizen Portal
- **Hero Banner Carousel**: High-resolution image slider showcasing constituency highlights.
- **MLA Profile & Bio**: Representative details, education, and development goals.
- **Book Appointment**: Instant appointment booking system with reference ID tracking.
- **Volunteer Portal & ID Card Generator**: Digital membership registration with instant downloadable ID cards.
- **Live News & Daily Works**: Real-time media announcements and completed constituency works gallery.
- **Interactive AI Assistant**: Floating chatbot helper for quick answers and guidance.

### 🔐 Admin Portal (`/admin`)
- Accessible via `/admin`.
- **Default Credentials**: Username: `admin` | Password: `password1207`
- **Dashboard Features**:
  - Banner & Slide Carousel Management.
  - Media & Live News Publisher.
  - Appointment Approval & Time Slot Management.
  - Volunteer Application Review & Remarks.
  - Admins Management & Account Settings.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React Icons, React Router v7, HTML2Canvas & jsPDF (ID Card export)
- **Backend**: Node.js, Express.js, MySQL (with JSON storage fallback)
- **Styling & Motion**: Custom Tailwind CSS animations, responsive cross-browser layout support.
