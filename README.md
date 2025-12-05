# Sterling Loyalty Program Management System

A full-stack web application for managing loyalty points, transactions, promotions, events, and user role permissions.  
Developed as the final project for **CSC309 – Programming on the Web (University of Toronto)**.

---

##  Group Members

| Name | UTORid |
|------|--------|
| Gabriel Lee | leegab10 |
| Shah Kabir | kabirsh7 |
| Wendy Wan | wanwendy |
| Yan Qing Lee | leeyan9 |

---

## Overview

**Sterling** is a comprehensive loyalty program management platform designed to enable businesses to manage customer loyalty with role-based access control, real-time points tracking, and sophisticated promotion management.

### **Key Features**
-  **Purchase & Redemption System** – Customers earn and redeem loyalty points with customizable rates
-  **Point Transfers** – Users can securely transfer points to other users with balance validation
-  **Transaction Management** – Create, adjust, and track all transaction types with full audit trails
-  **Suspicious Activity Detection** – Flag and handle fraudulent transactions automatically
-  **Event Management** – Create time-limited events that grant bonus points to participants
-  **Promotion Engine** – Dynamic promotions with spending requirements, time windows, and bonus point calculations
-  **Role-Based Access Control** – 4 user tiers (Regular, Cashier, Manager, Superuser) with granular permissions
-  **Responsive UI** – Material-UI components optimized for desktop and mobile devices

---

##  Architecture Summary

**Sterling** is built on a **full-stack JavaScript architecture** with **PostgreSQL** as the relational database.

### **Frontend Stack**
- **React 18** (Vite) – Fast, modern UI framework
- **Material-UI (MUI)** – Professional component library
- **Axios** – HTTP client for API communication
- **CSS Modules** – Component-scoped styling

### **Backend Stack**
- **Node.js + Express.js** – RESTful API server
- **Prisma ORM** – Type-safe database access with migrations
- **JWT (jsonwebtoken)** – Stateless authentication & authorization
- **Express Middleware** – Role-based access control layer

### **Database**
- **PostgreSQL** – Production-grade relational database
- **Supabase** – Managed PostgreSQL hosting (production)
- **Prisma Migrations** – Version-controlled schema management
- **pgBouncer** – Connection pooling for production

### **Deployment Architecture**
```
┌─────────────────────────┐
│   Vercel (Vercel CDN)   │
│   Frontend (React)      │
└────────────┬────────────┘
             │ HTTPS
             ↓
┌─────────────────────────┐       ┌──────────────────────┐
│   Railway (Dyno)        │◄─────►│   Supabase           │
│   Backend (Node/Express)│       │   PostgreSQL + Auth  │
└─────────────────────────┘       └──────────────────────┘
```

---

## Production Deployment Instructions

### **Prerequisites**
- GitHub account with repository access
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Git CLI installed locally

### **Step 1: Set Up PostgreSQL Database (Supabase)**

1. Create a new Supabase project at https://supabase.com/dashboard
2. In your project, go to **Settings** → **Database**
3. Copy the **Connection String** (pgBouncer):
   ```
   postgresql://postgres.xxxxx:<PASSWORD>@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. Copy the **Direct Connection URL** (for migrations):
   ```
   postgresql://postgres.xxxxx:<PASSWORD>@aws-0-us-east-1.db.supabase.com:5432/postgres
   ```
5. Store these in a secure location (password manager or vault)

### **Step 2: Deploy Backend (Railway)**

#### 2a. GitHub Setup
1. Push your repository to GitHub (ensure `.env` is in `.gitignore`)
2. Your repository structure should be:
   ```
   Sterling/
   ├── backend/
   ├── frontend/
   └── .gitignore
   ```

#### 2b. Railway Deployment
1. Go to https://railway.app and log in
2. Click **New Project** → **Deploy from GitHub repo**
3. Authorize GitHub and select `Sterling`
4. Railway will detect the monorepo; select the **backend** directory if prompted
5. Once connected, click **Add Variables** and add the following:

   ```env
   DATABASE_URL=postgresql://postgres.xxxxx:<PASSWORD>@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   DIRECT_URL=postgresql://postgres.xxxxx:<PASSWORD>@aws-0-us-east-1.db.supabase.com:5432/postgres
   JWT_SECRET=your-min-32-character-secret-key-change-in-prod
   PORT=3000
   NODE_ENV=production
   ```

   **Important:** Do NOT use quotes around values in Railway's UI

6. Verify `backend/package.json` contains:
   ```json
   {
     "scripts": {
       "start": "node index.js",
       "dev": "nodemon index.js"
     }
   }
   ```

7. Click **Deploy** and wait for build to complete
8. Once deployed, navigate to **Deployments** → copy the **Generated Domain** (e.g., `https://loyaltyprogram-production.up.railway.app`)

#### 2c. Run Database Migrations
1. In Railway dashboard, open **Logs** to verify deployment
2. Database migrations should run automatically via Prisma
3. If migrations don't run automatically:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # Optional: seed demo accounts
   ```

### **Step 3: Deploy Frontend (Vercel)**

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import the GitHub repository `LoyaltyProgram309`
4. Set **Root Directory** to `./frontend`
5. Click **Environment Variables** and add:
   ```env
   VITE_API_URL=https://loyaltyprogram-production.up.railway.app
   ```
6. Click **Deploy**
7. Vercel will provide your **Production URL** (e.g., `https://sterling-loyalty.vercel.app`)

### **Step 4: Update Backend CORS**

Update `backend/index.js` to allow your Vercel frontend:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sterling-loyalty.vercel.app"  // ← Your Vercel URL
  ],
  credentials: true
}));
```

Push this change to GitHub. Railway will automatically redeploy.

### **Step 5: Verify Deployment**

1. Visit your Vercel frontend URL
2. Log in with demo credentials (see section below)
3. Test a transaction flow to verify backend connectivity
4. Check Railway logs for any errors

---

## Local Development Instructions

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/leeyanqing2004/Sterling.git
cd Sterling
```

### **Step 2: Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/loyalty_program"
DIRECT_URL="postgresql://postgres:password@localhost:5432/loyalty_program"
JWT_SECRET="dev-secret-key-at-least-32-chars-long"
PORT=3000
NODE_ENV=development
```

**Option A: Local PostgreSQL**
- Install PostgreSQL locally
- Create database: `createdb loyalty_program`
- Update `.env` with local credentials

**Option B: Supabase (Recommended for testing)**
- Use your Supabase connection URLs
- Ensure you have database access from your IP

Initialize the database:

```bash
npx prisma migrate dev --name init
npx prisma db seed  # Seeds demo accounts
```

Start the backend:

```bash
node index.js 3000
```

✅ Backend runs at: `http://localhost:3000`

### **Step 3: Frontend Setup**

Open a **new terminal** and navigate to the frontend:

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

### **Step 4: Access the Application**

Open your browser:
```
http://localhost:5173
```

---

## Demo Accounts

Use these credentials to test the application across different user roles:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| **Superuser** | superuser | password123 | Full system access |
| **Manager** | manager1 | password123 | View/manage transactions, create adjustments, manage promotions |
| **Cashier** | cashier1 | password123 | Create purchases, process redemptions |
| **Regular User** | user1 | password123 | View own transactions, redeem/transfer points |

**Note:** These accounts are auto-seeded when you run `npx prisma db seed`. If using production Supabase, manually insert these records via the SQL editor.

---

## Third-Party Services & Tools

| Service | Purpose | Documentation |
|---------|---------|----------------|
| **Supabase PostgreSQL** | Production database hosting & auth | https://supabase.com/docs |
| **Railway** | Backend container hosting | https://docs.railway.app |
| **Vercel** | Frontend CDN & hosting | https://vercel.com/docs |
| **Prisma ORM** | Type-safe database access | https://www.prisma.io/docs |
| **jsonwebtoken** | JWT authentication | https://jwt.io |
| **Express.js** | REST API framework | https://expressjs.com |
| **React** | Frontend framework | https://react.dev |
| **Material-UI** | Component library | https://mui.com |
| **Axios** | HTTP client | https://axios-http.com |

---

## API Endpoints

### **Authentication**
```
POST   /auth/login                    Login user
POST   /auth/register                 Register new user
GET    /auth/me                       Get current user
POST   /auth/logout                   Logout user
```

### **Users**
```
GET    /users                         List all users (Manager+)
GET    /users/:id                     Get user by ID
POST   /users                         Create new user (Superuser)
PATCH  /users/:id                     Update user
DELETE /users/:id                     Delete user (Superuser)
```

### **Transactions**
```
GET    /transactions                  List transactions (with filters)
POST   /transactions                  Create transaction (cashier+)
GET    /transactions/:Id              Get transaction details
PATCH  /transactions/:Id              Update transaction (Manager+)
PATCH  /transactions/:Id/suspicious   Flag/unflag suspicious (Manager+)
PATCH  /transactions/:Id/processed    Mark redemption processed (Cashier+)
```

### **Promotions**
```
GET    /promotions                    List all promotions
POST   /promotions                    Create promotion (Manager+)
GET    /promotions/:Id                Get promotion details
PATCH  /promotions/:Id                Update promotion (Manager+)
DELETE /promotions/:Id                Delete promotion (Manager+)
```

### **Events**
```
GET    /events                        List all events
POST   /events                        Create event (Manager+)
GET    /events/:Id                    Get event details
PATCH  /events/:Id                    Update event (Manager+)
DELETE /events/:Id                    Delete event (Manager+)
```

---

## Role-Based Access Control

The system implements **4-tier hierarchical permissions**:

| Feature | Regular | Cashier | Manager | Superuser |
|---------|---------|---------|---------|-----------|
| View own transactions | T | T | T | T |
| Create purchases | F | T | T | T |
| View all transactions | F | F | T | T |
| Create adjustments | F | F | T | T |
| Flag suspicious | F | F | T | T |
| Process redemptions | F | T | T | T |
| Manage promotions | F | F | T | T |
| Manage users | F | F | F | T |

---

## Core Features Explained

### **Points System**
- **Base Earning Rate:** 1 point per $0.25 spent
- **Promotion Bonuses:** Calculated as (spent × promotion.rate) + promotion.points
- **Suspicious Flag:** Fraudulent transactions earn 0 points and deduct existing points
- **Transfers:** Points moved between users with negative balance prevention

### **Transaction Types**
| Type | Description | Who Creates | Points Impact |
|------|-------------|-------------|---------------|
| **Purchase** | Customer buys | Cashier | +earned points |
| **Redemption** | Customer redeems | Cashier | -redeemed points |
| **Adjustment** | Modify transaction | Manager | ±amount |
| **Event** | Bonus points | Manager | +amount |
| **Transfer** | User to user | Customer | Moves between users |

### **Promotion Logic**
- **Time Windows:** Active between startTime and endTime
- **Spending Threshold:** Minimum spend required to apply
- **Types:** "automatic" (applied always) or "one-time" (user selects)
- **Calculation:** Bonus = (spent × rate) + fixed points

---

## 🧪 Testing Workflows

### **Test: Create a Purchase**
1. Log in as **cashier1** (password: `password123`)
2. Navigate to **Create Purchase**
3. Enter customer UTORID: `user1`
4. Amount: `$50.00`
5. Select a promotion from dropdown
6. Add remark (optional): "Q4 promotion bonus"
7. Click **Create Purchase**
8. Verify: User1 points should increase

### **Test: Adjustment**
1. Log in as **manager1**
2. Navigate to **Transactions** → find a purchase
3. Click **Manage** → **Create Adjustment**
4. Amount: `$10.00` (positive or negative)
5. Remark: "Correction for damaged goods"
6. Add promotions if applicable
7. Submit → Original transaction amount updates

### **Test: Suspicious Flag**
1. As **manager1**, select a transaction
2. Click **Mark as Suspicious**
3. Verify: Points deducted from user balance
4. Click **Unmark as Suspicious**
5. Verify: Points restored

### **Test: Point Transfer**
1. Log in as **user1**
2. Navigate to **Transfer Points**
3. Recipient: `user2`
4. Amount: `100 points`
5. Submit → Both users' balances update

---

## Project Structure

```
Sterling/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AllPromotions.jsx
│   │   │   ├── TransactionHistory.jsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── Tables/
│   │   │   │   ├── TransactionTable.jsx
│   │   │   │   ├── PromotionsTable.jsx
│   │   │   │   ├── UserTable.jsx
│   │   │   │   └── ...
│   │   │   ├── Popups/
│   │   │   │   ├── ManageTransactionPopup.jsx
│   │   │   │   ├── RedeemPointsPopup.jsx
│   │   │   │   ├── TransferPointsPopup.jsx
│   │   │   │   ├── CreatePromotionPopup.jsx
│   │   │   │   └── ...
│   │   │   ├── Navigation/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── ...
│   │   │   └── Auth/
│   │   │       ├── LoginPage.jsx
│   │   │       ├── RegisterPage.jsx
│   │   │       └── ...
│   │   ├── utils/
│   │   │   ├── formatField.js
│   │   │   └──
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── routers/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── promotions.js
│   │   ├── users.js
│   │   ├── events.js
│   │   └── ...
│   ├── middleware/
│   │   ├── clearance.js
│   │   ├── auth.js
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       └── [timestamp]_init/
│   ├── index.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Important Notes for Markers

### **Database Management**
- **Reset locally:** `npx prisma migrate reset` (⚠️ deletes all data)
- **View database:** `npx prisma studio` (opens GUI browser editor)
- **Create migration:** `npx prisma migrate dev --name <description>`

### **Security**
- JWT_SECRET must be **min 32 characters** in production
- Never commit `.env` files to Git
- Use environment variable vaults in Railway/Vercel
- pgBouncer connection for production (included in Supabase URL)

### **Debugging**
- **Backend logs:** `Railway → Logs` or local `npm start` output
- **Frontend logs:** Browser DevTools → Console tab
- **Database queries:** `npx prisma studio` for visual inspection
- **Network requests:** Browser DevTools → Network tab

### **Prisma Tips**
- Schema changes require migrations: `npx prisma migrate dev`
- Regenerate Prisma client: `npx prisma generate`
- Auto-format schema: `npx prisma format`

### **Common Issues**

| Issue | Solution |
|-------|----------|
| **"Error: connect ECONNREFUSED"** | Database not running; verify DATABASE_URL |
| **"CORS policy: blocked"** | Check origin URL in backend CORS config |
| **"Prisma client out of sync"** | Run `npx prisma generate` |
| **"pgBouncer connection timeout"** | Use DIRECT_URL for migrations, DATABASE_URL for app |
| **Railway build fails** | Check `npm start` script exists in package.json |

---

## Support & Troubleshooting

For deployment issues:
1. Check Railway/Vercel logs for detailed errors
2. Verify all environment variables are set correctly
3. Ensure database is accessible from deployment region
4. Test locally first before deploying changes

---

## 📝 License

This project is for academic use in **CSC309 – Programming on the Web** at the University of Toronto.

---

**Last Updated:** December 2025  
**Status:** ✅ Production Ready  
**GitHub:** https://github.com/leeyanqing2004/LoyaltyProgram309
