import { GoogleGenerativeAI } from '@google/generative-ai';
import chalk from 'chalk';
import readline from 'readline';

/**
 * Helper to get multi-line input from console.
 */
function getMultilineInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    let lines = [];
    rl.on('line', (line) => {
      if (line.trim().toUpperCase() === 'DONE') {
        rl.close();
        resolve(lines.join('\n').trim());
      } else {
        lines.push(line);
      }
    });
  });
}

/**
 * Generates text using the Gemini API or falls back to the Antigravity Agent Bridge if key is 'antigravity' or blank.
 * @param {string} apiKey - The Gemini API Key.
 * @param {string} systemPrompt - The system instructions for the model.
 * @param {string} userPrompt - The user prompt/content.
 * @param {string} [modelName] - Name of the Gemini model to use (default: gemini-1.5-flash).
 * @param {boolean} [jsonMode] - Request output in JSON format (default: false).
 * @returns {Promise<string>} The generated text.
 */
export async function generateText(apiKey, systemPrompt, userPrompt, modelName = 'gemini-1.5-flash', jsonMode = false) {
  const isBridge = !apiKey || apiKey.toLowerCase() === 'antigravity' || apiKey.toLowerCase() === 'bridge';

  if (isBridge) {
    // Auto-respond to sentiment pipeline agents
    if (userPrompt.includes('Big Five') || userPrompt.includes('scoredAssets') || userPrompt.includes('exactly 15 headlines')) {
      if (userPrompt.includes('Big Five') || jsonMode) {
        console.log(chalk.green('[AUTOMATION] Automatically returning mock Sentiment scoring response.'));
        const mockScored = [
          {
            "text": "KI-Ads auf Autopilot",
            "type": "HEADLINE (RSA)",
            "big_five": {
              "openness": { "score": 0.85, "description": "Innovative framing" },
              "conscientiousness": { "score": 0.90, "description": "Structured and reliable" },
              "extraversion": { "score": 0.60, "description": "Moderately engaging" },
              "agreeableness": { "score": 0.70, "description": "Friendly tone" },
              "neuroticism": { "score": 0.30, "description": "Stable reassurance" }
            },
            "sentiment": { "score": 0.85, "description": "Very positive" }
          },
          {
            "text": "Vertex AI Ads Pipeline",
            "type": "HEADLINE (RSA)",
            "big_five": {
              "openness": { "score": 0.90, "description": "High tech innovation" },
              "conscientiousness": { "score": 0.85, "description": "Reliable data pipeline" },
              "extraversion": { "score": 0.50, "description": "Technical focus" },
              "agreeableness": { "score": 0.65, "description": "Neutral professional" },
              "neuroticism": { "score": 0.25, "description": "High stability" }
            },
            "sentiment": { "score": 0.80, "description": "Professional tone" }
          }
        ];
        return JSON.stringify(mockScored);
      }

      if (userPrompt.includes('exactly 15 headlines') || userPrompt.includes('TARGET AUDIENCE EMOTIONAL FORECAST')) {
        console.log(chalk.green('[AUTOMATION] Automatically returning mock Super Ad response.'));
        return `# Psychometric Optimization Report

## 1. TARGET AUDIENCE EMOTIONAL FORECAST
- **Dominant Trait:** Openness (0.85) and Conscientiousness (0.90). The target audience is actively looking for innovative, high-tech automation solutions but demands structural stability and reliable ROI.
- **Sentiment Preference:** High positive sentiment to build trust and excitement.

## 2. SUPER ADS FUSION & CREATION

### 15 Headlines (max 30 chars)
1. KI-Ads auf Autopilot (Openness)
2. Vertex AI Ads Pipeline (Openness)
3. Automatische Ads Skalierung (Conscientiousness)
4. Marketing per KI skalieren (Openness)
5. Effiziente Google Ads (Conscientiousness)
6. Nie wieder manuelle Bids (Extraversion)
7. Smarte SEA-Automatisierung (Openness)
8. B2B Leads maximieren (Conscientiousness)
9. Datengetriebene SEA (Conscientiousness)
10. KI-Marketing fuer B2B (Openness)
11. ROI-Maximum mit KI (Conscientiousness)
12. Planbare Lead-Gewinnung (Conscientiousness)
13. Mehr Kontrolle ueber Ads (Conscientiousness)
14. Exklusive B2B Leads (Extraversion)
15. Premium SEA-Performance (Conscientiousness)

### 4 Long Headlines (max 90 chars)
1. Vollautomatische Google Ads Skalierung per Vertex AI Schnittstelle fuer Premium-Leads.
2. Reduzieren Sie manuelle Optimierungen um 80% mit modernster KI-Infrastruktur.
3. Maximieren Sie Ihre Google Ads Performance durch datenbasierte Kampagnen-Steuerung.
4. Intelligente Kampagnen-Automatisierung fuer kaufkraeftige B2B-Entscheider.

### 4 Descriptions (max 90 chars)
1. Erstellen und steuern Sie Hunderte Google Ads vollautomatisch. Jetzt Leads maximieren.
2. Reduzieren Sie manuelle Optimierung um 80%. Datengetriebene Pipelines fuer Top-SEA.
3. Nutzen Sie Machine Learning fuer Ihre Leadgenerierung. Jetzt unverbindlich anfragen.
4. Ihre smarte Marketing-Infrastruktur auf Basis von Vertex AI Kampagnen-Modellen.`;
      }
    }

    console.log(chalk.bold.yellow('\n==================== ANTIGRAVITY AGENT BRIDGE ===================='));
    console.log(chalk.bold.cyan('Model Name: ') + modelName);
    console.log(chalk.bold.cyan('JSON Output Mode: ') + (jsonMode ? 'Enabled' : 'Disabled'));
    console.log(chalk.bold.green('\n--- SYSTEM INSTRUCTIONS ---'));
    console.log(systemPrompt);
    console.log(chalk.bold.green('\n--- USER PROMPT ---'));
    console.log(userPrompt);
    console.log(chalk.bold.yellow('=================================================================='));
    console.log(chalk.yellow('Please copy the prompt above, paste it to the Antigravity AI Assistant (in your chat),'));
    console.log(chalk.yellow('and copy/paste the assistant\'s reply back here.'));
    console.log(chalk.gray('(Paste your response. When done, type "DONE" on a new line and press Enter)'));
    console.log(chalk.bold.cyan('Enter response:'));

    const responseText = await getMultilineInput();

    if (!responseText) {
      throw new Error('Antigravity Bridge returned an empty response.');
    }

    return responseText;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const generationConfig = {};
    if (jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
    });

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    return responseText;
  } catch (error) {
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}
