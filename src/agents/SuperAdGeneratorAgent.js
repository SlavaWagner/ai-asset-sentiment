import BaseAgent from './BaseAgent.js';

export default class SuperAdGeneratorAgent extends BaseAgent {
  constructor() {
    super('super_ad_agent');
  }

  /**
   * Forecasts target audience emotional fits and generates optimized SUPER ADS.
   * @param {string} finalUrl - Target landing page URL
   * @param {Array<object>} scoredAssets - JSON array of scored assets
   * @returns {Promise<string>} Detailed Markdown report containing the audience fit analysis and the generated SUPER ADS
   */
  async generateSuperAds(finalUrl, scoredAssets) {
    const scoredSummary = scoredAssets.map(a => 
      `- Text: "${a.text}" | Type: ${a.type} | Openness: ${a.big_five.openness.score}, Conscientiousness: ${a.big_five.conscientiousness.score}, Extraversion: ${a.big_five.extraversion.score}, Agreeableness: ${a.big_five.agreeableness.score}, Neuroticism: ${a.big_five.neuroticism.score} | Sentiment: ${a.sentiment.score}`
    ).join('\n');

    const userPrompt = `
We are optimizing a Google Ads campaign targeting this landing page URL:
Landing Page URL: ${finalUrl}

Here are the psychometric and sentiment scores of our current assets:
=========================================
${scoredSummary}
=========================================

Please execute the following tasks:

1. TARGET AUDIENCE EMOTIONAL FORECAST:
   - Analyze the target landing page and its core value proposition.
   - Project the ideal psychological profile (Big Five values and Sentiment preference) of the target audience that would convert best on this page. Explain the reasoning.

2. SUPER ADS FUSION & CREATION:
   - Based on the target emotional profile, write the absolute "SUPER ADS" combinations.
   - You must generate:
     - exactly 15 headlines (maximum 30 characters each).
     - exactly 4 long headlines (maximum 90 characters each).
     - exactly 4 descriptions (maximum 90 characters each).
   - Character limits are strict! (headlines <= 30, long headlines <= 90, descriptions <= 90 characters, including spaces).
   - Write these copy assets to align with the language of the landing page.
   - For each generated asset, specify its target Big Five trait focus (e.g. openness, conscientiousness) and why it matches the audience forecast.

Provide your output in structured Markdown.
`;

    return await this.generateCompletion(userPrompt, false);
  }
}
