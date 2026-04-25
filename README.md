# CIP — Citizen Interface Portal

A full-stack real-time complaint management system built with Node.js, Express, MongoDB Atlas, Socket.IO, and vanilla JavaScript.

## Features

- **Real-time Dashboard** — Live complaint updates via WebSocket (Socket.IO)
- **JWT Authentication** — Secure login with role-based access (admin, officer, citizen)
- **AI Analysis** — Automatic severity scoring and smart officer assignment
- **Interactive Map** — Leaflet.js map with complaint markers
- **MongoDB Atlas** — Cloud database with authenticated user `vyankateshvjaware9960_db_user`
- **Responsive UI** — Dark theme with glassmorphism design

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI Engine | Rule-based keyword analysis |
| Frontend | Vanilla JS, Leaflet, Socket.IO Client |
| Real-time | WebSocket via Socket.IO |

## Project Structure

```
cip-project/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Business logic
│   ├── middleware/auth.js    # JWT + role middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── services/aiEngine.js  # AI analysis engine
│   ├── server.js             # Express + Socket.IO server
│   └── package.json
├── frontend/
│   ├── components/           # UI components
│   ├── css/styles.css        # Dark theme styling
│   ├── js/                   # App logic, API, state, map, simulation
│   └── index.html
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT token

### Complaints (all require Bearer token)
- `GET /api/complaints` — List all complaints
- `POST /api/complaints` — Create new complaint
- `PUT /api/complaints/:id` — Update complaint status
- `DELETE /api/complaints/:id` — Delete complaint (admin only)

### Health
- `GET /api/health` — Server health check

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `complaintCreated` | Server → Client | New complaint added |
| `complaintUpdated` | Server → Client | Complaint status changed |
| `complaintDeleted` | Server → Client | Complaint removed |

## Getting Started

### Backend
```bash
cd backend
npm install
npx nodemon server.js
```

### Frontend
Open `frontend/index.html` in your browser.

## Environment Variables

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://vyankateshvjaware9960_db_user:<password>@cluster1.eff0zrn.mongodb.net/cip?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
```

## License

ISC

