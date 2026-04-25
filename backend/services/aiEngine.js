// AI Engine — Rule-based intelligence for complaint analysis and routing

/**
 * Analyze complaint text to determine severity and priority
 * Phase 1: Rule-based keyword matching
 * Phase 2+: NLP / ML models
 */
export function analyzeComplaint(data) {
  let severity = 'low';
  let tags = [];

  const text = ((data.category || '') + ' ' + (data.description || '')).toLowerCase();

  // High severity keywords
  const highKeywords = ['fire', 'accident', 'emergency', 'attack', 'explosion', 'injury', 'death', 'weapon', 'gun', 'bomb'];
  // Medium severity keywords
  const mediumKeywords = ['water', 'electricity', 'traffic', 'theft', 'fraud', 'assault', 'noise', 'violence'];

  for (const kw of highKeywords) {
    if (text.includes(kw)) {
      severity = 'high';
      tags.push(kw);
    }
  }

  // Only check medium if not already high
  if (severity !== 'high') {
    for (const kw of mediumKeywords) {
      if (text.includes(kw)) {
        severity = 'medium';
        tags.push(kw);
      }
    }
  }

  // Category-based overrides
  const highCategories = ['Assault', 'Fraud', 'Theft'];
  const mediumCategories = ['Noise', 'Traffic'];

  if (highCategories.includes(data.category)) {
    severity = 'high';
  } else if (mediumCategories.includes(data.category) && severity === 'low') {
    severity = 'medium';
  }

  return {
    severity,
    priorityScore: severity === 'high' ? 3 : severity === 'medium' ? 2 : 1,
    tags: [...new Set(tags)]
  };
}

/**
 * Assign the least-loaded available officer
 */
export function assignOfficer(officers) {
  const available = officers.filter(o => o.online !== false);

  if (available.length === 0) return null;

  // Sort by assignedCount (load), then by lastAssigned time if available
  available.sort((a, b) => (a.assignedCount || 0) - (b.assignedCount || 0));

  return available[0].id;
}

/**
 * Check if a complaint should be escalated due to delays
 */
export function checkEscalation(complaint) {
  const now = Date.now();
  const created = new Date(complaint.createdAt).getTime();
  const timePassed = now - created;

  // Demo: escalate after 1 minute for testing
  // Production: use 30 min, 1 hour, etc.
  const ESCALATION_THRESHOLD = 60000; // 1 minute

  if (complaint.status !== 'RESOLVED' && timePassed > ESCALATION_THRESHOLD) {
    return {
      escalated: true,
      reason: 'Delayed resolution',
      timePassed,
      severity: 'high'
    };
  }

  return { escalated: false };
}

/**
 * Auto-escalate all pending complaints (batch check)
 */
export function batchEscalationCheck(complaints) {
  return complaints.map(c => {
    const escalation = checkEscalation(c);
    if (escalation.escalated) {
      return {
        ...c.toObject ? c.toObject() : c,
        status: 'ESCALATED',
        escalationReason: escalation.reason
      };
    }
    return c;
  });
}

