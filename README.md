# LeafBid

## Project Description
LeafBid is a web-based real-time auction platform for rare and collectible plants. It replaces unreliable social media auctions with a secure, structured marketplace that prevents bidding disputes, eliminates time sync errors, and ensures plant authenticity through an expert verification process.

---

## System Architecture

- **Architecture Style:** Real-time Client-Server
- **Communication:** REST APIs + WebSockets (Socket.io)
- **Database:** PostgreSQL

### High-Level Flow
1. React frontend displays active plant auctions.
2. Node.js + Express backend handles API requests.
3. Socket.io broadcasts live bid updates to all connected clients.
4. PostgreSQL stores users, plants, auctions, and bid history.

### Project Structure
```
LeafBid/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  └─ server.js
│  └─ .env.example
└─ frontend/
   └─ src/
      ├─ components/
      ├─ hooks/
      ├─ pages/
      └─ App.jsx
```

---

## User Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Buyer** | Rare plant collector | Browse listings, place real-time bids, view bid history, manage personal info |
| **Seller** | Garden owner / plant seller | Create and manage plant listings, upload images, set auction timers, view sales |
| **Admin** | Plant expert / moderator | Access admin dashboard, approve or reject pending listings, oversee platform activity |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), Tailwind CSS |
| Backend | Node.js, Express |
| Real-Time Engine | Socket.io |
| Database | PostgreSQL |

---

## Installation & Setup

### Prerequisites
- Node.js v18+
- PostgreSQL

### 1. Clone the repository
```bash
git clone https://github.com/your-username/LeafBid.git
cd LeafBid
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in your DATABASE_URL and PORT
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
```

---

## How to Run

### Start the backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Start the frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## Screenshots

> UI is currently in development. Screenshots will be added in a future update.
