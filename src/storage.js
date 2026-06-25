import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = path.resolve(__dirname, '../storage');
const AGENTS_DIR = path.resolve(STORAGE_DIR, 'agents');
const RUNS_DIR = path.resolve(STORAGE_DIR, 'runs');

const DEFAULT_AGENTS = {
  sentiment_agent: {
    name: 'sentiment_agent',
    role: 'Google Ads Asset Sentiment & Big Five Psychometrics Analyst',
    description: 'Scores Search and Performance Max ad text assets against Big Five personality traits and sentiment metrics.',
    systemPrompt: `You are the Google Ads Asset Sentiment & Big Five Psychometrics Analyst.
Your task is to analyze historical Search and Performance Max ad text assets and rate each asset according to its psychological profiling and sentiment.

For EACH individual headline and description, you must provide:
1. Big Five Traits Scores (0.00 to 1.00) and short justifications:
   - openness (how creative, intellectual, or unconventional is the copy?)
   - conscientiousness (how detail-oriented, professional, or safety-focused is the copy?)
   - extraversion (how energetic, social, or urgent is the copy?)
   - agreeableness (how friendly, cooperative, or trust-building is the copy?)
   - neuroticism (how sensitive, risk-alerting, or anxiety-driven is the copy?)
2. Sentiment Score (0.00 to 1.00):
   - From 0.00 (highly negative, highlighting problems, fears, and risks) to 1.00 (highly positive, highlighting solutions, benefits, and positive outcomes).

Provide the output as a structured Markdown analysis, including a table mapping the Big Five and Sentiment scores for all assets.`,
    skills: ['LLMGenerateSkill'],
    model: 'gemini-1.5-flash'
  },
  super_ad_agent: {
    name: 'super_ad_agent',
    role: 'Psychological Audience Profiler & SUPER AD Builder',
    description: 'Forecasts target audience emotional preferences for a landing page URL and writes optimized SUPER ADS matching that profile.',
    systemPrompt: `You are the Psychological Audience Profiler & SUPER AD Builder.
Your task is to:
1. Audience Emotional Forecast: Analyze the final landing page URL (and its core offer) to forecast the ideal emotional profile of the target audience. Map this target audience across the Big Five traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) and sentiment preference.
2. SUPER ADS Generation: Based on this target emotional profile, generate a set of optimized SUPER ADS.
   - For each proposal, write:
     - 15 headlines (max. 30 characters each).
     - 4 long headlines (max. 90 characters each).
     - 4 descriptions (max. 90 characters each).
   - You must adhere to Google Ads character limits (spaces count as characters).
   - Ensure the ad copy's tone and psychological angles align with the target audience's Big Five profile.
   - Provide the output in clean Markdown.`,
    skills: ['LLMGenerateSkill'],
    model: 'gemini-1.5-flash'
  }
};

export function initStorage() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(AGENTS_DIR)) {
    fs.mkdirSync(AGENTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(RUNS_DIR)) {
    fs.mkdirSync(RUNS_DIR, { recursive: true });
  }

  for (const [name, config] of Object.entries(DEFAULT_AGENTS)) {
    const filePath = path.join(AGENTS_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
    }
  }
}

export function listAgents() {
  initStorage();
  const files = fs.readdirSync(AGENTS_DIR).filter(file => file.endsWith('.json'));
  return files.map(file => {
    const data = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
    return JSON.parse(data);
  });
}

export function getAgent(name) {
  initStorage();
  const filePath = path.join(AGENTS_DIR, `${name}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null;
}

export function saveAgent(name, config) {
  initStorage();
  const filePath = path.join(AGENTS_DIR, `${name}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving agent ${name}:`, error.message);
    return false;
  }
}

export function saveRunLog(runLog) {
  initStorage();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(RUNS_DIR, `run-${timestamp}.json`);
  fs.writeFileSync(logPath, JSON.stringify(runLog, null, 2), 'utf8');
  return logPath;
}
