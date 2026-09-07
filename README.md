# Intrakraft Assignment — Full-Stack Catalogue, Cart & Grade Ratio System

🌐 **Live Working Application**: [https://intrakraft.vercel.app/](https://intrakraft.vercel.app/)  
📦 **GitHub Repository**: [https://github.com/AkashV-V/Intrakraft_Assignment](https://github.com/AkashV-V/Intrakraft_Assignment)

---

## 📐 Grade-Wise Ratio Approach

The application manages grade-wise size distribution across inventory items using an Object-Oriented Service (`GradeRatioEngine.js`):

1. **Known Size Order Indexing Algorithm**:
   - Maintains a canonical data structure array (`SIZE_ORDER`) covering standard size notation (XXS to 4XL, Kids age brackets, numeric waist sizes 28-46).
   - Unrecognized sizes maintain their catalogue file order.

2. **Dynamic Multi-Level Grouping**:
   - Products in the Cart are grouped dynamically based on selected attribute levels:
     - `Brick` (e.g. *Shirts*, *Jeans*)
     - `Category` (e.g. *Formalwear*, *Casualwear*)
     - `Brick + Neck` (e.g. *Shirts / Collar*)
     - `Brick + Sleeve` (e.g. *T-Shirts / Half Sleeve*)
   - Distinct groups are created per `(GroupKey, Grade)` combination (e.g., *Shirts / Collar | Grade A* vs *Shirts / Collar | Grade B*).

3. **Ratio Calculation & Multiplier Algorithm**:
   - Each `(GroupKey, Grade)` combination accepts a size-to-multiplier mapping.
   - For every product matching that group key and grade, the final size quantity is computed as:  
     $$\text{Quantity}(\text{size}) = \text{Ratio}(\text{size}) \times \text{Sets}$$
   - Quantities are stored in MongoDB (`CartItem` schema) and updated server-side or synced via REST API (`POST /api/ratios/apply`).

---

## 🛠️ Brief Setup & Run Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas)

### Local Execution

```bash
# 1. Clone the repository
git clone https://github.com/AkashV-V/Intrakraft_Assignment.git
cd Intrakraft_Assignment

# 2. Install dependencies
npm install

# 3. Create .env file (or use existing)
cp .env.example .env

# 4. Start the Express REST API server & Web Client
npm start
```
Open `http://localhost:5050` in your browser.

### Run CLI Database & Tooling Suite
```bash
# Run automated CLI test suite for MongoDB, JWT Auth, and Ratio Calculations
node new.js
```

---

## 📊 REST API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User signup with bcrypt hashed password |
| `POST` | `/api/auth/login` | User login & JWT token issuance |
| `GET`  | `/api/products` | Fetch catalogue products from MongoDB |
| `POST` | `/api/products/batch` | Batch upsert products from Excel / JSON |
| `DELETE`| `/api/products` | Clear products collection in MongoDB |
| `GET`  | `/api/cart` | Get cart items with computed line totals |
| `POST` | `/api/cart/sync` | Sync client cart state to MongoDB |
| `DELETE`| `/api/cart` | Clear cart collection in MongoDB |
| `POST` | `/api/ratios/apply` | Apply grade ratio rules across cart items |
| `GET`  | `/api/tools/db-stats` | Fetch collection stats & database status |
| `POST` | `/api/tools/seed` | Seed sample catalogue data into MongoDB |
