/**
 * API wrapper — calls real backend if available, otherwise uses local logic.
 * To plug in a real backend: change BASE_URL to your server and uncomment fetch calls.
 */

import { computeClosure } from './normalization/closure.js';
import { findCandidateKeys } from './normalization/candidateKeys.js';
import { check1NF, check2NF, check3NF, checkBCNF, check4NF, check5NF } from './normalization/normalForms.js';
import { decomposeTo2NF, decomposeTo3NF, decomposeToBCNF, decomposeTo4NF, decomposeTo5NF } from './normalization/decompose.js';

// const BASE_URL = 'http://localhost:3001/api'; // Uncomment to use real backend

export const api = {
  /**
   * Compute attribute closure
   */
  async computeClosure(attrs, fds) {
    // Real backend: return fetch(`${BASE_URL}/closure`, { method:'POST', body: JSON.stringify({attrs, fds}) }).then(r=>r.json())
    return { closure: computeClosure(attrs, fds) };
  },

  /**
   * Find candidate keys
   */
  async findCandidateKeys(allAttrs, fds) {
    return { candidateKeys: findCandidateKeys(allAttrs, fds) };
  },

  /**
   * Run full normalization analysis
   */
  async normalize(schema) {
    const results = {
      '1NF': check1NF(schema),
      '2NF': check2NF(schema),
      '3NF': check3NF(schema),
      'BCNF': checkBCNF(schema),
      '4NF': check4NF(schema),
      '5NF': check5NF(schema),
    };
    const decompositions = {
      '2NF': decomposeTo2NF(schema),
      '3NF': decomposeTo3NF(schema),
      'BCNF': decomposeToBCNF(schema),
      '4NF': decomposeTo4NF(schema),
      '5NF': decomposeTo5NF(schema),
    };
    return { results, decompositions };
  }
};
