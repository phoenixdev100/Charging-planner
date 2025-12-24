<div align="center">

# ⚡ EV Charging Planner

### *Intelligent Electric Vehicle Charging Infrastructure Planning System*

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.22.1-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Database Seeding](#-database-seeding)

---

<div align="center">

## 🎯 Overview

</div>

The **EV Charging Planner** is a comprehensive web application designed to optimize the planning, deployment, and management of electric vehicle charging infrastructure. This system provides intelligent route planning, cost analysis, charger management, and data visualization tools to support the growing EV ecosystem.

### Key Capabilities

- 🗺️ **Smart Route Planning** - Optimize charging station placement and route planning
- 💰 **Cost Analysis** - Detailed cost calculations and financial projections
- 📊 **Data Visualization** - Interactive charts and maps for infrastructure insights
- 🔌 **Charger Management** - Comprehensive charger inventory and monitoring
- 🚗 **Vehicle Management** - EV fleet and vehicle database management
- 📈 **Report Generation** - Automated PDF reports and analytics
- 🔐 **Authentication** - Secure user authentication and authorization

---

<div align="center">

## ✨ Features

</div>

### 🎨 Frontend Features

- **Modern UI/UX** - Built with Material-UI (MUI) for a premium user experience
- **Interactive Maps** - Leaflet and React Simple Maps integration for geographic visualization
- **3D Visualizations** - Three.js and React Three Fiber for immersive data representation
- **Real-time Updates** - React Query for efficient data fetching and caching
- **Responsive Design** - Mobile-first approach with full responsive support
- **Form Management** - React Hook Form for efficient form handling
- **Toast Notifications** - User-friendly feedback with React Toastify

### 🔧 Backend Features

- **RESTful API** - Clean and well-structured API endpoints
- **Database Management** - MongoDB with Mongoose ODM
- **Security** - Helmet.js for security headers, bcrypt for password hashing
- **Authentication** - JWT-based authentication system
- **File Upload** - Multer for handling file uploads
- **PDF Generation** - PDFKit for generating reports
- **Email Service** - Nodemailer for email notifications
- **Real-time Communication** - Socket.io for live updates
- **Compression** - Response compression for optimized performance

---

<div align="center">

## 🛠️ Tech Stack

</div>

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Material-UI | 5.11.10 | Component Library |
| React Router | 6.8.1 | Routing |
| Axios | 1.3.4 | HTTP Client |
| React Query | 4.24.0 | Data Fetching & Caching |
| Leaflet | 1.9.3 | Map Visualization |
| Three.js | 0.153.0 | 3D Graphics |
| Recharts | 2.6.0 | Charts & Graphs |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | Runtime Environment |
| Express | 4.22.1 | Web Framework |
| MongoDB | Latest | Database |
| Mongoose | 7.8.8 | ODM |
| JWT | 9.0.3 | Authentication |
| Socket.io | 4.8.3 | Real-time Communication |
| PDFKit | 0.13.0 | PDF Generation |
| Helmet | 7.2.0 | Security |

---

<div align="center">

## 🚀 Installation

</div>

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js

### Step 1: Clone the Repository

```bash
git clone https://github.com/phoenixdev100/Charging-planner.git
cd Charging-planner
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

<div align="center">

## ⚙️ Configuration

</div>

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ev-charging-planner
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000

# API Keys
UTILITY_API_KEY=your_utility_api_key
VENDOR_API_KEY=your_vendor_api_key
MATTERPORT_API_KEY=your_matterport_api_key
MAPBOX_TOKEN=your_mapbox_token

# Utility API Endpoints
UTILITY_API_MSEDCL=https://utility-api.example.com/msedcl
UTILITY_API_BSES=https://utility-api.example.com/bses
UTILITY_API_BESCOM=https://utility-api.example.com/bescom
UTILITY_API_PGE=https://utility-api.example.com/pge
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api

REACT_APP_MAPBOX_TOKEN=your_mapbox_token

REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

PORT=3000
```

---

<div align="center">

## 🏃 Running the Application

</div>

### Option 1: Run Backend and Frontend Separately

#### Start the Backend Server

```bash
cd backend
npm start
# Or for development with auto-reload:
npm run dev
```

The backend server will start at `http://localhost:5000`

#### Start the Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will start at `http://localhost:3000`

### Option 2: Run Both Concurrently

You can use a tool like `concurrently` to run both servers simultaneously:

```bash
# Install concurrently globally (one-time)
npm install -g concurrently

# From the root directory
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

<div align="center">

## 🌱 Database Seeding

</div>

To populate the database with initial data:

### Development Environment

```bash
cd backend
npm run seed:dev
```

### Production Environment

```bash
cd backend
npm run seed:prod
```

### Custom Seeding

```bash
cd backend
node seed.js
```

The seed script will populate:
- Sample charging stations
- Vehicle models and specifications
- Regional data
- Cost templates
- User accounts (admin and test users)

---

<div align="center">

## 🙏 Acknowledgments

</div>

- Material-UI for the beautiful component library
- MongoDB for the robust database solution
- The React and Node.js communities for excellent tools and resources
- All contributors who help improve this project

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ for a sustainable EV future**

</div>