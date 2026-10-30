// SYGON (Semantic Yield Governance ONtology) Engine
// Implements φ-lattice geometry, prime-indexed lexical identity, and SGU analysis

// Constants
const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio φ ≈ 1.618
const PSI = 1 / PHI; // ψ = 1/φ ≈ 0.618
const TAU = 2 * Math.PI; // τ = 2π
const GOLDEN_ANGLE = TAU * PSI; // α = 2πψ ≈ 2.399 radians

// Prime number generator
function* primeGenerator(): Generator<number> {
  yield 2;
  yield 3;
  let candidate = 5;
  while (true) {
    if (isPrime(candidate)) {
      yield candidate;
    }
    candidate += 2;
  }
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// Token normalization
function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/[^\w]/g, '')
    .trim();
}

// Extract lexical units from text
function extractLexicalUnits(text: string): string[] {
  const words = text.split(/\s+/);
  const tokens = words
    .map(normalizeToken)
    .filter(t => t.length > 2);
  return [...new Set(tokens)]; // Unique tokens
}

// SYGON Prime Token Registry
export interface PrimeToken {
  token: string;
  prime: number;
  primeIndex: number;
  firstSeen: number;
}

export interface PrimeTokenRegistry {
  tokens: Map<string, PrimeToken>;
  nextPrimeIndex: number;
}

// Initialize or load registry from localStorage
export function loadPrimeRegistry(): PrimeTokenRegistry {
  try {
    const stored = localStorage.getItem('sygon_prime_registry');
    if (stored) {
      const data = JSON.parse(stored);
      const tokens = new Map<string, PrimeToken>();
      if (data.tokens && Array.isArray(data.tokens)) {
        data.tokens.forEach((t: any) => {
          if (t && t.token) {
            tokens.set(t.token, t);
          }
        });
      }
      return { tokens, nextPrimeIndex: data.nextPrimeIndex || 0 };
    }
  } catch (error) {
    console.error('Error loading prime registry:', error);
  }
  return { tokens: new Map(), nextPrimeIndex: 0 };
}

// Save registry to localStorage
export function savePrimeRegistry(registry: PrimeTokenRegistry): void {
  try {
    if (!registry || !registry.tokens) {
      console.warn('Invalid registry provided to savePrimeRegistry');
      return;
    }
    const data = {
      tokens: Array.from(registry.tokens.values()),
      nextPrimeIndex: registry.nextPrimeIndex || 0,
    };
    localStorage.setItem('sygon_prime_registry', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving prime registry:', error);
  }
}

// Assign primes to new tokens
export function assignPrimesToTokens(
  tokens: string[],
  registry: PrimeTokenRegistry
): PrimeToken[] {
  const primeGen = primeGenerator();
  const result: PrimeToken[] = [];
  const now = Date.now();

  // Sort tokens for deterministic assignment
  const sortedTokens = [...new Set(tokens)].sort();

  for (const token of sortedTokens) {
    if (!registry.tokens.has(token)) {
      // Find the next prime for this primeIndex
      let prime = 2;
      for (let i = 0; i <= registry.nextPrimeIndex; i++) {
        prime = primeGen.next().value;
      }
      
      const primeToken: PrimeToken = {
        token,
        prime,
        primeIndex: registry.nextPrimeIndex,
        firstSeen: now,
      };
      
      registry.tokens.set(token, primeToken);
      registry.nextPrimeIndex++;
      result.push(primeToken);
    } else {
      result.push(registry.tokens.get(token)!);
    }
  }

  savePrimeRegistry(registry);
  return result;
}

// φ-lattice placement for lexical unit
export interface LatticePosition {
  token: string;
  primeIndex: number;
  angle: number; // θ = k * α
  radius: number; // r = √k
  x: number; // r * cos(θ)
  y: number; // r * sin(θ)
}

export function computeLatticePosition(primeIndex: number, token: string): LatticePosition {
  const k = primeIndex;
  const angle = k * GOLDEN_ANGLE;
  const radius = Math.sqrt(k);
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  return { token, primeIndex, angle, radius, x, y };
}

// SGU (Semantic Governance Unit)
export interface SGU {
  id: string;
  text: string;
  category: string;
  weight: number;
  
  // Coordinates
  x: number;
  y: number;
  
  // Lexical lattice centroid
  latticeCentroidX: number;
  latticeCentroidY: number;
  
  // Wave coherence
  waveCoherence: number;
  
  // Voronoi neighborhood
  nearestNeighborDistance: number;
  voronoiRadius: number;
  
  // τ-circle radius
  tauRadius: number;
  
  // Drift tracking
  driftAngle: number;
  driftRadius: number;
  spiralFidelity: number;
  
  // Metadata
  firstSeen: number;
  lastSeen: number;
  observationCount: number;
}

// SGU State (persisted)
export interface SGUState {
  sgus: Map<string, SGU>;
  driftHistory: Map<string, DriftRecord[]>;
}

export interface DriftRecord {
  timestamp: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  drift: number;
  spiralFidelity: number;
}

// Load SGU state from localStorage
export function loadSGUState(): SGUState {
  try {
    const stored = localStorage.getItem('sygon_sgu_state');
    if (stored) {
      const data = JSON.parse(stored);
      const sgus = new Map<string, SGU>();
      if (data.sgus && Array.isArray(data.sgus)) {
        data.sgus.forEach((s: any) => {
          if (s && s.id) {
            sgus.set(s.id, s);
          }
        });
      }
      const driftHistory = new Map<string, DriftRecord[]>();
      if (data.driftHistory && Array.isArray(data.driftHistory)) {
        data.driftHistory.forEach((d: any) => {
          if (d && d.id && Array.isArray(d.records)) {
            driftHistory.set(d.id, d.records);
          }
        });
      }
      return { sgus, driftHistory };
    }
  } catch (error) {
    console.error('Error loading SGU state:', error);
  }
  return { sgus: new Map(), driftHistory: new Map() };
}

// Save SGU state to localStorage
export function saveSGUState(state: SGUState): void {
  try {
    if (!state || !state.sgus || !state.driftHistory) {
      console.warn('Invalid state provided to saveSGUState');
      return;
    }
    const data = {
      sgus: Array.from(state.sgus.values()),
      driftHistory: Array.from(state.driftHistory.entries()).map(([id, records]) => ({
        id,
        records: records || [],
      })),
    };
    localStorage.setItem('sygon_sgu_state', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving SGU state:', error);
  }
}

// Compute SGU coordinates from text and lexical lattice
export function computeSGUCoordinates(
  text: string,
  lexicalPositions: LatticePosition[],
  similarityVector: number[] // Proxy for embedding (using Jaccard similarities)
): { x: number; y: number; latticeCentroidX: number; latticeCentroidY: number } {
  // Compute lattice centroid
  let centroidX = 0;
  let centroidY = 0;
  if (lexicalPositions.length > 0) {
    centroidX = lexicalPositions.reduce((sum, p) => sum + p.x, 0) / lexicalPositions.length;
    centroidY = lexicalPositions.reduce((sum, p) => sum + p.y, 0) / lexicalPositions.length;
  }

  // Deterministic 2-D projection from similarity vector
  // Use first two principal components (simplified)
  const x = similarityVector.length > 0 ? similarityVector[0] || 0 : centroidX;
  const y = similarityVector.length > 1 ? similarityVector[1] || 0 : centroidY;

  // Combine embedding projection with lattice centroid
  const finalX = (x + centroidX) / 2;
  const finalY = (y + centroidY) / 2;

  return { x: finalX, y: finalY, latticeCentroidX: centroidX, latticeCentroidY: centroidY };
}

// Compute wave coherence (category-centroid alignment)
export function computeWaveCoherence(
  sguCoords: { x: number; y: number },
  categoryCentroids: Map<string, { x: number; y: number; count: number }>,
  category: string
): number {
  const centroid = categoryCentroids.get(category);
  if (!centroid || centroid.count === 0) return 0;

  // Euclidean distance to category centroid
  const dx = sguCoords.x - centroid.x;
  const dy = sguCoords.y - centroid.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Coherence = 1 / (1 + distance), bounded [0, 1]
  return 1 / (1 + distance);
}

// Compute Voronoi neighborhood (nearest neighbor distance)
export function computeVoronoiNeighborhood(
  sgu: { x: number; y: number },
  allSGUs: Array<{ x: number; y: number }>
): { nearestNeighborDistance: number; voronoiRadius: number; tauRadius: number } {
  let minDistance = Infinity;

  for (const other of allSGUs) {
    if (other === sgu) continue;
    const dx = sgu.x - other.x;
    const dy = sgu.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  if (minDistance === Infinity) minDistance = 1; // Default if only one SGU

  const voronoiRadius = minDistance / 2;
  const tauRadius = Math.max(voronoiRadius * PHI, 0.1); // φ-derived lower bound

  return { nearestNeighborDistance: minDistance, voronoiRadius, tauRadius };
}

// Compute drift and spiral fidelity
export function computeDrift(
  currentSGU: SGU,
  previousSGU: SGU | undefined
): { driftAngle: number; driftRadius: number; spiralFidelity: number } {
  if (!previousSGU) {
    return { driftAngle: 0, driftRadius: 0, spiralFidelity: 1 };
  }

  // Current polar coordinates
  const currentAngle = Math.atan2(currentSGU.y, currentSGU.x);
  const currentRadius = Math.sqrt(currentSGU.x * currentSGU.x + currentSGU.y * currentSGU.y);

  // Previous polar coordinates
  const previousAngle = Math.atan2(previousSGU.y, previousSGU.x);
  const previousRadius = Math.sqrt(previousSGU.x * previousSGU.x + previousSGU.y * previousSGU.y);

  // Drift
  const driftAngle = currentAngle - previousAngle;
  const driftRadius = currentRadius - previousRadius;

  // Spiral fidelity: how well does the drift follow a golden spiral?
  // Expected spiral: r = a * e^(b * θ) where b = ln(φ) / (π/2)
  const b = Math.log(PHI) / (Math.PI / 2);
  const expectedRadius = previousRadius * Math.exp(b * driftAngle);
  const spiralFidelity = 1 / (1 + Math.abs(currentRadius - expectedRadius));

  return { driftAngle, driftRadius, spiralFidelity };
}

// Main SYGON analysis function
export function analyzeSYGON(
  texts: string[],
  categories: string[],
  weights: number[],
  ids: string[],
  similarityMatrix: number[][] // Jaccard similarity matrix
): {
  sgus: SGU[];
  categoryCentroids: Map<string, { x: number; y: number; count: number }>;
  primeRegistry: PrimeTokenRegistry;
} {
  const registry = loadPrimeRegistry();
  const sguState = loadSGUState();
  const now = Date.now();

  // Extract lexical units and assign primes
  const allLexicalUnits: string[] = [];
  texts.forEach(text => {
    allLexicalUnits.push(...extractLexicalUnits(text));
  });
  assignPrimesToTokens(allLexicalUnits, registry);

  // Compute lattice positions for each text
  const textLatticePositions: LatticePosition[][] = texts.map(text => {
    const tokens = extractLexicalUnits(text);
    return tokens.map(token => {
      const primeToken = registry.tokens.get(token)!;
      return computeLatticePosition(primeToken.primeIndex, token);
    });
  });

  // Compute category centroids
  const categoryCentroids = new Map<string, { x: number; y: number; count: number }>();
  
  // First pass: accumulate
  texts.forEach((text, i) => {
    const category = categories[i];
    const coords = computeSGUCoordinates(text, textLatticePositions[i], similarityMatrix[i]);
    
    if (!categoryCentroids.has(category)) {
      categoryCentroids.set(category, { x: 0, y: 0, count: 0 });
    }
    const centroid = categoryCentroids.get(category)!;
    centroid.x += coords.x;
    centroid.y += coords.y;
    centroid.count++;
  });

  // Second pass: average
  categoryCentroids.forEach((centroid) => {
    if (centroid.count > 0) {
      centroid.x /= centroid.count;
      centroid.y /= centroid.count;
    }
  });

  // Compute SGUs
  const sgus: SGU[] = texts.map((text, i) => {
    const id = ids[i] || `sgu-${now}-${i}`;
    const category = categories[i];
    const weight = weights[i];
    
    const coords = computeSGUCoordinates(text, textLatticePositions[i], similarityMatrix[i]);
    const waveCoherence = computeWaveCoherence(coords, categoryCentroids, category);
    
    // Temporary SGU for Voronoi calculation
    const tempSGU = { x: coords.x, y: coords.y };
    const allCoords = texts.map((_, j) => ({
      x: computeSGUCoordinates(texts[j], textLatticePositions[j], similarityMatrix[j]).x,
      y: computeSGUCoordinates(texts[j], textLatticePositions[j], similarityMatrix[j]).y,
    }));
    const voronoi = computeVoronoiNeighborhood(tempSGU, allCoords);

    // Get previous SGU state for drift calculation
    const previousSGU = sguState.sgus.get(id);
    const drift = computeDrift(
      { ...tempSGU, ...voronoi } as SGU,
      previousSGU
    );

    const sgu: SGU = {
      id,
      text,
      category,
      weight,
      x: coords.x,
      y: coords.y,
      latticeCentroidX: coords.latticeCentroidX,
      latticeCentroidY: coords.latticeCentroidY,
      waveCoherence,
      ...voronoi,
      ...drift,
      firstSeen: previousSGU?.firstSeen || now,
      lastSeen: now,
      observationCount: (previousSGU?.observationCount || 0) + 1,
    };

    // Update SGU state
    sguState.sgus.set(id, sgu);

    // Append drift history
    if (!sguState.driftHistory.has(id)) {
      sguState.driftHistory.set(id, []);
    }
    sguState.driftHistory.get(id)!.push({
      timestamp: now,
      x: sgu.x,
      y: sgu.y,
      angle: Math.atan2(sgu.y, sgu.x),
      radius: Math.sqrt(sgu.x * sgu.x + sgu.y * sgu.y),
      drift: Math.sqrt(drift.driftAngle * drift.driftAngle + drift.driftRadius * drift.driftRadius),
      spiralFidelity: drift.spiralFidelity,
    });

    return sgu;
  });

  // Save state
  saveSGUState(sguState);

  return { sgus, categoryCentroids, primeRegistry: registry };
}

// Compute aggregate SYGON metrics
export function computeSYGONMetrics(sgus: SGU[]): {
  meanWaveCoherence: number;
  meanVoronoiRadius: number;
  meanTauRadius: number;
  meanSpiralFidelity: number;
  totalDrift: number;
} {
  if (sgus.length === 0) {
    return {
      meanWaveCoherence: 0,
      meanVoronoiRadius: 0,
      meanTauRadius: 0,
      meanSpiralFidelity: 0,
      totalDrift: 0,
    };
  }

  const meanWaveCoherence = sgus.reduce((sum, s) => sum + s.waveCoherence, 0) / sgus.length;
  const meanVoronoiRadius = sgus.reduce((sum, s) => sum + s.voronoiRadius, 0) / sgus.length;
  const meanTauRadius = sgus.reduce((sum, s) => sum + s.tauRadius, 0) / sgus.length;
  const meanSpiralFidelity = sgus.reduce((sum, s) => sum + s.spiralFidelity, 0) / sgus.length;
  const totalDrift = sgus.reduce((sum, s) => {
    return sum + Math.sqrt(s.driftAngle * s.driftAngle + s.driftRadius * s.driftRadius);
  }, 0);

  return { meanWaveCoherence, meanVoronoiRadius, meanTauRadius, meanSpiralFidelity, totalDrift };
}

// Clear SYGON state
export function clearSYGONState(): void {
  localStorage.removeItem('sygon_prime_registry');
  localStorage.removeItem('sygon_sgu_state');
}
