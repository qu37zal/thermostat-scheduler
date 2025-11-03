#!/usr/bin/env node
const axios = require('axios');

console.log('=== RTCOA WiFi Thermostat IP Range Scanner ===');

async function scanIP(ip) {
  try {
    const url = `http://${ip}/tstat`;
    const response = await axios.get(url, {
      timeout: 2000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data && typeof response.data.temp === 'number') {
      console.log(`🎯 FOUND THERMOSTAT at ${ip}:`);
      console.log(`   Current temp: ${response.data.temp}°F`);
      console.log(`   Mode: ${response.data.tmode}`);
      console.log(`   State: ${response.data.tstate}`);
      
      // Try to get model info
      try {
        const modelResponse = await axios.get(`http://${ip}/tstat/model`, { timeout: 2000 });
        console.log(`   Model: ${modelResponse.data.model}`);
      } catch {
        console.log(`   Model: Could not retrieve`);
      }
      
      return true;
    }
  } catch (error) {
    // Silent fail for scanning
  }
  return false;
}

async function scanRange(baseIP, start, end) {
  console.log(`\nScanning ${baseIP}${start}-${end}...`);
  const promises = [];
  
  for (let i = start; i <= end; i++) {
    const ip = `${baseIP}${i}`;
    promises.push(scanIP(ip));
    
    // Limit concurrent requests
    if (promises.length >= 10) {
      await Promise.allSettled(promises);
      promises.length = 0;
    }
  }
  
  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
}

async function main() {
  const ranges = [
    { base: '192.168.1.', start: 50, end: 200 },
    { base: '192.168.0.', start: 50, end: 200 },
    { base: '192.168.2.', start: 50, end: 200 }, // Added this since host is on 192.168.2.x
    { base: '10.0.0.', start: 50, end: 200 }
  ];
  
  for (const range of ranges) {
    await scanRange(range.base, range.start, range.end);
  }
  
  console.log('\n=== Scan complete ===');
}

main().catch(console.error);
