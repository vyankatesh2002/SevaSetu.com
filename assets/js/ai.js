/* ============================================================
   SevaSetu - AI Simulation Layer (ai.js)
   ------------------------------------------------------------
   ⚠️ IMPORTANT: This is a SIMULATED AI for the frontend
   prototype. It uses keyword matching and heuristics. It is NOT
   a real ML model. When the real backend is connected, these
   functions can be replaced by calls to the FastAPI/Transformers
   service described in the research docs.
   ============================================================ */

(function () {
    'use strict';

    // Map keywords to department + category + suggested SLA (hours)
    var RULES = [
        { keywords: ['water leuk', 'water leak', 'no water', 'pipe', 'contamination', 'muddy'], category: 'Water Supply', department: 'Water Supply', priority: 'High', sla: 48 },
        { keywords: ['electricity', 'power cut', 'voltage', 'transformer', 'wire'], category: 'Electricity', department: 'Electricity', priority: 'High', sla: 72 },
        { keywords: ['street light', 'lamp', 'light not'], category: 'Street Lights', department: 'Street Lights', priority: 'Medium', sla: 72 },
        { keywords: ['road', 'pothole', 'pwd', 'asphalt', 'road damage'], category: 'Roads & PWD', department: 'Roads & PWD', priority: 'High', sla: 96 },
        { keywords: ['garbage', 'waste', 'sanitation', 'bins', 'trash'], category: 'Sanitation', department: 'Sanitation', priority: 'Medium', sla: 48 },
        { keywords: ['sewage', 'drainage', 'manhole', 'drain'], category: 'Drainage', department: 'Municipal', priority: 'High', sla: 48 },
        { keywords: ['health', 'hospital', 'medical', 'clinic'], category: 'Health', department: 'Health', priority: 'High', sla: 24 },
        { keywords: ['police', 'theft', 'crime', 'harassment'], category: 'Police', department: 'Police', priority: 'Critical', sla: 12 },
        { keywords: ['fire', 'burn', 'smoke'], category: 'Fire', department: 'Fire', priority: 'Critical', sla: 6 },
        { keywords: ['bus', 'transport', 'auto', 'traffic'], category: 'Transport', department: 'Transport', priority: 'Medium', sla: 72 },
        { keywords: ['encroachment', 'municipal', 'building', 'licence'], category: 'Municipal', department: 'Municipal', priority: 'Medium', sla: 96 }
    ];

    // Keyword-based priority boosters
    var CRITICAL_WORDS = ['emergency', 'critical', 'urgent', 'danger', 'accident', 'fire', 'flood', 'medical', 'contamination', 'leak', 'gas'];
    var HIGH_WORDS = ['broke', 'broken', 'damage', 'leaking', 'no water', 'no electricity', 'overflow'];

    function detect(text) {
        var lower = (text || '').toLowerCase();
        var match = null;
        for (var i = 0; i < RULES.length; i++) {
            var rule = RULES[i];
            for (var j = 0; j < rule.keywords.length; j++) {
                if (lower.indexOf(rule.keywords[j]) !== -1) {
                    match = rule;
                    break;
                }
            }
            if (match) break;
        }

        var category = match ? match.category : 'Other';
        var department = match ? match.department : 'Municipal';
        var priority = match ? match.priority : 'Medium';
        var sla = match ? match.sla : 72;

        // Boost priority
        for (var k = 0; k < CRITICAL_WORDS.length; k++) {
            if (lower.indexOf(CRITICAL_WORDS[k]) !== -1) { priority = 'Critical'; sla = Math.min(sla, 12); break; }
        }
        if (priority !== 'Critical') {
            for (var m = 0; m < HIGH_WORDS.length; m++) {
                if (lower.indexOf(HIGH_WORDS[m]) !== -1) { if (priority === 'Medium') priority = 'High'; break; }
            }
        }

        // Confidence score (simulated)
        var confidence = 70 + Math.floor(Math.random() * 25);

        // Simulated AI summary
        var summary = 'AI classified this complaint under "' + category + '" with ' + priority +
            ' priority. Suggested routing to ' + department + ' department.';

        return {
            category: category,
            department: department,
            priority: priority,
            sla: sla,
            confidence: confidence,
            summary: summary
        };
    }

    // Simulate async AI processing (returns a Promise)
    function processAsync(text) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(detect(text));
            }, 1200);
        });
    }

    window.SVSAI = {
        detect: detect,
        processAsync: processAsync,
        RULES: RULES
    };
})();
