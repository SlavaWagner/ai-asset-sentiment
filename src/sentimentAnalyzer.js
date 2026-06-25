import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { saveRunLog } from './storage.js';
import SentimentScoringAgent from './agents/SentimentScoringAgent.js';
import SuperAdGeneratorAgent from './agents/SuperAdGeneratorAgent.js';

// Helper to generate mock ads in case connection is unconfigured
export function generateMockAdData() {
  const rsaAds = [
    {
      id: '11002233',
      campaignId: '998877',
      campaignName: 'Premium Lead Gen - Search',
      headlines: [
        'Premium Lead Generation',
        'Scale from €5k to €50k/mo',
        'Stop Sales Cycle Gaps',
        'Refinance Your Google Ads',
        '185-Day Sales Cycle Solution',
        'High-Ticket B2B Lead Gen'
      ],
      descriptions: [
        'Close the cash flow gap in your sales cycle with front-end SLOs.',
        'Generate immediate upfront revenues to fund monthly Google Ads spends.',
        'Get highly qualified sales appointments on autopilot.'
      ],
      finalUrls: ['https://slavawagner.de/ads-funnel'],
      metrics: { conversions: 28, clicks: 420, impressions: 6800 }
    }
  ];

  const pmaxAssets = [
    {
      id: '201',
      campaignId: '665544',
      campaignName: 'PMax - SLO Academies',
      assetGroupName: 'SLO Front-End',
      fieldType: 'HEADLINE',
      performanceLabel: 'BEST',
      text: 'Self-Funding Google Ads'
    },
    {
      id: '202',
      campaignId: '665544',
      campaignName: 'PMax - SLO Academies',
      assetGroupName: 'SLO Front-End',
      fieldType: 'LONG_HEADLINE',
      performanceLabel: 'BEST',
      text: 'Refinance Your Monthly Google Ads Budgets With Upfront SLO Sales'
    },
    {
      id: '203',
      campaignId: '665544',
      campaignName: 'PMax - SLO Academies',
      assetGroupName: 'SLO Front-End',
      fieldType: 'LONG_HEADLINE',
      performanceLabel: 'GOOD',
      text: 'Build Continuous Cash Flow To Fund High-Ticket Campaigns Effortlessly'
    },
    {
      id: '204',
      campaignId: '665544',
      campaignName: 'PMax - SLO Academies',
      assetGroupName: 'SLO Front-End',
      fieldType: 'DESCRIPTION',
      performanceLabel: 'BEST',
      text: 'Generate €1,000+ front-end consulting offers to self-liquidate Google Ads budgets.'
    }
  ];

  return { rsaAds, pmaxAssets };
}

/**
 * Runs the asset sentiment analysis and SUPER AD generation.
 * @param {object} config - Configuration settings
 * @param {string} accessToken - Access Token (if connected)
 * @param {boolean} isSandbox - Forcing mock data sandbox
 * @returns {Promise<object>} Markdown report and output paths
 */
export async function runSentimentAnalysisWorkflow(config, accessToken, isSandbox = false) {
  let rsaAds = [];
  let pmaxAssets = [];

  if (isSandbox || !accessToken) {
    console.log(chalk.green('\n[SANDBOX] Generating mock campaign ad copies and PMax assets...'));
    const mock = generateMockAdData();
    rsaAds = mock.rsaAds;
    pmaxAssets = mock.pmaxAssets;
  } else {
    const { fetchSearchCampaignAds, fetchPMaxCampaignAssets } = await import('./googleAds.js');
    try {
      console.log(chalk.yellow('Fetching Responsive Search Ads (RSAs)...'));
      rsaAds = await fetchSearchCampaignAds(config, accessToken);
      console.log(chalk.green(`✔ Retrieved ${rsaAds.length} active RSAs.`));
      
      console.log(chalk.yellow('Fetching Performance Max text assets (headlines, long headlines, descriptions)...'));
      pmaxAssets = await fetchPMaxCampaignAssets(config, accessToken);
      console.log(chalk.green(`✔ Retrieved ${pmaxAssets.length} active PMax text assets.`));

      if (rsaAds.length === 0 && pmaxAssets.length === 0) {
        console.log(chalk.yellow('No active ad assets found in your Google Ads account. Falling back to Demo Sandbox...'));
        const mock = generateMockAdData();
        rsaAds = mock.rsaAds;
        pmaxAssets = mock.pmaxAssets;
      }
    } catch (e) {
      console.log(chalk.red(`Google Ads API query failed: ${e.message}`));
      console.log(chalk.yellow('Falling back to Demo Sandbox mode...'));
      const mock = generateMockAdData();
      rsaAds = mock.rsaAds;
      pmaxAssets = mock.pmaxAssets;
    }
  }

  // Determine landing page URL (fallback if none provided)
  const finalUrl = rsaAds[0]?.finalUrls[0] || 'https://slavawagner.de';

  // Instantiate agents
  console.log(chalk.yellow('\nLoading Sentiment & Recombination Agents...'));
  const scoringAgent = new SentimentScoringAgent();
  const adBuilderAgent = new SuperAdGeneratorAgent();
  console.log(chalk.green('✔ Agents loaded.'));

  console.log(chalk.cyan('\nStarting Phase 1: Psychometric & Sentiment Asset Scoring (running via Antigravity)...'));
  const rawScoringResponse = await scoringAgent.scoreAssets(rsaAds, pmaxAssets);

  // Safely parse JSON array
  let scoredAssets = [];
  try {
    // Sanitize markdown backticks if returned by model
    const cleanJsonStr = rawScoringResponse
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/, '')
      .trim();
    scoredAssets = JSON.parse(cleanJsonStr);
    console.log(chalk.green(`✔ Successfully parsed ${scoredAssets.length} asset score profiles.`));
  } catch (err) {
    console.log(chalk.red(`Failed to parse JSON response. Falling back to local scoring simulation: ${err.message}`));
    // Local fallback simulation if model return invalid JSON format
    scoredAssets = [
      {
        text: rsaAds[0]?.headlines[0] || 'Premium Lead Generation',
        type: 'HEADLINE (RSA)',
        big_five: {
          openness: { score: 0.70, description: "Highly creative B2B hook" },
          conscientiousness: { score: 0.85, description: "Professional B2B claim" },
          extraversion: { score: 0.60, description: "Active statement" },
          agreeableness: { score: 0.75, description: "Trustworthy" },
          neuroticism: { score: 0.20, description: "Low anxiety" }
        },
        sentiment: { score: 0.80, description: "Positive business opportunity" }
      }
    ];
  }

  console.log(chalk.cyan('\nStarting Phase 2: Audience Fit Forecast & SUPER ADS Generation...'));
  const finalAnalysisReport = await adBuilderAgent.generateSuperAds(finalUrl, scoredAssets);

  // Compile final markdown report and save to storage/runs/
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const timestamp = Date.now();
  const reportPath = path.resolve(__dirname, `../storage/runs/sentiment-report-${timestamp}.md`);

  const fullReport = `
# Google Ads Psychometric & Sentiment Recombination Report
*Generated: ${new Date().toLocaleString()}*
*Final URL Target: ${finalUrl}*

## 1. Analyzed Assets Summary
- Responsive Search Ads (RSAs): ${rsaAds.length}
- Performance Max text assets: ${pmaxAssets.length}

## 2. Asset Scores Map (Big Five & Sentiment)
| Asset Text | Type | Openness | Conscientiousness | Extraversion | Agreeableness | Neuroticism | Sentiment |
|---|---|---|---|---|---|---|---|
${scoredAssets.map(a => `| "${a.text}" | ${a.type} | ${a.big_five.openness.score.toFixed(2)} | ${a.big_five.conscientiousness.score.toFixed(2)} | ${a.big_five.extraversion.score.toFixed(2)} | ${a.big_five.agreeableness.score.toFixed(2)} | ${a.big_five.neuroticism.score.toFixed(2)} | ${a.sentiment.score.toFixed(2)} |`).join('\n')}

## 3. Audience Fit Forecast & SUPER ADS Generation
${finalAnalysisReport}
`;

  fs.writeFileSync(reportPath, fullReport.trim(), 'utf8');

  const logPath = saveRunLog({
    timestamp: new Date().toISOString(),
    isSandbox,
    reportPath,
    rsaCount: rsaAds.length,
    pmaxCount: pmaxAssets.length,
    scoredAssets,
    finalAnalysisReport
  });

  return {
    reportPath,
    logPath,
    reportContent: finalAnalysisReport,
    scoredAssets
  };
}
