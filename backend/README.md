# CDO Constituency Digital Office Backend Service

This is the Node.js Express backend service connecting to a MySQL database, designed for the Kallakurichi Constituency Digital Office website. It manages all dynamic data tables and integrates cleanly with the frontend with built-in localStorage offline fallbacks.

---

## 🛠️ Prerequisites

1. **Node.js**: Verify installation using `node -v`.
2. **MySQL Server**: Ensure your local MySQL instance (e.g., via XAMPP, WAMP, or standalone installer) is running on port `3306`.

---

## 🚀 Getting Started

### 1. Configuration (`.env`)
The database connection variables are stored in the `.env` file at the root of the `backend` folder. By default, it is configured for a standard local development environment:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kallakurichi_cdo
```

*Change the credentials in `.env` if your local MySQL instance has a custom password or username.*

### 2. Install Dependencies
Run the following command from the `backend` directory to install node modules:
```bash
npm install
```

### 3. Initialize & Seed Database
Initialize the database and tables, and populate them with the default website datasets:
```bash
npm run db:setup
```
This runs the `database/dbSetup.js` utility, which automatically:
- Creates the `kallakurichi_cdo` database if it doesn't exist.
- Creates all required tables (`mla_data`, `daily_updates`, `events`, `grievances`, `hero_slides`, `live_news`, `volunteer_slides`, `appointments`, `volunteers`, `volunteer_photos`, `admins`).
- Populates all tables with the default website seed data (such as the default MLA profile, upcoming events, daily updates, news feeds, and default admin login).

### 4. Run the Server
Start the development server with automatic file restart on changes:
```bash
npm run dev
```
Alternatively, for production execution:
```bash
npm start
```
The server will boot up at `http://localhost:5000`.

---

## 📂 API Endpoint Routes

The backend serves the following REST API resources prefixed with `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/mla-data` | Fetch MLA profile info |
| **PUT** | `/api/mla-data` | Edit MLA profile info |
| **GET** | `/api/daily-updates` | Fetch all completed works/updates |
| **POST** | `/api/daily-updates` | Add a new completed work/update |
| **GET** | `/api/events` | Fetch all meetings and events |
| **POST** | `/api/events` | Add a new meeting/event |
| **POST** | `/api/events/:id/attend` | Increment RSVPs for an event |
| **GET** | `/api/grievances` | Fetch all public grievances |
| **POST** | `/api/grievances` | Submit a public grievance |
| **PUT** | `/api/grievances/:id` | Update grievance status & admin remarks |
| **GET** | `/api/appointments` | Fetch appointments list |
| **POST** | `/api/appointments` | Book an appointment |
| **PUT** | `/api/appointments/:id` | Update appointment status & admin remarks |
| **GET** | `/api/volunteers` | Fetch volunteers list |
| **POST** | `/api/volunteers` | Register a new volunteer |
| **GET** | `/api/volunteer-photos` | Fetch volunteer photo uploads |
| **POST** | `/api/volunteer-photos` | Upload a volunteer photo |
| **POST** | `/api/admins/login` | Authenticate admin credentials |
| **PUT** | `/api/admins` | Synchronize/update admin list |
| **GET** | `/api/health` | API service health check |

---

## 💡 Offline-First / Graceful Fallback design
The frontend React application utilizes a custom API client (`CDO/citizen/src/services/api.js`) which automatically handles backend connection errors. 

If the backend server is offline or fails to load, the frontend **seamlessly falls back to localStorage**, ensuring that user actions (submitting grievances, appointments, RSVPs) still store successfully in the browser cache, and seed data is displayed without any crashes! When the backend becomes online, saving actions sync directly to the MySQL database.
