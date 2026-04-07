import { computeClosure, isSuperkey } from './closure.js';
import { findCandidateKeys, findPrimeAttributes, findNonPrimeAttributes } from './candidateKeys.js';

// ─────────────────────────────────────────────
// 1NF Check
// ─────────────────────────────────────────────
export function check1NF(schema) {
  // 1NF: all attributes are atomic (no multi-valued, no repeating groups)
  // We check the schema declaration for common non-atomic indicators
  const violations = [];
  const { attributes } = schema;

  attributes.forEach(attr => {
    const name = attr.trim();
    if (/\[|\{|set|list|array/i.test(name)) {
      violations.push({
        type: 'Non-Atomic Attribute',
        attribute: name,
        reason: `"${name}" appears to be a multi-valued or nested attribute (contains set/list/array notation)`
      });
    }
  });

  return {
    normalForm: '1NF',
    satisfied: violations.length === 0,
    violations,
    definition: 'A relation is in 1NF if every attribute contains only atomic (indivisible) values and each row is unique.',
    explanation: violations.length === 0
      ? 'All attributes appear atomic. The relation satisfies 1NF.'
      : `Found ${violations.length} non-atomic attribute(s). Decompose or flatten these to achieve 1NF.`
  };
}

// ─────────────────────────────────────────────
// 2NF Check
// ─────────────────────────────────────────────
export function check2NF(schema) {
  const { attributes, fds } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const primeAttrs = findPrimeAttributes(allAttrs, fds);
  const nonPrimeAttrs = findNonPrimeAttributes(allAttrs, fds);
  const violations = [];

  // Find all composite candidate keys
  const compositeKeys = candidateKeys.filter(k => k.length > 1);

  if (compositeKeys.length === 0) {
    return {
      normalForm: '2NF',
      satisfied: true,
      violations: [],
      candidateKeys,
      primeAttributes: primeAttrs,
      nonPrimeAttributes: nonPrimeAttrs,
      definition: 'A relation is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on every candidate key (no partial dependencies).',
      explanation: 'All candidate keys are simple (single attribute), so no partial dependencies are possible. The relation is in 2NF.'
    };
  }

  // Check for partial dependencies: non-prime attr determined by proper subset of a candidate key
  for (const fd of fds) {
    const lhs = fd.lhs.map(a => a.trim().toUpperCase());
    const rhs = fd.rhs.map(a => a.trim().toUpperCase());

    for (const ck of compositeKeys) {
      // Is lhs a proper subset of ck?
      const isProperSubset = lhs.length < ck.length && lhs.every(a => ck.includes(a));
      if (!isProperSubset) continue;

      // Does rhs contain any non-prime attributes?
      const partiallyDetermined = rhs.filter(a => nonPrimeAttrs.includes(a));
      if (partiallyDetermined.length > 0) {
        violations.push({
          type: 'Partial Dependency',
          determinant: lhs,
          determined: partiallyDetermined,
          candidateKey: ck,
          reason: `{${lhs.join(', ')}} → {${partiallyDetermined.join(', ')}} is a partial dependency because {${lhs.join(', ')}} is a proper subset of candidate key {${ck.join(', ')}}`
        });
      }
    }
  }

  return {
    normalForm: '2NF',
    satisfied: violations.length === 0,
    violations,
    candidateKeys,
    primeAttributes: primeAttrs,
    nonPrimeAttributes: nonPrimeAttrs,
    definition: 'A relation is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on every candidate key (no partial dependencies).',
    explanation: violations.length === 0
      ? 'No partial dependencies found. The relation is in 2NF.'
      : `Found ${violations.length} partial dependency/ies. Non-prime attributes depend on a proper subset of a candidate key.`
  };
}

// ─────────────────────────────────────────────
// 3NF Check
// ─────────────────────────────────────────────
export function check3NF(schema) {
  const { attributes, fds } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const primeAttrs = findPrimeAttributes(allAttrs, fds);
  const violations = [];

  for (const fd of fds) {
    const lhs = fd.lhs.map(a => a.trim().toUpperCase());
    const rhs = fd.rhs.map(a => a.trim().toUpperCase());

    // Check if lhs is a superkey
    if (isSuperkey(lhs, allAttrs, fds)) continue;

    // Check if all RHS attributes are prime
    const nonPrimeRhs = rhs.filter(a => !primeAttrs.includes(a));
    if (nonPrimeRhs.length > 0) {
      violations.push({
        type: 'Transitive Dependency',
        determinant: lhs,
        determined: nonPrimeRhs,
        reason: `{${lhs.join(', ')}} → {${nonPrimeRhs.join(', ')}}: "${lhs.join(', ')}" is not a superkey, and "${nonPrimeRhs.join(', ')}" is/are non-prime attribute(s). This creates a transitive dependency.`
      });
    }
  }

  return {
    normalForm: '3NF',
    satisfied: violations.length === 0,
    violations,
    candidateKeys,
    primeAttributes: primeAttrs,
    definition: 'A relation is in 3NF if it is in 2NF and for every FD X→Y, either X is a superkey OR Y consists entirely of prime attributes (no transitive dependencies).',
    explanation: violations.length === 0
      ? 'No transitive dependencies found. The relation is in 3NF.'
      : `Found ${violations.length} transitive dependency/ies. Some non-prime attributes are determined by non-superkeys.`
  };
}

// ─────────────────────────────────────────────
// BCNF Check
// ─────────────────────────────────────────────
export function checkBCNF(schema) {
  const { attributes, fds } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const violations = [];

  for (const fd of fds) {
    const lhs = fd.lhs.map(a => a.trim().toUpperCase());
    const rhs = fd.rhs.map(a => a.trim().toUpperCase());

    // Trivial FD: rhs ⊆ lhs
    if (rhs.every(a => lhs.includes(a))) continue;

    if (!isSuperkey(lhs, allAttrs, fds)) {
      violations.push({
        type: 'BCNF Violation',
        determinant: lhs,
        determined: rhs,
        reason: `{${lhs.join(', ')}} → {${rhs.join(', ')}}: "${lhs.join(', ')}" is not a superkey, violating BCNF. Every determinant must be a superkey.`
      });
    }
  }

  return {
    normalForm: 'BCNF',
    satisfied: violations.length === 0,
    violations,
    candidateKeys,
    definition: 'A relation is in BCNF if for every non-trivial FD X→Y, X is a superkey. BCNF is stricter than 3NF — it eliminates all redundancy due to FDs.',
    explanation: violations.length === 0
      ? 'Every determinant is a superkey. The relation is in BCNF.'
      : `Found ${violations.length} BCNF violation(s). Some FD determinants are not superkeys.`
  };
}

// ─────────────────────────────────────────────
// 4NF Check  (Multi-Valued Dependencies)
// ─────────────────────────────────────────────
export function check4NF(schema) {
  const { attributes, fds, mvds = [] } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const violations = [];

  for (const mvd of mvds) {
    const lhs = mvd.lhs.map(a => a.trim().toUpperCase());
    const rhs = mvd.rhs.map(a => a.trim().toUpperCase());

    // Trivial MVD: rhs ⊆ lhs, OR lhs ∪ rhs = allAttrs
    const union = [...new Set([...lhs, ...rhs])];
    if (rhs.every(a => lhs.includes(a))) continue;
    if (union.length === allAttrs.length && allAttrs.every(a => union.includes(a))) continue;

    // Is lhs a superkey?
    if (!isSuperkey(lhs, allAttrs, fds)) {
      violations.push({
        type: '4NF Violation',
        determinant: lhs,
        determined: rhs,
        reason: `{${lhs.join(', ')}} ↠ {${rhs.join(', ')}}: "${lhs.join(', ')}" is a non-trivial MVD where the determinant is not a superkey. This creates data redundancy.`
      });
    }
  }

  const hasBCNFViolations = checkBCNF(schema).violations.length > 0;

  return {
    normalForm: '4NF',
    satisfied: !hasBCNFViolations && violations.length === 0,
    violations,
    candidateKeys,
    mvds,
    definition: 'A relation is in 4NF if it is in BCNF and contains no non-trivial multi-valued dependencies (MVDs) where the determinant is not a superkey.',
    explanation: violations.length === 0 && !hasBCNFViolations
      ? mvds.length === 0
        ? 'No multi-valued dependencies provided. Assuming 4NF is satisfied.'
        : 'No non-trivial MVD violations found. The relation satisfies 4NF.'
      : violations.length > 0
        ? `Found ${violations.length} MVD violation(s). Non-trivial MVDs exist where the determinant is not a superkey.`
        : 'The relation has BCNF violations, so it cannot be in 4NF.'
  };
}

// ─────────────────────────────────────────────
// 5NF Check  (Join Dependencies)
// ─────────────────────────────────────────────
export function check5NF(schema) {
  const { attributes, fds, mvds = [], jds = [] } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const violations = [];

  // Check join dependencies
  for (const jd of jds) {
    // A JD ⋈{R1, R2, ..., Rk} is trivial if one Ri equals allAttrs
    const components = jd.components.map(c => c.map(a => a.trim().toUpperCase()));
    const isTrivial = components.some(c =>
      c.length === allAttrs.length && allAttrs.every(a => c.includes(a))
    );
    if (isTrivial) continue;

    // Is every component derivable from a candidate key?
    const isImpliedByKey = components.every(c =>
      candidateKeys.some(ck => ck.every(k => c.includes(k)))
    );

    if (!isImpliedByKey) {
      violations.push({
        type: '5NF Violation',
        components: components.map(c => `{${c.join(', ')}}`),
        reason: `The join dependency ⋈{${components.map(c => `{${c.join(', ')}}`).join(', ')}} is non-trivial and is not implied by any candidate key.`
      });
    }
  }

  const has4NFViolations = check4NF(schema).violations.length > 0;

  return {
    normalForm: '5NF',
    satisfied: !has4NFViolations && violations.length === 0,
    violations,
    candidateKeys,
    jds,
    definition: 'A relation is in 5NF (Project-Join Normal Form / PJNF) if every non-trivial join dependency is implied by the candidate keys. It ensures lossless decomposition.',
    explanation: violations.length === 0 && !has4NFViolations
      ? jds.length === 0
        ? 'No join dependencies provided. Assuming 5NF is satisfied (every JD implied by candidate keys).'
        : 'No non-trivial join dependency violations. The relation satisfies 5NF.'
      : violations.length > 0
        ? `Found ${violations.length} join dependency violation(s) not implied by candidate keys.`
        : 'The relation has 4NF violations, so it cannot be in 5NF.'
  };
}
