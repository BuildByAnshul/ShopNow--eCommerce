const { Pinecone } = require('@pinecone-database/pinecone');

let pc = null;
let pineconeIndex = null;

const initPinecone = () => {
  if (pc) return pineconeIndex;

  if (!process.env.PINECONE_API_KEY) {
    console.warn('PINECONE_API_KEY is not set. Vector search will be disabled.');
    return null;
  }

  try {
    pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    pineconeIndex = pc.index(process.env.PINECONE_INDEX || 'shopease-products');
    console.log('? Connected to Pinecone Index: ' + (process.env.PINECONE_INDEX || 'shopease-products'));
    return pineconeIndex;
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error.message);
    return null;
  }
};

const getPineconeIndex = () => {
  if (!pineconeIndex) return initPinecone();
  return pineconeIndex;
};

module.exports = {
  initPinecone,
  getPineconeIndex,
};
