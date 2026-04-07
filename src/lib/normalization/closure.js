/**
 * Attribute Closure Algorithm
 * Given a set of attributes and functional dependencies,
 * computes the closure X+ (the set of all attributes functionally determined by X).
 *
 * @param {string[]} attrs  - e.g. ['A', 'B']
 * @param {Array<{lhs: string[], rhs: string[]}>} fds - functional dependencies
 * @returns {string[]} closure
 */
export function computeClosure(attrs, fds) {
  let closure = new Set(attrs.map(a => a.trim().toUpperCase()));
  let changed = true;
  while (changed) {
    changed = false;
    for (const fd of fds) {
      const lhs = fd.lhs.map(a => a.trim().toUpperCase());
      const rhs = fd.rhs.map(a => a.trim().toUpperCase());
      if (lhs.every(a => closure.has(a))) {
        for (const a of rhs) {
          if (!closure.has(a)) {
            closure.add(a);
            changed = true;
          }
        }
      }
    }
  }
  return [...closure].sort();
}

/**
 * Check if a set of attributes is a superkey
 */
export function isSuperkey(attrs, allAttrs, fds) {
  const closure = computeClosure(attrs, fds);
  return allAttrs.every(a => closure.includes(a.trim().toUpperCase()));
}
