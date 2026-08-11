const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatSession = require('../models/ChatSession');
const Product = require('../models/Product');
const { performVectorSearch } = require('../utils/vectorSearch');

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper to get today's date string (YYYY-MM-DD)
const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// @desc  Ask a question to the chatbot
// @route POST /api/chatbot/ask
const askQuestion = async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(503).json({ message: 'Chatbot service is currently unavailable (API Key missing).' });
    }

    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required for anonymous tracking' });
    }

    // Optional Authentication extraction
    let userId = null;
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        // Invalid token, treat as anonymous
      }
    }

    const today = getTodayDateString();

    // Find or create chat session for today
    let query = userId ? { userId, date: today } : { sessionId, date: today };
    let chatSession = await ChatSession.findOne(query);

    if (!chatSession) {
      chatSession = new ChatSession({
        userId,
        sessionId: userId ? undefined : sessionId,
        date: today,
        questionCount: 0,
        messages: []
      });
    }

    // Check Limits
    const limit = userId ? 50 : 5;
    if (chatSession.questionCount >= limit) {
      return res.status(429).json({
        message: `You have reached your daily limit of ${limit} questions. Please ${userId ? 'try again tomorrow' : 'log in for a higher limit'}.`
      });
    }

    // 1. Generate embedding for user query
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const embedResult = await embeddingModel.embedContent(message);
    const queryEmbedding = embedResult.embedding.values;

    // 2. Fetch all products with embeddings (Select embedding explicitly)
    const products = await Product.find({}).select('+embedding');

    // 3. Perform in-memory vector search
    const topMatches = performVectorSearch(queryEmbedding, products, 3); // Get top 3 related products

    let contextString = "No related products found in the catalog.";
    if (topMatches.length > 0) {
      contextString = topMatches.map(p => `
        ID: ${p._id}
        Name: ${p.name}
        Category: ${p.category}
        Price: ${p.price} INR
        Description: ${p.description}
        Suitable For: ${p.details?.suitableFor || 'N/A'}
        How to Use: ${p.howToUse?.join('. ') || 'N/A'}
        Image: ${p.images && p.images.length > 0 ? p.images[0] : ''}
      `).join('\n\n');
    }

    // 5. Build prompt for LLM
    const prompt = `
      You are a helpful and polite customer support AI assistant for an e-commerce store named "ShopEase". 
      Your task is to answer the user's question ONLY based on the provided Context.
      
      CRITICAL RULES:
      - NEVER answer any question that goes beyond the provided context.
      - If the user asks something completely unrelated to ShopEase or the context, politely say: "I can only answer questions related to ShopEase products."
      - Do not invent details, prices, or products that do not exist in the Context.
      - You must output your response in JSON format.
      - If you mention or recommend any products from the Context, include their exact details in the "products" array of the JSON response.
      
      STRICT JSON OUTPUT FORMAT:
      
      {
        "reply": "Your message to the user goes here.",
        "products": [
          {
            "id": "Product ID here",
            "name": "Product Name here",
            "price": Product Price (Number),
            "image": "Product Image URL here"
          }
        ]
      }
      
      CONTEXT (Top matching products):
      ${contextString}

      USER QUESTION:
      ${message}
    `;

    // 6. Call LLM
    const chatModel = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    const result = await chatModel.generateContent(prompt);
    let responseText = result.response.text();
    console.log(responseText);
    // Gemini sometimes wraps JSON in markdown blocks or adds trailing text
    if (responseText[0] === responseText[1]) {
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
      }
    }
    let replyText = "";
    let suggestedProducts = [];

    try {
      const parsed = JSON.parse(responseText);
      replyText = parsed.reply || "Sorry, I couldn't formulate a response.";
      if (Array.isArray(parsed.products)) {
        suggestedProducts = parsed.products;
      }
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', e);
      replyText = responseText;
    }

    // 7. Save to DB
    chatSession.messages.push({ role: 'user', content: message });
    chatSession.messages.push({
      role: 'model',
      content: replyText,
      products: suggestedProducts
    });
    chatSession.questionCount += 1;
    await chatSession.save();

    res.status(200).json({
      reply: replyText,
      products: suggestedProducts,
      remainingLimits: limit - chatSession.questionCount
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Internal server error while processing chat.' });
  }
};

// @desc  Get chat history for today
// @route GET /api/chatbot/history
const getHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ message: 'Session ID required' });

    let userId = null;
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) { }
    }

    const today = getTodayDateString();
    let query = userId ? { userId, date: today } : { sessionId, date: today };

    const chatSession = await ChatSession.findOne(query);

    if (!chatSession) {
      return res.status(200).json({ messages: [], remainingLimits: userId ? 50 : 5 });
    }

    const limit = userId ? 50 : 5;
    res.status(200).json({
      messages: chatSession.messages,
      remainingLimits: limit - chatSession.questionCount
    });

  } catch (error) {
    console.error('Chatbot history error:', error);
    res.status(500).json({ message: 'Internal server error while fetching history.' });
  }
};

module.exports = {
  askQuestion,
  getHistory
};
