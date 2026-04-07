import { computeClosure, isSuperkey } from './closure.js';
import { findCandidateKeys } from './candidateKeys.js';

// ─────────────────────────────────────────────
// Decompose to 2NF
// ─────────────────────────────────────────────
export function decomposeTo2NF(schema) {
  const { attributes, fds } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const compositeKeys = candidateKeys.filter(k => k.length > 1);

  if (compositeKeys.length === 0) {
    return [{
      name: schema.name || 'R',
      attributes: allAttrs,
      fds,
      candidateKeys,
      note: 'No composite keys — already in 2NF'
    }];
  }

  const partialGroups = {};
  const remainingAttrs = new Set(allAttrs);

  // Find partial dependencies
  for (const fd of fds) {
    const lhs = fd.lhs.map(a => a.trim().toUpperCase());
    const rhs = fd.rhs.map(a => a.trim().toUpperCase());

    for (const ck of compositeKeys) {
      const isProperSubset = lhs.length < ck.length && lhs.every(a => ck.includes(a));
      if (!isProperSubset) continue;

      const key = lhs.sort().join(',');
      if (!partialGroups[key]) {
        partialGroups[key] = { determinant: lhs, attrs: new Set(lhs), fds: [] };
      }
      rhs.forEach(a => partialGroups[key].attrs.add(a));
      partialGroups[key].fds.push(fd);
      rhs.forEach(a => remainingAttrs.delete(a));
    }
  }

  const relations = [];

  // Create a relation for each partial dependency group
  Object.values(partialGroups).forEach((group, i) => {
    const attrs = [...group.attrs].sort();
    relations.push({
      name: `R${i + 1}`,
      attributes: attrs,
      fds: group.fds,
      candidateKeys: [group.determinant],
      note: `Decomposed to remove partial dependency: {${group.determinant.join(', ')}} → {...}`
    });
  });

  // Main relation with remaining attrs + all candidate keys
  const mainAttrs = [...remainingAttrs].sort();
  if (mainAttrs.length > 0) {
    const mainFds = fds.filter(fd => {
      const lhs = fd.lhs.map(a => a.trim().toUpperCase());
      return lhs.every(a => mainAttrs.includes(a));
    });
    relations.push({
      name: `R${relations.length + 1}`,
      attributes: mainAttrs,
      fds: mainFds,
      candidateKeys: findCandidateKeys(mainAttrs, mainFds),
      note: 'Main relation after removing partial dependencies'
    });
  }

  return relations;
}

// ─────────────────────────────────────────────
// Decompose to 3NF (Synthesis Algorithm)
// ─────────────────────────────────────────────
export function decomposeTo3NF(schema) {
  const { attributes, fds } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);

  // Step 1: Find canonical cover (minimal FD set)
  const canonicalCover = findCanonicalCover(fds);

  // Step 2: Build a relation for each FD in canonical cover
  const relations = [];
  const usedFds = new Set();

  for (const fd of canonicalCover) {
    const lhs = fd.lhs.map(a => a.trim().toUpperCase()).sort();
    const rhs = fd.rhs.map(a => a.trim().toUpperCase()).sort();
    const attrs = [...new Set([...lhs, ...rhs])].sort();
    const key = `${lhs.join(',')}->${rhs.join(',')}`;
    if (!usedFds.has(key)) {
      usedFds.add(key);
      relations.push({
        name: `R${relations.length + 1}`,
        attributes: attrs,
        fds: canonicalCover.filter(f => {
          const fl = f.lhs.map(a => a.toUpperCase()).sort().join(',');
          return fl === lhs.join(',');
        }),
        candidateKeys: [lhs],
        note: `Schema from FD: {${lhs.join(', ')}} → {${rhs.join(', ')}}`
      });
    }
  }

  // Step 3: If no relation contains a candidate key, add one
  const hasKey = relations.some(rel =>
    candidateKeys.some(ck => ck.every(k => rel.attributes.includes(k)))
  );
  if (!hasKey && candidateKeys.length > 0) {
    const ck = candidateKeys[0];
    relations.push({
      name: `R${relations.length + 1}`,
      attributes: ck.sort(),
      fds: [],
      candidateKeys: [ck],
      note: `Added to preserve candidate key: {${ck.join(', ')}}`
    });
  }

  // Step 4: Remove redundant relations
  const deduplicated = [];
  for (const rel of relations) {
    const isDup = deduplicated.some(r =>
      r.attributes.length === rel.attributes.length &&
      r.attributes.every(a => rel.attributes.includes(a))
    );
    if (!isDup) deduplicated.push(rel);
  }

  return deduplicated;
}

// ─────────────────────────────────────────────
// Decompose to BCNF
// ─────────────────────────────────────────────
export function decomposeToBCNF(schema) {
  const normalize = (rel) => {
    const { attributes, fds } = rel;
    const allAttrs = attributes.map(a => a.trim().toUpperCase());
    const candidateKeys = findCandidateKeys(allAttrs, fds);

    // Find a BCNF violation
    for (const fd of fds) {
      const lhs = fd.lhs.map(a => a.trim().toUpperCase());
      const rhs = fd.rhs.map(a => a.trim().toUpperCase());
      if (rhs.every(a => lhs.includes(a))) continue; // trivial
      if (isSuperkey(lhs, allAttrs, fds)) continue; // ok

      // Decompose: R1 = lhs ∪ rhs, R2 = lhs ∪ (allAttrs \ rhs)
      const r1Attrs = [...new Set([...lhs, ...rhs])].sort();
      const r2Attrs = [...new Set([...lhs, ...allAttrs.filter(a => !rhs.includes(a))])].sort();

      const r1Fds = fds.filter(f => {
        const fl = f.lhs.map(a => a.toUpperCase());
        return fl.every(a => r1Attrs.includes(a));
      });
      const r2Fds = fds.filter(f => {
        const fl = f.lhs.map(a => a.toUpperCase());
        return fl.every(a => r2Attrs.includes(a));
      });

      const r1Keys = findCandidateKeys(r1Attrs, r1Fds);
      const r2Keys = findCandidateKeys(r2Attrs, r2Fds);

      return [
        { name: rel.name + 'a', attributes: r1Attrs, fds: r1Fds, candidateKeys: r1Keys, note: `Decomposed from ${rel.name}: ${lhs.join(',')}→${rhs.join(',')}` },
        { name: rel.name + 'b', attributes: r2Attrs, fds: r2Fds, candidateKeys: r2Keys, note: `Remainder from ${rel.name}` }
      ];
    }
    return [rel]; // Already BCNF
  };

  let queue = [{ ...schema, name: schema.name || 'R', candidateKeys: findCandidateKeys(schema.attributes.map(a => a.toUpperCase()), schema.fds) }];
  let result = [];
  let iterations = 0;

  while (queue.length > 0 && iterations < 20) {
    iterations++;
    const rel = queue.shift();
    const decomposed = normalize(rel);
    if (decomposed.length === 1) {
      result.push(decomposed[0]);
    } else {
      queue.push(...decomposed);
    }
  }

  // Rename nicely
  return result.map((r, i) => ({ ...r, name: `R${i + 1}` }));
}

// ─────────────────────────────────────────────
// Decompose to 4NF
// ─────────────────────────────────────────────
export function decomposeTo4NF(schema) {
  const { attributes, fds, mvds = [] } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const relations = [];

  if (mvds.length === 0) {
    return [{
      name: schema.name || 'R',
      attributes: allAttrs,
      fds,
      mvds: [],
      candidateKeys,
      note: 'No MVDs provided. Relation assumed to be in 4NF.'
    }];
  }

  // For each non-trivial MVD X ↠ Y where X is not a superkey
  let processed = [...allAttrs];
  let baseSchema = { ...schema, attributes: processed };

  for (const mvd of mvds) {
    const lhs = mvd.lhs.map(a => a.trim().toUpperCase());
    const rhs = mvd.rhs.map(a => a.trim().toUpperCase());

    // Trivial check
    if (rhs.every(a => lhs.includes(a))) continue;
    const union = [...new Set([...lhs, ...rhs])];
    if (union.length === allAttrs.length) continue;

    if (!isSuperkey(lhs, allAttrs, fds)) {
      // R1 = lhs ∪ rhs
      const r1Attrs = [...new Set([...lhs, ...rhs])].sort();
      const r1Fds = fds.filter(f => f.lhs.map(a => a.toUpperCase()).every(a => r1Attrs.includes(a)));
      const r1Keys = findCandidateKeys(r1Attrs, r1Fds);
      relations.push({
        name: `R${relations.length + 1}`,
        attributes: r1Attrs,
        fds: r1Fds,
        mvds: mvds.filter(m => m.lhs.map(a=>a.toUpperCase()).every(a => r1Attrs.includes(a))),
        candidateKeys: r1Keys,
        note: `4NF decomposition: removed MVD {${lhs.join(', ')}} ↠ {${rhs.join(', ')}}`
      });

      // R2 = lhs ∪ (allAttrs \ rhs)
      const r2Attrs = [...new Set([...lhs, ...allAttrs.filter(a => !rhs.includes(a))])].sort();
      const r2Fds = fds.filter(f => f.lhs.map(a => a.toUpperCase()).every(a => r2Attrs.includes(a)));
      const r2Keys = findCandidateKeys(r2Attrs, r2Fds);
      relations.push({
        name: `R${relations.length + 1}`,
        attributes: r2Attrs,
        fds: r2Fds,
        mvds: [],
        candidateKeys: r2Keys,
        note: `Remainder after 4NF decomposition`
      });
    }
  }

  if (relations.length === 0) {
    return [{
      name: schema.name || 'R',
      attributes: allAttrs,
      fds,
      mvds,
      candidateKeys,
      note: 'No 4NF violations — relation is already in 4NF.'
    }];
  }

  return relations;
}

// ─────────────────────────────────────────────
// Decompose to 5NF
// ─────────────────────────────────────────────
export function decomposeTo5NF(schema) {
  const { attributes, fds, mvds = [], jds = [] } = schema;
  const allAttrs = attributes.map(a => a.trim().toUpperCase());
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const relations = [];

  if (jds.length === 0) {
    return [{
      name: schema.name || 'R',
      attributes: allAttrs,
      fds,
      candidateKeys,
      note: 'No join dependencies provided. Relation assumed to be in 5NF.'
    }];
  }

  for (const jd of jds) {
    const components = jd.components.map(c => c.map(a => a.trim().toUpperCase()));

    // Trivial check
    const isTrivial = components.some(c =>
      c.length === allAttrs.length && allAttrs.every(a => c.includes(a))
    );
    if (isTrivial) continue;

    // Not implied by candidate key → decompose
    const isImplied = components.every(c =>
      candidateKeys.some(ck => ck.every(k => c.includes(k)))
    );

    if (!isImplied) {
      components.forEach((comp, i) => {
        const compFds = fds.filter(f =>
          f.lhs.map(a => a.toUpperCase()).every(a => comp.includes(a))
        );
        const compKeys = findCandidateKeys(comp, compFds);
        relations.push({
          name: `R${relations.length + 1}`,
          attributes: comp.sort(),
          fds: compFds,
          candidateKeys: compKeys,
          note: `5NF decomposition component ${i + 1}: part of join dependency`
        });
      });
      break;
    }
  }

  if (relations.length === 0) {
    return [{
      name: schema.name || 'R',
      attributes: allAttrs,
      fds,
      candidateKeys,
      note: 'No 5NF violations — all join dependencies are implied by candidate keys.'
    }];
  }

  return relations;
}

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
function findCanonicalCover(fds) {
  // Simplified canonical cover computation
  // Step 1: Split RHS
  let cover = [];
  for (const fd of fds) {
    const lhs = fd.lhs.map(a => a.trim().toUpperCase());
    for (const rha of fd.rhs) {
      cover.push({ lhs: [...lhs], rhs: [rha.trim().toUpperCase()] });
    }
  }

  // Step 2: Remove extraneous attributes from LHS
  cover = cover.map(fd => {
    const newLhs = fd.lhs.filter((attr, i) => {
      const reduced = fd.lhs.filter((_, j) => j !== i);
      if (reduced.length === 0) return true;
      const closure = computeClosure(reduced, fds);
      return !closure.includes(fd.rhs[0]);
    });
    return { ...fd, lhs: newLhs.length > 0 ? newLhs : fd.lhs };
  });

  // Step 3: Remove redundant FDs
  cover = cover.filter((fd, idx) => {
    const others = cover.filter((_, i) => i !== idx);
    const closure = computeClosure(fd.lhs, others);
    return !closure.includes(fd.rhs[0]);
  });

  return cover;
}
