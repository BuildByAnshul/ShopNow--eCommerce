# 🌿 ShopEase – MERN E-Commerce Platform

A full-stack **E-commerce Web Application** built using the **MERN stack** with secure online payments via **Razorpay**. ShopEase delivers a smooth, modern, and scalable shopping experience with a premium UI and efficient backend architecture.

---

## 🚀 Live Demo

* 🌐 Frontend: https://shopnow-ecomm.netlify.app/
* ⚙️ Backend API: https://onrender.com

---

## 🧠 Tech Stack

### 🔹 Frontend

* React (Vite)
* Redux Toolkit (State Management)
* React Router DOM
* Tailwind CSS (Custom Design System)
* Axios

### 🔹 Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### 🔹 Payment Integration

* Razorpay API (Test & Live Mode)

### 🔹 Deployment

* Frontend: Netlify
* Backend: Render

---

## ✨ Features

### 👤 User Features

* User Authentication (JWT-based login/signup)
* Browse products with filters & search
* Product detail view with pricing & description
* Add to cart & manage quantity
* Secure checkout with Razorpay
* Order history & tracking
* Responsive UI (mobile-first)

---

### 🛠️ Admin Features

* Admin dashboard with protected routes
* Add / Edit / Delete products
* Manage inventory
* Update order status

---

### 🧠 Smart Features

* Product recommendation system (category + user behavior)
* Persistent cart using local storage
* Real-time payment status updates

---

## 📂 Project Structure

```
ShopEase/
│
├── backend/
│   ├── config/              # DB & external configs
│   │   └── db.js
│
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── paymentRoutes.js
│
│   ├── middleware/          # Auth, error handling
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│
│   ├── utils/               # Helper functions (🔥 ADD THIS)
│   │   ├── generateToken.js
│   │   └── razorpay.js
│
│   ├── data/                # Seeder data (🔥 OPTIONAL)
│   │   └── products.js
│
│   ├── seed.js              # DB seeding
│   ├── server.js            # Entry point
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Images, icons
│   │   ├── components/
│   │   │   ├── ui/          # Buttons, Cards (design system)
│   │   │   ├── layout/      # Navbar, Footer
│   │   │   └── product/
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Product.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── Admin/
│   │   │
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── productSlice.js
│   │   │   │   ├── cartSlice.js
│   │   │   │   └── orderSlice.js
│   │   │
│   │   ├── services/        # API calls
│   │   │   └── api.js
│   │   │
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useAuth.js
│   │   │
│   │   ├── utils/           # Helpers
│   │   │   └── formatPrice.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│
│   ├── public/
│   ├── index.html
│   └── .env
│
├── README.md
└── package.json (optional root)
```

---

## 🔐 Environment Variables

### Backend (.env)

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### Frontend (.env)

```
VITE_API_URL=https://your-render-link.onrender.com
VITE_RAZORPAY_KEY=your_key
```

---

## 💳 Razorpay Integration Flow

1. Create order on backend
2. Send order details to frontend
3. Open Razorpay checkout
4. Verify payment signature
5. Update order status in database

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/shopease.git
cd shopease
```

---

### 2️⃣ Setup Backend

```
cd server
npm install
npm run dev
```

---

### 3️⃣ Setup Frontend

```
cd client
npm install
npm run dev
```

---

## 📦 Deployment

### 🌐 Frontend (Netlify)

* Connect GitHub repo
* Build command: `npm run build`
* Publish directory: `dist`

### ⚙️ Backend (Render)

* Create new Web Service
* Add environment variables
* Start command: `npm start`

---

## 🔒 Security Features

* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* Razorpay signature verification

---

## 📱 Responsive Design

* Mobile-first UI
* Optimized layouts for all screen sizes
* Smooth animations and interactions

---

## 📈 Future Enhancements

* Wishlist feature
* Product reviews & ratings
* AI-based recommendation system
* Dark mode (organic theme)
* Pagination & performance optimization

---

## 👨‍💻 Author

**Anshul Vishwakarma**

* 📍 Indore, India
* 🔗 LinkedIn: https://www.linkedin.com/in/anshul-vishwakarma-6b24b4270/
* 💻 GitHub: https://github.com/BuildByAnshul

---

## ⭐ Acknowledgements

* Razorpay for payment integration
* MongoDB for database
* Netlify & Render for deployment

---

## 📜 License

This project is licensed under the MIT License.

---

> 🌿 *ShopEase is designed to deliver a seamless, elegant, and scalable e-commerce experience powered by modern web technologies.*
