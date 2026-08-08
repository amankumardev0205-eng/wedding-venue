# WedVenue - Technical Documentation

# 1. Project Overview

## Project Name
WedVenue

## Project Type
Full Stack MERN Application

## Purpose
WedVenue is a wedding venue discovery and booking platform where users can:
- Search venues across cities
- Compare venues
- Send booking inquiries
- Save favorite venues

Venue organizers can:
- Add/manage venues
- Handle inquiries
- Upload venue images

Admins can:
- Moderate platform activity
- Manage users and organizers

---

# 2. Tech Stack Overview

# Frontend Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend library |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| React Router DOM | Routing |
| Axios | API requests |
| React Hook Form | Form handling |
| Zod/Yup | Validation |
| Framer Motion | Animations |
| Swiper.js | Image sliders |
| React Icons | Icons |

---

# Backend Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Backend framework |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| Multer | File upload |
| Helmet | Security headers |
| CORS | Cross-origin handling |
| express-rate-limit | API rate limiting |

---

# Database Stack

| Technology | Purpose |
|---|---|
| Firebase Firestore | NoSQL database |
| Firestore model wrapper | Backend object mapping for Firestore |

---

# Cloud Services

| Service | Purpose |
|---|---|
| Firebase Storage | Image storage |
| Firebase Firestore | Cloud database |
| Firebase Hosting | Frontend deployment |
| Firebase Cloud Functions | Backend deployment |

---

# 3. System Architecture

```text id="snqv54"
Frontend (React + Vite)
        ↓
REST API (Express.js)
        ↓
Firebase Firestore
        ↓
Firebase Storage