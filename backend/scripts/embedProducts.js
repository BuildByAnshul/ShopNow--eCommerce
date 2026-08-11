require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

const generateEmbeddings = async () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('ERROR: GEMINI_API_KEY is missing in .env file.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({}).select('+embedding');
    console.log(`Found ${products.length} products to embed.`);

    for (const product of products) {
      if (product.embedding && product.embedding.length > 0) {
        console.log(`Skipping ${product.name}, embedding already exists.`);
        continue;
      }

      // Create a rich text representation of the product for embedding
      const textToEmbed = `
        Product Name: ${product.name}
        Category: ${product.category}
        Description: ${product.description}
        Price: ${product.price} INR
        Storage: ${product.details?.storage || 'N/A'}
        Shelf Life: ${product.details?.shelfLife || 'N/A'}
        Suitable For: ${product.details?.suitableFor || 'N/A'}
        How to Use: ${product.howToUse?.join('. ') || 'N/A'}
      `.trim();

      console.log(`Generating embedding for: ${product.name}`);
      const result = await model.embedContent(textToEmbed);
      const embedding = result.embedding.values;

      product.embedding = embedding;
      await product.save();
      
      // Sleep slightly to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Successfully generated embeddings for all products!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    process.exit(1);
  }
};

generateEmbeddings();
