# WedVenue - Setup & Installation

## Prerequisites
- Node.js (v16 or higher)
- Firebase project with Firestore and Storage enabled
- npm or yarn

## Database Setup (Firebase Firestore)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable Firestore in your project and choose either production or test mode
3. Enable Firebase Storage and create a storage bucket
4. Generate a Firebase service account key from Project Settings > Service accounts
5. Add your Firebase credentials to `backend/.env`:
   ```
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your Firebase credentials and JWT secret

5. Start development server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints (Phase 1 Complete)

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout user (Protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token

### Venue Routes
- `GET /api/venues` - Get all venues with search/filters
- `GET /api/venues/:id` - Get venue by ID
- `GET /api/venues/city/:city` - Get venues by city
- `POST /api/venues` - Create venue (Organizer only)
- `PUT /api/venues/:id` - Update venue (Organizer only)
- `DELETE /api/venues/:id` - Delete venue (Organizer only)

### Inquiry Routes
- `POST /api/inquiries` - Create inquiry (Customer only)
- `GET /api/inquiries` - Get inquiries (Role-based)
- `GET /api/inquiries/:id` - Get inquiry by ID
- `PUT /api/inquiries/:id/status` - Update inquiry status (Organizer/Admin)
- `PUT /api/inquiries/:id/mark-unavailable` - Mark date unavailable (Organizer)

### Favorites Routes
- `POST /api/favorites/:venueId` - Add to favorites
- `DELETE /api/favorites/:venueId` - Remove from favorites
- `GET /api/favorites` - Get all favorites
- `GET /api/favorites/:venueId` - Check if venue is favorite

### Review Routes
- `POST /api/reviews` - Create review (Customer only)
- `GET /api/reviews/venue/:venueId` - Get reviews for venue
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review (Owner only)
- `DELETE /api/reviews/:id` - Delete review (Owner/Admin)
- `PUT /api/reviews/:id/reply` - Add organizer reply (Organizer/Admin)
- `PUT /api/reviews/:id/helpful` - Mark review helpful

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── seedVenues.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Venue.js
│   │   │   ├── Inquiry.js
│   │   │   └── Review.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── venues.js
│   │   │   ├── inquiries.js
│   │   │   ├── favorites.js
│   │   │   └── reviews.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── venueController.js
│   │   │   ├── inquiryController.js
│   │   │   ├── favoritesController.js
│   │   │   └── reviewController.js
│   │   └── server.js
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Venues.jsx
│   │   │   ├── VenueDetails.jsx
│   │   │   ├── SendInquiry.jsx
│   │   │   ├── MyInquiries.jsx
│   │   │   ├── InquiryManagement.jsx
│   │   │   └── Favorites.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── VenueCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   ├── venueSlice.js
│   │   │   ├── inquirySlice.js
│   │   │   └── favoritesSlice.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── prd.md
├── tech.md
├── todo.md
└── README.md
```

## Testing the Application

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend server: `cd frontend && npm run dev`
3. Open `http://localhost:5173` in your browser
4. Register as a customer or organizer
5. Browse venues, add to favorites, send inquiries
6. Test organizer features by registering as organizer role

## Next Steps

- Phase 2: Organizer Dashboard with venue management
- Phase 2: Reviews & Ratings UI
- Phase 2: Admin Dashboard
- Phase 3: Deployment to production
