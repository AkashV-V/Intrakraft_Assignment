/**
 * Catalogue & Grade Ratio MongoDB Tooling & CLI Suite
 * Demonstrates:
 * 1. MongoDB Database Connection & Schema Validation
 * 2. REST API & Data Structures / Algorithms Execution
 * 3. Seeding Sample Products & Grade Ratios
 * 4. User Registration & JWT Authentication Flow
 */

require('dotenv').config();
const dbManager = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const CartItem = require('./models/CartItem');
const GradeRatio = require('./models/GradeRatio');
const ratioEngine = require('./services/GradeRatioEngine');
const sampleProducts = require('./tools/seedData');

async function runCliSuite() {
  console.log('\n======================================================');
  console.log('🛠️   CATALOGUE & MONGO DB INTEGRATION TOOL SUITE   🛠️');
  console.log('======================================================\n');

  // Step 1: Connect to MongoDB
  console.log('▶ [1/5] Initializing MongoDB Connection...');
  const conn = await dbManager.connect();
  console.log(`✓ Connected to Database! Host: ${conn.host}, Type: ${conn.connectionType}`);

  // Step 2: Seed Sample Products
  console.log('\n▶ [2/5] Seeding Products Collection in MongoDB...');
  await Product.deleteMany({});
  const insertedProducts = await Product.insertMany(sampleProducts);
  console.log(`✓ Inserted ${insertedProducts.length} sample products into MongoDB:`);
  insertedProducts.forEach((p, i) => {
    console.log(`   ${i + 1}. [${p.styleCode}] ${p.styleName} (${p.colourName}) - ₹${p.mrp} - Sizes: [${p.sizes.join(', ')}]`);
  });

  // Step 3: Test User Creation & JWT Auth
  console.log('\n▶ [3/5] Testing User Authentication & Password Hashing...');
  await User.deleteMany({});
  const testUser = new User({
    username: 'akash_dev',
    email: 'akash@example.com',
    password: 'SecurePassword123',
    role: 'admin',
  });
  await testUser.save();
  const token = testUser.getSignedJwtToken();
  console.log(`✓ Created Admin User: ${testUser.username} (${testUser.email})`);
  console.log(`✓ Password Hashed in DB: ${testUser.password.substring(0, 25)}...`);
  console.log(`✓ Generated JWT Auth Token: ${token.substring(0, 35)}...`);

  // Step 4: Data Structures & Grade Ratio Calculation Engine Test
  console.log('\n▶ [4/5] Testing OOP Grade Ratio Calculation Engine...');
  const sampleCart = [
    {
      productKey: 'SHIRT-OXFORD-01__Blue',
      grade: 'A',
      sets: 2,
      sizeQty: {},
    },
    {
      productKey: 'SHIRT-OXFORD-01__Blue',
      grade: 'B',
      sets: 1,
      sizeQty: {},
    },
  ];

  const productMap = new Map();
  insertedProducts.forEach((p) => productMap.set(p.productKey, p));

  const ratioRules = {
    'Brick||Shirts||A': { S: 1, M: 2, L: 2, XL: 1, XXL: 0 },
    'Brick||Shirts||B': { S: 2, M: 2, L: 1, XL: 1, XXL: 0 },
  };

  const calculatedCart = ratioEngine.applyRatiosToCart(sampleCart, productMap, ratioRules, 'Brick');

  console.log('✓ Grade Ratio Calculation Results (Applied to Cart):');
  calculatedCart.forEach((item) => {
    const product = productMap.get(item.productKey);
    console.log(`   • Style: ${product.styleName} | Grade: ${item.grade} | Sets: ${item.sets}`);
    console.log(`     Quantities per Size:`, item.sizeQty);
  });

  // Step 5: Save Cart to MongoDB
  console.log('\n▶ [5/5] Saving Cart Items to MongoDB Database...');
  await CartItem.deleteMany({});
  const cartDocs = calculatedCart.map((item) => ({
    sessionId: 'cli_session_1',
    productKey: item.productKey,
    grade: item.grade,
    sets: item.sets,
    sizeQty: item.sizeQty,
  }));
  await CartItem.insertMany(cartDocs);
  const totalInDb = await CartItem.countDocuments();
  console.log(`✓ Successfully saved ${totalInDb} cart items in MongoDB!`);

  console.log('\n======================================================');
  console.log('✅ MONGO DB TOOLS & ALGORITHM SUITE PASSED SUCCESSFULLY');
  console.log('======================================================\n');

  // Disconnect cleanly if running as standalone CLI script
  if (require.main === module) {
    await dbManager.disconnect();
    process.exit(0);
  }
}

if (require.main === module) {
  runCliSuite().catch((err) => {
    console.error('❌ CLI Tool Error:', err);
    process.exit(1);
  });
}

module.exports = { runCliSuite };
