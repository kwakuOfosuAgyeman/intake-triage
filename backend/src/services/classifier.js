const KEYWORDS = {
    billing: {
        strong: ['invoice', 'overcharge', 'refund', 'receipt', 'credit card', 'subscription'], // Added subscription here
        weak: ['payment', 'bill', 'charge', 'pricing', 'cost', 'fee', 'cancel'] // Added cancel here
    },
    technical_support: {
        strong: ['error', 'broken', 'crash', '500', '404', 'timeout', 'down', 'offline'], // Added down/offline here
        weak: ['login', 'bug', 'slow', 'password', 'not working', 'access'] // Added access here
    },
    new_matter_project: {
        strong: ['quote', 'proposal', 'new project', 'engagement', 'consultation'],
        weak: ['hire', 'estimate', 'contract', 'scope', 'start', 'begin']
    }
};

function scoreKeywords(text, categoryKeywords) {
    let score = 0;
    
    // Check Strong Keywords (2 points each)
    categoryKeywords.strong.forEach(kw => {
        if (text.includes(kw)) score += 2;
    });

    // Check Weak Keywords (1 point each)
    categoryKeywords.weak.forEach(kw => {
        if (text.includes(kw)) score += 1;
    });

    return score;
}

export function classifyIntake(description) {
    const normalized = description.toLowerCase().trim();

    const scores = {
        billing: scoreKeywords(normalized, KEYWORDS.billing),
        technical_support: scoreKeywords(normalized, KEYWORDS.technical_support),
        new_matter_project: scoreKeywords(normalized, KEYWORDS.new_matter_project)
    };

    let maxCategory = 'other';
    let maxScore = 0;

    for (const [category, score] of Object.entries(scores)) {
        // If tied, you could add logic here, but weights usually prevent ties
        if (score > maxScore) {
            maxScore = score;
            maxCategory = category;
        }
    }

    return maxScore >= 1 ? maxCategory : 'other';
}