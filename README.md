# 🛍️ ShopEase – MERN E-Commerce Platform with AI 🤖

A full-stack **E-commerce Web Application** built using the **MERN stack**, secure online payments via **Razorpay**, and an intelligent **AI Shopping Assistant** powered by **Google Gemini** and **Pinecone Vector Database**. ShopEase delivers a smooth, modern, and scalable shopping experience with a premium botanical-themed UI.

---

## 🌟 Live Demo

* 🌐 **Frontend:** https://shopnow-ecomm.netlify.app/
* ⚙️ **Backend API:** https://onrender.com 

---

## 💻 Tech Stack

### 🎨 Frontend
* React (Vite)
* Redux Toolkit (State Management)
* React Router DOM
* Tailwind CSS (Custom Botanical Design System)
* Axios
* Lucide Icons

### ⚙️ Backend
* Node.js & Express.js
* MongoDB (Mongoose)
* Google Generative AI (Gemini 3.5 Flash & Embedding)
* Pinecone (Vector Database for AI Search)
* Cloudinary (Cloud storage for Images & Videos)
* Multer (File uploads)

### 💳 Payment Integration
* Razorpay API (Test & Live Mode)

---

## 🚀 Features

### 👤 User Features
* **AI Chatbot Assistant:** Ask questions about products (e.g., `"Suggest a cream for dry skin under 500"`) and get smart, instant responses powered by Gemini and Pinecone vector search.
* **User Authentication:** Secure JWT-based login/signup.
* **Dynamic Product Catalog:** Browse products with categories, rich descriptions, and image/video galleries.
* **Shopping Cart:** Persistent cart management.
* **Secure Checkout:** Integrated with Razorpay.
* **Profile Management:** View order history & account details.
* **Responsive UI:** Premium mobile-first design with a natural, organic aesthetic.

### 🛡️ Admin Features
* **Admin Dashboard:** Protected routes for store management.
* **Advanced Product Management:** Add/Edit/Delete products with direct image and video uploads to Cloudinary.
* **Inventory & Order Management:** Update stock and track orders.

### 🧠 Smart Features
* **Semantic Search:** Products are embedded into vectors using `gemini-embedding-2` for context-aware chatbot recommendations.
* **Cloud Media Optimization:** Images and videos are automatically uploaded and optimized via Cloudinary.
* **Real-time Payment Tracking:** Webhook-ready payment status updates.

---

## 📂 Project Structure

```
ShopEase/
├── backend/
│   ├── config/              # DB & external configs
│   ├── controllers/         # Business logic (Auth, Products, Chatbot, Orders)
│   ├── models/              # Mongoose schemas (User, Product, Order, ChatSession)
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, error handling, Multer upload
│   ├── utils/               # Helpers (PineconeClient, EmbeddingHelper, Cloudinary)
│   ├── scripts/             # Admin scripts (e.g., embedding seeder)
│   ├── server.js            # Entry point
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Buttons, Modals, Chatbot)
│   │   ├── pages/           # Page views (Home, Products, Admin Dashboard)
│   │   ├── redux/           # Redux store and slices
│   │   ├── services/        # Axios API calls
│   │   ├── hooks/           # Custom hooks
│   │   └── App.jsx
│   ├── index.css            # Tailwind directives and custom CSS
│   └── package.json
└── README.md
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Payments
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# AI & Vector DB
GEMINI_API_KEY=your_google_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=products-embadding

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY=your_razorpay_key
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/BuildByAnshul/ShopNow.git
cd ShopNow
```

### 2️⃣ Setup Backend
```bash
cd backend
npm install
# Create .env file based on the template above
npm run dev
```

### 3️⃣ Setup Frontend
```bash
cd frontend
npm install
# Create .env file
npm run dev
```

---

## 🤖 AI Chatbot Architecture

1. **Data Ingestion:** When an admin creates a product, the backend generates an embedding vector of the product's text using `gemini-embedding-2`.
2. **Vector Storage:** The vector is upserted into **Pinecone** with the product's MongoDB `_id`.
3. **User Query:** User asks the chatbot a question in natural language.
4. **Semantic Search:** The query is embedded, and Pinecone is searched for the top 5 most relevant products.
5. **Generative Response:** The matched product details and chat history are sent to **Gemini 3.5 Flash**, which formulates a helpful JSON response that the frontend renders as rich UI cards.

---

## 🛡️ Security Features
* Password hashing using `bcryptjs`
* JWT authentication for API routes
* Protected Admin routes
* Razorpay signature verification for payments

---

## 👨‍💻 Author

**Anshul Vishwakarma**

* 📍 Indore, India
* 💼 **LinkedIn:** https://www.linkedin.com/in/anshul-vishwakarma-6b24b4270/
* 🐙 **GitHub:** https://github.com/BuildByAnshul

---

## 📜 License
This project is licensed under the MIT License.

> 🌿 *ShopEase is designed to deliver a seamless, elegant, and scalable e-commerce experience powered by modern web technologies and Artificial Intelligence.*
