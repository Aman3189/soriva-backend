# 🚀 Soriva Lumos Backend

**Modern, scalable backend API built with Node.js, TypeScript, Express, and PostgreSQL**

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Subscription Plans](#subscription-plans)
- [Development](#development)

---

## ✨ Features

- ✅ **Authentication System** - JWT-based auth with refresh tokens
- ✅ **User Management** - Registration, login, profile management
- ✅ **Subscription Plans** - 6 flexible plans (Vibe Free, Vibe Pro, Spark, Apex, Persona, Episteme)
- ✅ **TypeScript** - Full type safety
- ✅ **Prisma ORM** - Modern database toolkit
- ✅ **Security** - Helmet, CORS, bcrypt password hashing
- ✅ **Modular Architecture** - Clean, scalable code structure
- 🔜 **Chat System** - AI-powered conversations
- 🔜 **Studio System** - Video creation with AI
- 🔜 **Payment Integration** - Stripe for subscriptions

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Security:** Helmet, bcrypt
- **Logging:** Morgan

---

## 📁 Project Structure

```
soriva-backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── constants/
│   │   └── plans.constant.ts  # Subscription plans config
│   ├── controllers/
│   │   └── auth.controller.ts # Auth endpoints logic
│   ├── middleware/
│   │   └── auth.middleware.ts # JWT verification
│   ├── routes/
│   │   ├── auth.routes.ts     # Auth routes
│   │   └── index.routes.ts    # Main router
│   ├── services/
│   │   └── auth.service.ts    # Business logic
│   ├── utils/
│   │   └── jwt.util.ts        # JWT helpers
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soriva-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

Server will start at `http://localhost:5000` 🎉

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/soriva_lumos"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

---

## 📡 API Endpoints

### **Health Check**
- `GET /api/health` - Check API status

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/change-password` - Change password (protected)
- `DELETE /api/auth/account` - Delete account (protected)
- `POST /api/auth/logout` - Logout (protected)

### **Future Endpoints**
- `/api/chat/*` - Chat management
- `/api/studio/*` - Video studio
- `/api/plans/*` - Subscription management

---

## 💳 Subscription Plans

| Plan | Price | Features | Status |
|------|-------|----------|--------|
| **Vibe Free** | Free | Basic chat, 50 chats/month | ✅ Enabled |
| **Vibe Pro** | $19.99/mo | Unlimited chat, advanced AI | ✅ Enabled |
| **Spark** | $49.99/mo | Studio access, 20 videos/mo | ✅ Enabled |
| **Apex** | $149.99/mo | Unlimited videos, 4K quality | 🔒 Disabled |
| **Persona** | $99.99/mo | Custom AI characters | 🔒 Disabled |
| **Episteme** | $299.99/mo | Enterprise knowledge base | ✅ Enabled |

Plans can be enabled/disabled in `src/constants/plans.constant.ts`

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with nodemon

# Build
npm run build            # Compile TypeScript to JavaScript

# Production
npm start                # Run compiled JavaScript

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Development Workflow

1. Create a new branch for your feature
2. Make changes in `src/` directory
3. Test locally with `npm run dev`
4. Run database migrations if schema changed
5. Commit and push changes

---

## 📝 License

This project is private and confidential.

---

## 👨‍💻 Author

**Soriva Team**

---

## 🙏 Acknowledgments

Built with ❤️ using modern TypeScript and Node.js best practices.

---

**Happy Coding! 🚀**