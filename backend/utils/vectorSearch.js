// Compute cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Perform in-memory vector search
const performVectorSearch = (queryEmbedding, products, k = 5) => {
  const results = products
    .filter((product) => product.embedding && product.embedding.length > 0)
    .map((product) => {
      const score = cosineSimilarity(queryEmbedding, product.embedding);
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return results.map(r => r.product);
};

module.exports = {
  cosineSimilarity,
  performVectorSearch
};
