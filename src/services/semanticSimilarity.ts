// Lightweight semantic similarity for browser environment
// Uses tokenized text + Jaccard similarity as a documented proxy for semantic similarity
// NOTE: In production, this would be replaced with actual embedding models (sentence-transformers, OpenAI, etc.)

// Common English stopwords to filter out
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'by', 'for',
  'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'of', 'as', 'it',
  'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him',
  'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their', 'what', 'which', 'who', 'whom',
  'am', 'could', 'would', 'may', 'might', 'must', 'shall', 'also', 'said', 'says', 'new',
]);

// Tokenize text into normalized word set
export function tokenize(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = normalized.split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w));
  return new Set(words);
}

// Extract bigrams for additional context
export function extractBigrams(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = normalized.split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w));
  const bigrams = new Set<string>();
  
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${words[i]}_${words[i + 1]}`);
  }
  
  return bigrams;
}

// Jaccard similarity between two sets
function jaccard(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  
  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection++;
  });
  
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Combined similarity: weighted mix of unigram and bigram Jaccard
export function textSimilarity(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const bigramsA = extractBigrams(textA);
  const bigramsB = extractBigrams(textB);
  
  const unigramSim = jaccard(tokensA, tokensB);
  const bigramSim = jaccard(bigramsA, bigramsB);
  
  // Weight bigrams higher — they capture more semantic context
  return unigramSim * 0.4 + bigramSim * 0.6;
}

// Compute pairwise similarity matrix for a set of texts
export function computePairwiseSimilarity(texts: string[]): number[][] {
  const n = texts.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = textSimilarity(texts[i], texts[j]);
      matrix[i][j] = sim;
      matrix[j][i] = sim;
    }
  }
  
  return matrix;
}

// Compute aggregate coherence from pairwise similarities
// C_t = Σ w_ij * s_ij / Σ w_ij
export function computeCoherence(texts: string[], weights?: number[][]): number {
  if (texts.length < 2) return 0;
  
  const n = texts.length;
  let weightedSum = 0;
  let weightTotal = 0;
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const similarity = textSimilarity(texts[i], texts[j]);
      const weight = weights ? weights[i][j] : 1;
      weightedSum += weight * similarity;
      weightTotal += weight;
    }
  }
  
  return weightTotal === 0 ? 0 : weightedSum / weightTotal;
}

// Compute Shannon entropy of topic distribution
export function computeEntropy(categories: string[]): number {
  if (categories.length === 0) return 0;
  
  const counts: Record<string, number> = {};
  categories.forEach(cat => {
    counts[cat] = (counts[cat] || 0) + 1;
  });
  
  const K = Object.keys(counts).length;
  if (K <= 1) return 0;
  
  const total = categories.length;
  let entropy = 0;
  
  Object.values(counts).forEach(count => {
    const p = count / total;
    if (p > 0) entropy -= p * Math.log(p);
  });
  
  // Normalize by ln(K)
  return entropy / Math.log(K);
}

// Extract topic keywords from text (simple frequency-based)
export function extractTopics(text: string, topN: number = 3): string[] {
  const tokens = tokenize(text);
  const freq: Record<string, number> = {};
  
  tokens.forEach(token => {
    freq[token] = (freq[token] || 0) + 1;
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

// Apply exponential decay weight based on age
export function decayWeight(ageMs: number, lambda: number): number {
  const ageHours = ageMs / (1000 * 60 * 60);
  return Math.exp(-lambda * ageHours);
}
