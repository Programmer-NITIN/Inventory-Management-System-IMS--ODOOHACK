# 🏭 CoreInventory — Inventory Management System

<div align="center">

![CoreInventory](https://img.shields.io/badge/CoreInventory-v1.0-7c3aed?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjN2MzYWVkIi8+PHRleHQgeD0iMTIiIHk9IjE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkM8L3RleHQ+PC9zdmc+)
![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express.js-000?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

**A modern, full-stack Inventory Management System built for real warehouse operations.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference)

</div>

---

## ✨ Features

### 📦 Core Operations
- **Receipts** — Create and validate incoming stock orders
- **Delivery Orders** — Full Pick → Pack → Validate workflow with automatic stock reduction
- **Internal Transfers** — Move goods between warehouses and locations
- **Stock Adjustments** — Reconcile system stock with physical counts

### 📊 Dashboard & Analytics (Manager)
- KPI cards (total products, low stock, out of stock, pending operations)
- Pie chart — Inventory distribution by category
- Bar chart — Warehouse utilization
- Line chart — Stock movement over 30 days
- Low stock alerts with reorder thresholds

### 👥 Role-Based Access
| Feature | Manager | Staff |
|---------|---------|-------|
| Dashboard analytics | ✅ | Quick-access cards |
| Create operations | ✅ | ✅ |
| Validate / Cancel operations | ✅ | ❌ |
| Manage products | ✅ | ✅ |
| Staff approval panel | ✅ | ❌ |
| Warehouse management | ✅ | View only |

### 🎨 Modern UI
- **Glassmorphism** design with frosted glass cards and animated backgrounds
- **Horizontal top navigation** with Odoo-inspired module switching
- **Profile dropdown** in top-right corner
- **Animated splash screen** (once per session)
- **Responsive** — works on desktop and mobile
- **Purple/violet** professional color palette

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4 |
| **Backend** | Express.js, Node.js |
| **Database** | PostgreSQL (14 tables, full schema) |
| **Auth** | Firebase Authentication (Email/Password + Google) |
| **Charts** | Recharts |
| **HTTP** | Axios with interceptors |
| **Security** | Helmet, CORS, Rate Limiting, Firebase Admin SDK |
| **Icons** | React Icons (Heroicons v2) |

---

## 🏗 Architecture

```
CoreInventory/
├── backend/                   # Express.js REST API
│   ├── server.js              # Entry point
│   ├── src/
│   │   ├── app.js             # Express app (middleware, routes)
│   │   ├── config/            # DB, Firebase, env config
│   │   ├── controllers/       # Request handlers (10 controllers)
│   │   ├── middleware/         # Auth, authorization, validation, errors
│   │   ├── models/            # PostgreSQL query layer (10 models)
│   │   ├── routes/            # API route definitions (12 modules)
│   │   ├── services/          # Business logic (receipts, deliveries, transfers, etc.)
│   │   └── utils/             # AppError, pagination
│   ├── migrations/            # SQL schema (3 migration files)
│   └── seeds/                 # Demo data (categories, warehouses, products)
│
├── frontend/                  # Next.js 16 App
│   ├── src/
│   │   ├── app/               # Pages (15 routes)
│   │   │   ├── dashboard/     # Manager analytics / Staff quick-access
│   │   │   ├── products/      # CRUD product catalog
│   │   │   ├── operations/    # Receipts, Deliveries, Transfers, Adjustments
│   │   │   ├── history/       # Stock ledger audit trail
│   │   │   ├── settings/      # Warehouse & location management
│   │   │   ├── profile/       # User profile + staff approval
│   │   │   └── login/         # Auth flow (sign in / sign up / role selection)
│   │   ├── components/        # Layout (TopNavbar, SplashScreen), UI (FilterTabs)
│   │   ├── context/           # AuthContext (Firebase + backend sync)
│   │   ├── lib/               # Firebase client SDK
│   │   └── services/          # Axios API client with token interceptor
│   └── public/                # Static assets
│
└── README.md                  # ← You are here
```

### Database Schema (11 Tables)
```
users ─── receipts ─── receipt_items
  │         │
  │       deliveries ── delivery_items
  │         │
  │       transfers ─── transfer_items
  │         │
  │       adjustments
  │
products ── stock ──── stock_ledger
  │
categories
  │
warehouses ── locations
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **Firebase** project (for authentication)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/CoreInventory.git
cd CoreInventory
```

### 2. Database Setup
```sql
-- In psql or pgAdmin:
CREATE DATABASE coreinventory;
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/coreinventory
CORS_ORIGIN=http://localhost:3000
```

**Firebase Admin SDK** — choose one method:
- **Option A**: Download the service account JSON from Firebase Console → Project Settings → Service Accounts → Generate New Private Key. Save as `backend/src/config/firebase-service-account.json`
- **Option B**: Set environment variables in `.env`:
  ```env
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
  ```

Run migrations & seed data:
```bash
npm run migrate
```

Start the backend:
```bash
npm run dev
# ✅ Database connected
# 🚀 CoreInventory API running on port 5000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `frontend/.env.local` with your Firebase web app config:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

Start the frontend:
```bash
npm run dev
# ▲ Next.js 16 — http://localhost:3000
```

### 5. First Login
1. In Firebase Console → Authentication → Sign-in method → Enable **Email/Password** and **Google**
2. Create a user via the app's Sign Up flow
3. To make yourself a Manager, run:
   ```sql
   UPDATE users SET role = 'manager' WHERE email = 'your@email.com';
   ```
4. Refresh the page — you'll see the full analytics dashboard

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

All authenticated endpoints require: `Authorization: Bearer <firebase-id-token>`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Sync Firebase user to DB |
| GET | `/auth/me` | Get current user |
| GET | `/auth/staff` | List all staff (manager) |
| PUT | `/auth/staff/:id/approve` | Approve staff (manager) |
| PUT | `/auth/staff/:id/remove` | Remove staff access (manager) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (search, pagination) |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

### Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/receipts` | List receipts |
| POST | `/receipts` | Create receipt |
| POST | `/receipts/:id/validate` | Validate receipt (adds stock) |
| POST | `/receipts/:id/cancel` | Cancel receipt |
| GET | `/deliveries` | List delivery orders |
| POST | `/deliveries` | Create delivery order |
| POST | `/deliveries/:id/pick` | Pick items |
| POST | `/deliveries/:id/pack` | Pack items |
| POST | `/deliveries/:id/validate` | Validate delivery (reduces stock) |
| POST | `/deliveries/:id/cancel` | Cancel delivery |
| GET | `/transfers` | List transfers |
| POST | `/transfers` | Create transfer |
| POST | `/transfers/:id/complete` | Complete transfer |
| GET | `/adjustments` | List adjustments |
| POST | `/adjustments` | Create adjustment |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| GET | `/warehouses` | List warehouses |
| POST | `/warehouses` | Create warehouse (manager) |
| GET | `/warehouses/:id/locations` | List locations |
| POST | `/locations` | Create location (manager) |
| GET | `/stock` | Get stock levels |
| GET | `/stock-ledger` | Full audit trail |
| GET | `/dashboard/kpis` | Dashboard KPIs |
| GET | `/dashboard/charts/*` | Chart data endpoints |
| GET | `/dashboard/low-stock` | Low stock alerts |
| GET | `/health` | Health check |

---

## 📁 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `CORS_ORIGIN` | Allowed frontend origin | ✅ |
| `FIREBASE_PROJECT_ID` | Firebase project ID | If no JSON file |
| `FIREBASE_CLIENT_EMAIL` | Firebase admin email | If no JSON file |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | If no JSON file |

### Frontend (`frontend/.env.local`)
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for the OdooHacks Hackathon**

</div>
