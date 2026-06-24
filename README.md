# Neondra - Wedding Financial & Gift Tracking System

Neondra is a modern, beautifully designed web application built to help families systematically track and manage financial exchanges (Neondra/Salami) and gifts during major life events like weddings. 

Built with a powerful **Next.js** frontend and a robust **NestJS** backend, this system ensures that cultural traditions of financial gift-giving are recorded accurately, making it easy to track who gave what, and calculate reciprocal giving obligations for future events.

## 🌟 Key Features

*   **Family Workspaces**: Create isolated family environments to track members, roles, and relationships.
*   **Wedding & Event Management**: Track major occasions (like Weddings) and break them down into specific events (Mehndi, Barat, Valima, etc.).
*   **Neondra (Transaction) Tracking**: Record cash gifts, physical gifts, and specific "spouse contributions" precisely.
*   **Analytics & Reporting**: View total inflows, outflows, and net balances at a glance with beautiful, interactive dashboards.
*   **Quick Add**: Rapidly log transactions on the fly during busy events.
*   **Premium UI/UX**: Features a state-of-the-art "glassmorphism" design system, dark mode support, and buttery-smooth micro-animations.

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Components**: [shadcn/ui](https://ui.shadcn.com/)
*   **State & Fetching**: React Query, Zustand
*   **Forms**: React Hook Form + Zod

### Backend (API)
*   **Framework**: [NestJS](https://nestjs.com/)
*   **Language**: TypeScript
*   **Database**: PostgreSQL
*   **ORM**: TypeORM
*   **Authentication**: JWT & Passport

---

## 🚀 Getting Started (Local Development)

This project is a monorepo. You will need to run both the frontend and the backend simultaneously.

### Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL running locally

### 1. Database Setup
Create a PostgreSQL database for the application:
```sql
CREATE DATABASE wfgts;
```

### 2. Backend Setup
Navigate to the API directory and install dependencies:
```bash
cd apps/api
npm install
```

Create a `.env` file inside `apps/api` (use `.env.example` as a template):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=wfgts
JWT_SECRET=super-secret-key-change-this
FRONTEND_URL=http://localhost:3000
PORT=3001
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the web directory, and install dependencies:
```bash
cd apps/web
npm install
```

Create a `.env.local` file inside `apps/web`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Open the App
Visit `http://localhost:3000` in your browser. Create an account and start managing your events!

---

## 📦 Deployment

This application is designed to be easily deployable on modern cloud platforms:
*   **Frontend**: Recommended to deploy on [Vercel](https://vercel.com).
*   **Backend**: Recommended to deploy on [Render.com](https://render.com) or [Railway](https://railway.app).
*   **Database**: Recommended to use [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).

## 📄 License
This project is for personal use and is entirely open-source. Feel free to modify and adapt it to your family's needs.
