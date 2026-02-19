/**
 * 🔮 ASTROLOGY SERVICE TEST
 */

import { astrologyServiceV2 } from './astrology.service';

async function runTest() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔮 SORIVA ASTROLOGY ENGINE - TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const result = await astrologyServiceV2.getKundli({
    date: '1989-01-31',
    time: '16:00',
    latitude: 30.9165,
    longitude: 74.6130,
    timezone: 5.5,
  });

  console.log('');
  console.log('RESULT:', JSON.stringify(result, null, 2));
}

runTest().catch(console.error);