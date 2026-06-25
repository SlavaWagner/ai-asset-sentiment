import chalk from 'chalk';
import { getAgent, listAgents, initStorage } from './storage.js';
import { generateMockAdData } from './sentimentAnalyzer.js';

initStorage();

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(chalk.green(`  ✔ PASSED: ${message}`));
    passedTests++;
  } else {
    console.log(chalk.red(`  ✖ FAILED: ${message}`));
    failedTests++;
  }
}

async function runTests() {
  console.log(chalk.bold.cyan('\n=== Run local verification tests ===\n'));

  // Test 1: Stored Agent Configuration Loader
  try {
    console.log(chalk.yellow('Test 1: Agent Loader and Config Storage...'));
    const agents = listAgents();
    assert(agents.length === 2, `Expected 2 default agents, found ${agents.length}`);
    
    const sentimentAgent = getAgent('sentiment_agent');
    assert(sentimentAgent !== null, 'Should be able to load sentiment_agent profile');
    assert(sentimentAgent.name === 'sentiment_agent', `Expected agent name "sentiment_agent", got "${sentimentAgent?.name}"`);

    const superAdAgent = getAgent('super_ad_agent');
    assert(superAdAgent !== null, 'Should be able to load super_ad_agent profile');
    assert(superAdAgent.name === 'super_ad_agent', `Expected agent name "super_ad_agent", got "${superAdAgent?.name}"`);
  } catch (err) {
    console.log(chalk.red(`  ✖ FAILED: Agent Loader error: ${err.message}`));
    failedTests++;
  }

  // Test 2: Mock Ads Generator Schema
  try {
    console.log(chalk.yellow('\nTest 2: Mock Ads Data Generator...'));
    const mock = generateMockAdData();
    assert(mock.rsaAds.length > 0, 'Should generate mock RSA ads');
    assert(mock.pmaxAssets.length > 0, 'Should generate mock PMax assets');
    
    const sampleAd = mock.rsaAds[0];
    assert(sampleAd.headlines.length > 0, 'Mock RSA should contain headlines');
    assert(sampleAd.descriptions.length > 0, 'Mock RSA should contain descriptions');
    assert(sampleAd.finalUrls.length > 0, 'Mock RSA should contain final URLs');
    assert(sampleAd.metrics.conversions >= 0, 'Mock RSA metrics should contain conversions');
    
    const sampleAsset = mock.pmaxAssets[0];
    assert(sampleAsset.text.length > 0, 'Mock PMax asset should contain text');
    assert(sampleAsset.fieldType === 'HEADLINE' || sampleAsset.fieldType === 'LONG_HEADLINE' || sampleAsset.fieldType === 'DESCRIPTION', 'Mock PMax field type should be valid');
    assert(sampleAsset.performanceLabel !== undefined, 'Mock PMax asset should contain performance label');
  } catch (err) {
    console.log(chalk.red(`  ✖ FAILED: Mock generator test error: ${err.message}`));
    failedTests++;
  }

  // Summary
  console.log(chalk.bold.cyan('\n=== Test Summary ==='));
  console.log(chalk.bold.green(`Passed: ${passedTests}`));
  if (failedTests > 0) {
    console.log(chalk.bold.red(`Failed: ${failedTests}`));
    process.exit(1);
  } else {
    console.log(chalk.bold.green('All tests passed successfully!'));
    process.exit(0);
  }
}

runTests();
