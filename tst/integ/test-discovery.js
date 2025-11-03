#!/usr/bin/env node
const dgram = require('dgram');
const os = require('os');

console.log('=== RTCOA WiFi Thermostat Discovery Test ===');

// Show network interfaces
console.log('Network interfaces:');
const interfaces = os.networkInterfaces();
for (const [name, nets] of Object.entries(interfaces)) {
  if (nets) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  ${name}: ${net.address} (${net.netmask})`);
      }
    }
  }
}

const SSDP_ADDRESS = '239.255.255.250';
const SSDP_PORT = 1900;
const DISCOVERY_MESSAGE = 'TYPE: WM-DISCOVER\r\nVERSION: 1.0\r\n\r\nservices: com.rtcoa.tstat*\r\n\r\n';

console.log('\n=== Starting Discovery ===');
console.log(`Target: ${SSDP_ADDRESS}:${SSDP_PORT}`);
console.log('Message:');
console.log(DISCOVERY_MESSAGE);

const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

client.bind(0, () => {
  const address = client.address();
  console.log(`\nBound to ${address.address}:${address.port}`);
  
  try {
    client.setBroadcast(true);
    client.setMulticastTTL(3);
    
    try {
      client.addMembership(SSDP_ADDRESS);
      console.log(`Joined multicast group ${SSDP_ADDRESS}`);
    } catch (error) {
      console.warn('Could not join multicast group:', error.message);
    }
    
    const message = Buffer.from(DISCOVERY_MESSAGE);
    client.send(message, SSDP_PORT, SSDP_ADDRESS, (error) => {
      if (error) {
        console.error('Send error:', error);
        client.close();
        process.exit(1);
      }
      console.log('Discovery message sent successfully!');
      console.log('Waiting 10 seconds for responses...\n');
    });
    
  } catch (error) {
    console.error('Setup error:', error);
    client.close();
    process.exit(1);
  }
});

client.on('message', (msg, rinfo) => {
  console.log(`\n📥 Response from ${rinfo.address}:${rinfo.port}`);
  console.log('---START---');
  console.log(msg.toString());
  console.log('---END---');
  
  const response = msg.toString();
  const lines = response.split('\r\n');
  for (const line of lines) {
    if (line.toUpperCase().startsWith('LOCATION:')) {
      const location = line.substring(9).trim();
      if (location.includes('/tstat')) {
        console.log(`🎯 FOUND THERMOSTAT: ${location}`);
      }
    }
  }
});

client.on('error', (error) => {
  console.error('Socket error:', error);
  client.close();
  process.exit(1);
});

setTimeout(() => {
  console.log('\n=== Discovery timeout reached ===');
  client.close();
  process.exit(0);
}, 10000);
