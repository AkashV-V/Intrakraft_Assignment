# Intrakraft_Assignment

## Full-Stack Catalogue, Cart & Grade Ratio System

A comprehensive Node.js, Express, MongoDB, and React application designed for managing product catalogues, cart items, size distributions, and grade-wise ratio calculations.

---

## 🛠️ Features & Architectural Highlights

1. **Node.js & Express REST API Backend**:
   - Clean client-server architecture using RESTful principles, HTTP status codes, and standard JSON formats.
   - Authentication & Authorization via JWT tokens and bcrypt password hashing.

2. **MongoDB Integration (Local & Cloud Atlas)**:
   - Mongoose Schemas for `Product`, `CartItem`, `GradeRatio`, and `User`.
   - Built-in `MongoMemoryServer` fallback to run out of the box even without a pre-configured MongoDB service.

3. **Data Structures & Grade Ratio Calculation Engine**:
   - OOP Service (`GradeRatioEngine.js`) handling size ranking, dynamic grouping (by Brick, Category, Brick + Neck, etc.), and grade-wise size quantity distribution calculations.

4. **Interactive CLI & Database Tooling**:
   - Automated CLI test suite (`new.js`) verifying database connections, auth tokens, ratio calculations, and bulk inserts.

5. **Modern Frontend Web App (`index.html`)**:
   - Built with React & Vanilla CSS.
   - Real-time MongoDB connection indicator, Excel file parser, and REST API sync for Catalogue & Cart.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas)

### Installation
```bash
# Clone the repository
git clone https://github.com/AkashV-V/Intrakraft_Assignment.git
cd Intrakraft_Assignment

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and set your MongoDB URI:
```env
PORT=5050
MONGODB_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/catalogue_db?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key
NODE_ENV=development
```

### Running the Application

```bash
# Start the Express REST API Server
npm start

# Run the automated CLI Database & Tooling Suite
npm run tool
# or
node new.js
```

Open your browser and navigate to `http://localhost:5050`.

---

## 📊 API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User signup with hashed password |
| `POST` | `/api/auth/login` | User login & JWT token issuance |
| `GET`  | `/api/products` | Fetch catalogue products with filters |
| `POST` | `/api/products/batch` | Batch upsert products from Excel / JSON |
| `GET`  | `/api/cart` | Get cart items with computed line totals |
| `POST` | `/api/cart/sync` | Sync client cart state to MongoDB |
| `POST` | `/api/ratios/apply` | Apply grade ratio rules across cart items |
| `GET`  | `/api/tools/db-stats` | Fetch collection stats & database status |

---

## 📄 License
ISC License.
