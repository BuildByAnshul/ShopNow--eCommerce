require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const PRODUCTS = [
  {
    name: 'Rose & Vitamin C Face Serum',
    description: 'A luxurious brightening serum infused with pure Bulgarian rose water and stabilized Vitamin C. Reduces dark spots, boosts radiance, and deeply hydrates your skin.',
    price: 1499,
    category: 'skincare',
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80',
      'https://images.unsplash.com/photo-1611078500223-93fb428ce0a9?w=800&q=80',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80'
    ],
    stock: 50,
    featured: true,
  },
  {
    name: 'Argan & Shea Moisturizing Cream',
    description: 'Rich botanical moisturizer with cold-pressed argan oil and organic shea butter. Locks in moisture for 24 hours with a silky, non-greasy finish.',
    price: 899,
    category: 'skincare',
    images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80'],
    stock: 80,
    featured: true,
  },
  {
    name: 'Hibiscus & Coconut Hair Oil',
    description: 'A deeply nourishing hair oil made from cold-pressed coconut oil and hibiscus extract. Promotes hair growth, reduces breakage, and adds brilliant shine.',
    price: 649,
    category: 'haircare',
    images: ['https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80'],
    stock: 60,
    featured: true,
  },
  {
    name: 'Lavender & Chamomile Sleep Mist',
    description: 'A calming pillow and room mist with pure lavender and chamomile essential oils. Promotes deep, restful sleep and melts away the day\'s stress.',
    price: 799,
    category: 'aromatherapy',
    images: ['https://images.unsplash.com/photo-1602928309195-9ff5a71fa7a2?w=800&q=80'],
    stock: 45,
    featured: true,
  },
  {
    name: 'Ashwagandha Stress Relief Capsules',
    description: 'Premium KSM-66 Ashwagandha root extract capsules. Clinically proven to reduce cortisol levels, enhance energy, and support cognitive function.',
    price: 1299,
    category: 'supplements',
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80'],
    stock: 100,
    featured: false,
  },
  {
    name: 'Neem & Tea Tree Purifying Toner',
    description: 'An alcohol-free, pore-minimizing toner with neem leaf extract and tea tree oil. Controls excess oil, clears acne-causing bacteria, and brightens complexion.',
    price: 549,
    category: 'skincare',
    images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80'],
    stock: 70,
    featured: false,
  },
  {
    name: 'Eucalyptus Shower Steamer Set',
    description: 'A set of 6 handcrafted shower steamers with pure eucalyptus and mint essential oils. Transform your daily shower into a spa-like aromatherapy experience.',
    price: 999,
    category: 'aromatherapy',
    images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80'],
    stock: 30,
    featured: true,
  },
  {
    name: 'Amla & Bhringraj Hair Mask',
    description: 'A deeply conditioning hair mask with Amla berry and Bhringraj herb. Repairs damaged hair, strengthens roots, and restores lustrous shine.',
    price: 749,
    category: 'haircare',
    images: ['https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80'],
    stock: 55,
    featured: false,
  },
  {
    name: 'Soy & Beeswax Botanical Candle',
    description: 'Hand-poured scented candle with natural soy wax, pure beeswax, and botanical essential oil blend. Burns cleanly for 45+ hours.',
    price: 1199,
    category: 'home',
    images: ['https://images.unsplash.com/photo-1602928309048-0b1f249b4f90?w=800&q=80'],
    stock: 25,
    featured: false,
  },
  {
    name: 'Turmeric & Sandalwood Glow Mask',
    description: 'A weekly brightening ritual mask with organic turmeric, sandalwood powder, and kaolin clay. Visibly brightens, detoxifies, and evens skin tone.',
    price: 849,
    category: 'skincare',
    images: ['https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&q=80'],
    stock: 40,
    featured: false,
  },
  {
    name: 'Rosehip & Vitamin E Lip Balm',
    description: 'Deeply moisturizing lip balm with cold-pressed rosehip seed oil and vitamin E.',
    price: 399,
    category: 'skincare',
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80'],
    stock: 65,
    featured: true,
  },
  {
    name: 'Sandalwood & Vetiver Essential Oil',
    description: 'Pure therapeutic-grade essential oil blend for grounding and meditation.',
    price: 1299,
    category: 'aromatherapy',
    images: ['https://images.unsplash.com/photo-1595425970377-c9703c486558?w=800&q=80'],
    stock: 15,
    featured: true,
  },
  {
    name: 'Rose Quartz Face Roller',
    description: 'Natural rose quartz facial roller to reduce puffiness and promote lymphatic drainage.',
    price: 899,
    category: 'wellness',
    images: ['https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80'],
    stock: 25,
    featured: false,
  },
  {
    name: 'Himalayan Pink Salt Bath Soak',
    description: 'Detoxifying bath salts infused with dried rose petals and ylang-ylang essential oil.',
    price: 599,
    category: 'wellness',
    images: ['https://images.unsplash.com/photo-1616172605634-60e5883ce61a?w=800&q=80'],
    stock: 40,
    featured: false,
  },
  {
    name: 'Green Tea & Aloe Vera Soothing Gel',
    description: 'Lightweight, cooling gel that hydrates and calms irritated skin instantly.',
    price: 449,
    category: 'skincare',
    images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80'],
    stock: 80,
    featured: false,
  },
  {
    name: 'Activated Charcoal Face Cleanser',
    description: 'Deep cleansing facial cleanser with activated charcoal and clay. Removes impurities and balances skin.',
    price: 649,
    category: 'skincare',
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80',
      'https://images.unsplash.com/photo-1611078500223-93fb428ce0a9?w=800&q=80'
    ],
    stock: 70,
    featured: true,
  },
  {
    name: 'Brahmi & Shikakai Natural Shampoo',
    description: 'Ancient Ayurvedic herb shampoo that cleanses without harsh chemicals. Nourishes scalp and strengthens hair.',
    price: 549,
    category: 'haircare',
    images: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
      'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80'
    ],
    stock: 55,
    featured: false,
  },
  {
    name: 'Peppermint Foot Soak & Scrub',
    description: 'Refreshing foot soak with peppermint, eucalyptus and Dead Sea salt. Relaxing and revitalizing.',
    price: 799,
    category: 'wellness',
    images: [
      'https://images.unsplash.com/photo-1602928309195-9ff5a71fa7a2?w=800&q=80',
      'https://images.unsplash.com/photo-1616172605634-60e5883ce61a?w=800&q=80'
    ],
    stock: 35,
    featured: false,
  },
  {
    name: 'Frankincense & Myrrh Essential Oil',
    description: 'Premium therapeutic essential oil blend for meditation and spiritual grounding.',
    price: 1399,
    category: 'aromatherapy',
    images: [
      'https://images.unsplash.com/photo-1595425970377-c9703c486558?w=800&q=80',
      'https://images.unsplash.com/photo-1602928309048-0b1f249b4f90?w=800&q=80'
    ],
    stock: 20,
    featured: true,
  },
  {
    name: 'Spirulina & Chlorella Detox Powder',
    description: 'Nutrient-dense superfood powder to support immune system and boost energy naturally.',
    price: 1599,
    category: 'supplements',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80'
    ],
    stock: 45,
    featured: false,
  },
  {
    name: 'Oud & Amber Room Diffuser',
    description: 'Elegant room diffuser with premium oud and amber scent. Creates a luxurious ambiance.',
    price: 1899,
    category: 'home',
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1602928309195-9ff5a71fa7a2?w=800&q=80'
    ],
    stock: 28,
    featured: true,
  },
  {
    name: 'Hyaluronic Acid Hydrating Serum',
    description: 'Ultra-lightweight hydrating serum with hyaluronic acid and botanical extracts. Plumps and glows skin.',
    price: 1099,
    category: 'skincare',
    images: [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=80'
    ],
    stock: 60,
    featured: true,
  },
  {
    name: 'Keratin & Argan Hair Treatment',
    description: 'Intensive hair treatment with keratin protein and argan oil. Repairs damage and adds shine.',
    price: 899,
    category: 'haircare',
    images: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
      'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80'
    ],
    stock: 50,
    featured: false,
  },
  {
    name: 'Magnesium Bath Crystals',
    description: 'Premium magnesium bath crystals to relieve muscle tension and promote deep relaxation.',
    price: 699,
    category: 'wellness',
    images: [
      'https://images.unsplash.com/photo-1616172605634-60e5883ce61a?w=800&q=80',
      'https://images.unsplash.com/photo-1602928309048-0b1f249b4f90?w=800&q=80'
    ],
    stock: 42,
    featured: false,
  },
  {
    name: 'Rose Garden Scented Candle',
    description: 'Hand-poured soy candle with real rose petals and rose essential oil fragrance.',
    price: 1299,
    category: 'home',
    images: [
      'https://images.unsplash.com/photo-1602928309048-0b1f249b4f90?w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80'
    ],
    stock: 35,
    featured: false,
  },
  {
    name: 'Bakuchiol Night Regenerating Cream',
    description: 'Natural retinol alternative with bakuchiol for anti-aging without irritation. Firms and brightens.',
    price: 1399,
    category: 'skincare',
    images: [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80'
    ],
    stock: 55,
    featured: true,
  },
  {
    name: 'Ginger & Turmeric Wellness Tea',
    description: 'Organic herbal tea blend with anti-inflammatory ginger and turmeric. Soothes digestion and immunity.',
    price: 499,
    category: 'supplements',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80'
    ],
    stock: 75,
    featured: false,
  },
  {
    name: 'Lemongrass & Citronella Bug Spray',
    description: 'Natural insect repellent with organic lemongrass and citronella. Safe for skin and environment.',
    price: 449,
    category: 'home',
    images: [
      'https://images.unsplash.com/photo-1602928309195-9ff5a71fa7a2?w=800&q=80',
      'https://images.unsplash.com/photo-1595425970377-c9703c486558?w=800&q=80'
    ],
    stock: 50,
    featured: false,
  },
  {
    name: 'Rice Bran & Vitamin B Face Serum',
    description: 'Brightening serum with rice bran extract and B-complex vitamins. Evens tone and reduces fine lines.',
    price: 799,
    category: 'skincare',
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80',
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=80',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80'
    ],
    stock: 65,
    featured: true,
  },
  {
    name: 'Nourishing Hair Oil Blend',
    description: 'Luxurious blend of coconut, jojoba, and rosemary oils. Deeply nourishes and promotes hair growth.',
    price: 749,
    category: 'haircare',
    images: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
      'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80',
      'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80'
    ],
    stock: 58,
    featured: false,
  },
  {
    name: 'Yoga & Meditation Incense Sticks',
    description: 'Premium incense sticks with natural botanical resins. Perfect for yoga and meditation practice.',
    price: 399,
    category: 'aromatherapy',
    images: [
      'https://images.unsplash.com/photo-1595425970377-c9703c486558?w=800&q=80',
      'https://images.unsplash.com/photo-1602928309048-0b1f249b4f90?w=800&q=80'
    ],
    stock: 85,
    featured: false,
  },
  {
    name: 'Collagen & Biotin Hair Growth Pills',
    description: 'Advanced formula with marine collagen and biotin for stronger, thicker, healthier hair growth.',
    price: 1399,
    category: 'supplements',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80'
    ],
    stock: 40,
    featured: true,
  },
  {
    name: 'Eucalyptus & Mint Soothing Balm',
    description: 'Cooling topical balm for muscle aches and tension relief. Refreshing herbal scent.',
    price: 549,
    category: 'wellness',
    images: [
      'https://images.unsplash.com/photo-1616172605634-60e5883ce61a?w=800&q=80',
      'https://images.unsplash.com/photo-1602928309048-0b1f249b4f90?w=800&q=80'
    ],
    stock: 48,
    featured: false,
  },
  {
    name: 'Vanilla & Cinnamon Scented Wax Melts',
    description: 'Eco-friendly soy wax melts with warm vanilla and cinnamon. Long-lasting fragrance for any room.',
    price: 449,
    category: 'home',
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1602928309195-9ff5a71fa7a2?w=800&q=80',
      'https://images.unsplash.com/photo-1595425970377-c9703c486558?w=800&q=80'
    ],
    stock: 90,
    featured: false,
  },
  {
    name: 'Snail Mucin Essence Hydrating Toner',
    description: 'K-beauty inspired essence with snail mucin and hyaluronic acid. Ultra-hydrating and clarifying.',
    price: 899,
    category: 'skincare',
    images: [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80'
    ],
    stock: 52,
    featured: true,
  },
];

const ADMIN_USER = {
  name: 'Admin User',
  email: 'admin@shopease.com',
  password: 'admin123',
  role: 'admin',
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear collections
    await Product.deleteMany({});
    await User.deleteMany({ email: ADMIN_USER.email });
    console.log('🗑️  Cleared existing products and admin user');

    // Create admin
    await User.create(ADMIN_USER);
    console.log('👤 Admin user created: admin@shopease.com / admin123');

    // Seed products
    await Product.insertMany(PRODUCTS);
    console.log(`🌿 ${PRODUCTS.length} products seeded`);

    console.log('\n✨ Seed complete!');
    console.log('   Admin login: admin@shopease.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
