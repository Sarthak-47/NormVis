import { computeClosure, isSuperkey } from './closure.js';

/**
 * Find all candidate keys of a relation.
 * A candidate key is a minimal superkey.
 *
 * @param {string[]} allAttrs - all attributes of the relation
 * @param {Array<{lhs: string[], rhs: string[]}>} fds
 * @returns {string[][]} array of candidate keys
 */
export function findCandidateKeys(allAttrs, fds) {
  const attrs = allAttrs.map(a => a.trim().toUpperCase());
  const n = attrs.length;
  const candidateKeys = [];

  // Generate all subsets from size 1 to n
  for (let size = 1; size <= n; size++) {
    const subsets = getSubsets(attrs, size);
    for (const subset of subsets) {
      if (isSuperkey(subset, attrs, fds)) {
        // Check it's minimal (no proper subset is also a candidate key)
        const isMinimal = !candidateKeys.some(ck =>
          ck.every(a => subset.includes(a))
        );
        if (isMinimal) {
          candidateKeys.push(subset.sort());
        }
      }
    }
    // If we already found candidate keys at this size, no need for larger sizes
    // (Optimization: only if none of the larger sets can be candidate keys independently)
  }

  return candidateKeys;
}

/**
 * Get all subsets of a given size
 */
function getSubsets(arr, size) {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  const withFirst = getSubsets(rest, size - 1).map(s => [first, ...s]);
  const withoutFirst = getSubsets(rest, size);
  return [...withFirst, ...withoutFirst];
}

/**
 * Check if a specific set of attributes is a candidate key
 */
export function isCandidateKey(attrs, allAttrs, fds) {
  const normalized = attrs.map(a => a.trim().toUpperCase());
  if (!isSuperkey(normalized, allAttrs, fds)) return false;
  // Check minimality
  for (let i = 0; i < normalized.length; i++) {
    const subset = normalized.filter((_, idx) => idx !== i);
    if (subset.length > 0 && isSuperkey(subset, allAttrs, fds)) return false;
  }
  return true;
}

/**
 * Find all prime attributes (attributes that appear in at least one candidate key)
 */
export function findPrimeAttributes(allAttrs, fds) {
  const keys = findCandidateKeys(allAttrs, fds);
  const primes = new Set(keys.flat());
  return [...primes].sort();
}

/**
 * Find all non-prime attributes
 */
export function findNonPrimeAttributes(allAttrs, fds) {
  const primes = findPrimeAttributes(allAttrs, fds);
  return allAttrs
    .map(a => a.trim().toUpperCase())
    .filter(a => !primes.includes(a));
}
