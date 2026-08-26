const { GoogleGenerativeAI } = require('@google/generative-ai');

// Generate Gemini embedding vector for a product
const generateProductEmbedding = async (product) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is missing in .env. Skipping embedding generation.');
      return null;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

    const textToEmbed = `
      Product Name: ${product.name}
      Category: ${product.category}
      Description: ${product.description}
      Price: ${product.price} INR
      Storage: ${product.details?.storage || 'N/A'}
      Shelf Life: ${product.details?.shelfLife || 'N/A'}
      Suitable For: ${product.details?.suitableFor || 'N/A'}
      How to Use: ${Array.isArray(product.howToUse) ? product.howToUse.join('. ') : (product.howToUse || 'N/A')}
    `.trim();

    const result = await model.embedContent(textToEmbed);
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
  } catch (error) {
    console.error(`Error generating embedding for product "${product?.name}":`, error.message);
  }
  return null;
};

module.exports = { generateProductEmbedding };
