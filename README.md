# ai-asset-sentiment: Google Ads Asset Sentiment & Big Five Psychometrics CLI

`ai-asset-sentiment` is a persistent AI agent CLI tool designed to perform deep psychological profiling and sentiment analysis on Google Ads copy. It queries active Search Responsive Search Ads (RSAs) and Performance Max (PMax) campaign text assets (headlines, long headlines, descriptions), scores them against the Big Five personality traits, forecasts target audience fits for the landing page URL, and fusions them into optimized "SUPER ADS".

All model execution runs locally inside your CLI using the **Antigravity Agent Bridge**, removing any dependency on an external Gemini API key.

---

## Key Features & Agent Architecture

This CLI integrates two persistent AI Agents working in concert:

1. **Google Ads Asset Sentiment & Big Five Psychometrics Analyst (`sentiment_agent`)**:
   - Classifies each headline, long headline, and description against the Big Five personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) and Sentiment (from 0.00 / negative to 1.00 / positive).
   - Generates a psychometric mapping table.

2. **Psychological Audience Profiler & SUPER AD Builder (`super_ad_agent`)**:
   - Forecasts the ideal emotional traits configuration that matches visitors on the target URL.
   - Recombines and writes optimized SUPER ADS matching this target profile:
     - 15 headlines (max 30 characters each).
     - 4 long headlines (max 90 characters each).
     - 4 descriptions (max 90 characters each).
   - Adheres strictly to Google Ads character limits.

---

## Installation & Setup

### 1. Prerequisites
- **Node.js**: Ensure Node.js (v18+) is installed.
- **Google Ads API Credentials**: Setup a Google Cloud project with the Google Ads API enabled and configure OAuth2 credentials. Set your redirect URI to: `http://localhost:8085`.

### 2. Clone & Install Dependencies
Install all package dependencies from the npm registry:
```bash
cd ai-asset-sentiment
npm install
```
*Note: This project does not embed copy-pasted third-party client libraries. It fetches verified packages dynamically from npm to ensure full licensing compliance.*

### 3. Setup Credentials
Run the credentials setup tool:
```bash
node bin/index.js setup
```
Enter your Client ID, Client Secret, Customer ID, and Developer Token. The setup tool will open a web browser to complete Google Ads OAuth2 consent.

---

## Command Reference

You can invoke commands directly or start the interactive CLI dashboard:

* **Interactive Terminal Dashboard**:
  ```bash
  node bin/index.js dashboard
  ```
  *(Launches the beautiful interactive start screen in your terminal. You can navigate, run the sentiment analysis, or inspect agent settings using your arrow keys).*

* **Run Asset Sentiment Analysis**:
  ```bash
  node bin/index.js run-workflow
  ```
  - Connects to Google Ads API (v24) to retrieve active Search ad texts and Performance Max text assets (headlines, long headlines, and descriptions).
  - Evaluates traits, performs audience fit modeling, and generates the final SUPER ADS report, saving files in `storage/runs/`.

* **List AI Agents**:
  ```bash
  node bin/index.js agent list
  ```

* **Verify Installation**:
  ```bash
  npm test
  ```
  Runs automated storage verification and mock ad structures validation tests.

---

This AI Agent was created with the help of Google Antigravity CLI
