import BaseAgent from './BaseAgent.js';

export default class SentimentScoringAgent extends BaseAgent {
  constructor() {
    super('sentiment_agent');
  }

  /**
   * Run the psychometric and sentiment scoring on Google Ads assets.
   * @param {Array<object>} rsaAds - Historical search ads
   * @param {Array<object>} pmaxAssets - Historical Performance Max assets
   * @returns {Promise<string>} Detailed Markdown table and profile mapping
   */
  async scoreAssets(rsaAds, pmaxAssets) {
    // Collect all unique texts to avoid double scoring
    const uniqueTexts = new Set();
    const assetsList = [];

    rsaAds.forEach(ad => {
      ad.headlines.forEach(h => {
        if (!uniqueTexts.has(h)) {
          uniqueTexts.add(h);
          assetsList.push({ text: h, type: 'HEADLINE (RSA)' });
        }
      });
      ad.descriptions.forEach(d => {
        if (!uniqueTexts.has(d)) {
          uniqueTexts.add(d);
          assetsList.push({ text: d, type: 'DESCRIPTION (RSA)' });
        }
      });
    });

    pmaxAssets.forEach(asset => {
      if (asset.text && !uniqueTexts.has(asset.text)) {
        uniqueTexts.add(asset.text);
        assetsList.push({ text: asset.text, type: `${asset.fieldType} (PMax)` });
      }
    });

    const assetsSummary = assetsList.map((a, i) => `${i + 1}. Text: "${a.text}" | Type: ${a.type}`).join('\n');

    const userPrompt = `
Here is a list of ad text assets from our active Google Ads campaigns:
=========================================
${assetsSummary}
=========================================

For EACH unique asset in this list, evaluate it against the Big Five personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) and Sentiment. 

Format your response as a valid JSON array of objects representing each evaluated asset.
Each object must contain the following fields:
{
  "text": "The exact asset text evaluated",
  "type": "The type of the asset (e.g. HEADLINE (RSA))",
  "big_five": {
    "openness": { "score": 0.00, "description": "Short justification" },
    "conscientiousness": { "score": 0.00, "description": "Short justification" },
    "extraversion": { "score": 0.00, "description": "Short justification" },
    "agreeableness": { "score": 0.00, "description": "Short justification" },
    "neuroticism": { "score": 0.00, "description": "Short justification" }
  },
  "sentiment": { "score": 0.00, "description": "Positive/Negative tone description" }
}

Clamp all scores strictly between 0.00 and 1.00. Write the JSON object accurately. Do not add conversational text or code block wrappers outside the JSON array.
`;

    return await this.generateCompletion(userPrompt, true); // True triggers JSON Output Mode
  }
}
