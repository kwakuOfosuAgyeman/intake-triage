

/**
 * Keyword-based classification with weighted scoring
 * 
 * Algorithm:
 * 1. Normalize input (lowercase, trim)
 * 2. Score each category based on keyword matches
 * 3. Return category with highest score, or 'other' if no matches
 * 
 * Scoring: Each keyword match = 1 point, partial word match = 0.5 points
 */

const KEYWORDS = {
    billing: [
        'invoice', 'payment', 'bill', 'charge', 'refund',
        'subscription', 'pricing', 'cost', 'fee', 'overcharge',
        'credit card', 'receipt'
    ],
    technical_support: [
        'login', 'error', 'broken', 'bug', 'crash', 'not working',
        'can\'t access', 'cannot access', 'down', 'offline',
        '500', '404', 'timeout', 'slow', 'password'
    ],
    new_matter_project: [
        'quote', 'new project', 'engagement', 'proposal',
        'consultation', 'hire', 'estimate', 'contract',
        'scope', 'start', 'begin', 'initiate'
    ]
};

/**
 * Score text against keyword list
 * @param {string} text - Normalized text to score
 * @param {string[]} keywords - Keywords to match against
 * @returns {number} Score (higher = better match)
 */
function scoreKeywords(text, keywords) {
    let score = 0;

    for (const keyword of keywords) {
        // Exact phrase match
        if (text.includes(keyword)) {
            score += 1;
        }
        // Individual word matches (partial credit)
        else {
            const keywordWords = keyword.split(' ');
            const matchedWords = keywordWords.filter(word =>
                text.includes(word)
            );
            score += (matchedWords.length / keywordWords.length) * 0.5;
        }
    }

    return score;
}

/**
 * Classify intake based on description
 * @param {string} description - User's intake description
 * @returns {string} Category: billing|technical_support|new_matter_project|other
 */
export function classifyIntake(description) {
    const normalized = description.toLowerCase().trim();

    // Score each category
    const scores = {
        billing: scoreKeywords(normalized, KEYWORDS.billing),
        technical_support: scoreKeywords(normalized, KEYWORDS.technical_support),
        new_matter_project: scoreKeywords(normalized, KEYWORDS.new_matter_project)
    };

    // Find highest scoring category
    let maxCategory = 'other';
    let maxScore = 0;

    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            maxCategory = category;
        }
    }

    // Require minimum score threshold to avoid false positives
    return maxScore >= 0.5 ? maxCategory : 'other';
}