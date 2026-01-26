/**
 * SORIVA QUERY ROUTER v2.0 - Test
 */

import { routeQuery } from './index';

async function runTests() {
  const tests = [
    'Holi kab hai?',
    'Aaj kya date hai?',
    '25 * 47',
    'Hi Soriva!',
    'Tum kaun ho?',
    'Delhi ka mausam',
    'SRK ki new movie',
    'Gita chapter 2 shlok 47',
    'karma ke baare mein batao',
  ];
  
  console.log('\n━━━ SORIVA QUERY ROUTER v2.0 TEST ━━━\n');
  
  for (const query of tests) {
    const result = await routeQuery(query, { location: 'Delhi' });
    console.log(`"${query}"`);
    if (result.handledDirectly && result.directResponse) {
      console.log(`  ✅ ${result.classification?.queryType} | ${result.directResponse.source}`);
      console.log(`  → ${result.directResponse.response.substring(0, 80)}...`);
    } else {
      console.log(`  🔄 LLM needed: ${result.classification?.queryType}`);
    }
    console.log('');
  }
}

runTests().catch(console.error);
