/**
 * SORIVA SEARCH V2 - Quick Test
 */
import 'dotenv/config';
import { SorivaSearchV2 } from '../modules/chat/services/search/v2';

async function runTests() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 SORIVA SEARCH V2 - TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 1: LOW RISK (Simple Pipeline)
  console.log('📝 Test 1: Low Risk Query');
  console.log('Query: "Firozpur canal incident news"');
  console.log('Expected: Simple Pipeline\n');

  try {
    const r1 = await SorivaSearchV2.search('Firozpur canal incident news');
    console.log('✅ Result:');
    console.log(`   Pipeline: ${r1.pipeline}`);
    console.log(`   Risk: ${r1.risk.level}`);
    console.log(`   Success: ${r1.success}`);
    console.log(`   Answer: ${r1.answer.slice(0, 150)}...`);
    console.log(`   Sources: ${r1.sources.length}`);
    console.log(`   Time: ${r1.timeMs}ms`);
  } catch (err) {
    console.log('❌ Error:', err);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 2: HIGH RISK (Strict Pipeline)
  console.log('📝 Test 2: High Risk Query');
  console.log('Query: "Paracetamol dosage for fever"');
  console.log('Expected: Strict Pipeline + Disclaimer\n');

  try {
    const r2 = await SorivaSearchV2.search('Paracetamol dosage for fever');
    console.log('✅ Result:');
    console.log(`   Pipeline: ${r2.pipeline}`);
    console.log(`   Risk: ${r2.risk.level}`);
    console.log(`   Confidence: ${r2.confidence}`);
    console.log(`   Success: ${r2.success}`);
    console.log(`   Answer: ${r2.answer.slice(0, 150)}...`);
    console.log(`   Sources: ${r2.sources.length}`);
    console.log(`   Disclaimer: ${r2.disclaimer ? 'YES' : 'NO'}`);
    console.log(`   Time: ${r2.timeMs}ms`);
  } catch (err) {
    console.log('❌ Error:', err);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 TEST COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runTests();