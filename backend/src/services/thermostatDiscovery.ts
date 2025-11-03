import dgram from 'dgram';
import axios from 'axios';
import * as os from 'os';
import { historyCollectionService } from './historyCollection';

export interface Thermostat {
  id: string;
  name: string;
  currentTemp: number;
  targetTemp: number;
  status: 'heating' | 'cooling' | 'idle';
  ipAddress: string;
  model?: string;
  apiUrl: string;
}

interface ThermostatApiResponse {
  temp: number;
  tmode: number;
  fmode: number;
  tstate: number;
  t_heat?: number;
  t_cool?: number;
}

export class ThermostatDiscoveryService {
  private discoveredThermostats: Thermostat[] = [];
  private readonly SSDP_ADDRESS = '239.255.255.250';
  private readonly SSDP_PORT = 1900;
  private readonly DISCOVERY_MESSAGE = 'TYPE: WM-DISCOVER\r\nVERSION: 1.0\r\n\r\nservices: com.rtcoa.tstat*\r\n\r\n';
  private readonly DISCOVERY_TIMEOUT = 8000; // 8 seconds for better results
  
  // Known thermostat IP addresses - can be overridden via environment or API
  private knownThermostats: string[];
  private useManualOverride: boolean = false;

  constructor() {
    console.log('=== ThermostatDiscoveryService initialized ===');
    
    // Check for manual override via environment variable
    const manualIPs = process.env.THERMOSTAT_IPS;
    if (manualIPs) {
      this.knownThermostats = manualIPs.split(',').map(ip => ip.trim());
      this.useManualOverride = true;
      console.log('🎯 Using manual thermostat override from environment:', this.knownThermostats);
    } else {
      // Default known thermostats
      this.knownThermostats = ['192.168.2.77', '192.168.2.96'];
      console.log('🎯 Using default known thermostats:', this.knownThermostats);
    }
    
    this.logNetworkInfo();
    // Start initial discovery
    this.startDiscovery();
  }

  private logNetworkInfo(): void {
    console.log('=== Network Interface Information ===');
    const interfaces = os.networkInterfaces();
    
    for (const [name, nets] of Object.entries(interfaces)) {
      if (nets) {
        for (const net of nets) {
          if (net.family === 'IPv4' && !net.internal) {
            console.log(`Interface ${name}: ${net.address} (${net.netmask})`);
          }
        }
      }
    }
    console.log('======================================');
  }

  private async startDiscovery(): Promise<void> {
    console.log('🔍 Starting thermostat discovery...');
    this.discoveredThermostats = [];
    
    try {
      // First, try the known thermostat IP addresses
      console.log('🎯 Checking known thermostat IP addresses:', this.knownThermostats);
      const knownUrls = await this.checkKnownThermostats();
      console.log(`🎯 Found ${knownUrls.length} thermostats at known addresses`);
      
      // Add any found URLs to our discovery list
      const discoveredUrls = [...knownUrls];
      
      // If we didn't find all known thermostats or manual override is disabled, try multicast discovery
      if (knownUrls.length < this.knownThermostats.length || !this.useManualOverride) {
        console.log('📡 Attempting multicast discovery for remaining devices...');
        const multicastUrls = await this.performNetworkDiscovery();
        console.log(`📡 Multicast discovery found ${multicastUrls.length} additional potential thermostat(s)`);
        discoveredUrls.push(...multicastUrls);
      }
      
      // If still missing devices, try IP range scan
      if (discoveredUrls.length === 0) {
        console.log('🔄 No devices found, trying comprehensive IP range scan...');
        const scanUrls = await this.performIpRangeScan();
        discoveredUrls.push(...scanUrls);
        console.log(`🔍 IP range scan found ${scanUrls.length} additional potential thermostat(s)`);
      }
      
      // Deduplicate URLs before querying to avoid duplicate API calls
      const uniqueUrls = [...new Set(discoveredUrls)];
      if (uniqueUrls.length !== discoveredUrls.length) {
        console.log(`🔧 Removed ${discoveredUrls.length - uniqueUrls.length} duplicate URLs`);
      }
      
      // Query each discovered device for detailed information
      console.log(`🔗 Querying ${uniqueUrls.length} unique discovered URLs...`);
      for (const url of uniqueUrls) {
        try {
          const thermostat = await this.queryThermostatDetails(url);
          if (thermostat) {
            // Check if we already have a thermostat with this IP address
            const existingIndex = this.discoveredThermostats.findIndex(t => t.ipAddress === thermostat.ipAddress);
            if (existingIndex >= 0) {
              // Update existing thermostat with potentially newer/better data
              console.log(`🔄 Updating existing thermostat at ${thermostat.ipAddress}`);
              this.discoveredThermostats[existingIndex] = thermostat;
            } else {
              // Add new thermostat
              this.discoveredThermostats.push(thermostat);
              console.log(`✅ Successfully queried thermostat at ${thermostat.ipAddress} (${thermostat.model})`);
            }
          }
        } catch (error) {
          console.warn(`❌ Failed to query thermostat at ${url}:`, error instanceof Error ? error.message : String(error));
        }
      }
      
      console.log(`🎉 Discovery complete: ${this.discoveredThermostats.length} unique thermostats available`);
      
      // Start history collection if we found thermostats
      if (this.discoveredThermostats.length > 0) {
        historyCollectionService.start(
          this.discoveredThermostats.map(t => ({
            ipAddress: t.ipAddress,
            name: t.name,
          }))
        );
      }
    } catch (error) {
      console.error('💥 Discovery failed:', error instanceof Error ? error.message : String(error));
    }
  }

  private performNetworkDiscovery(): Promise<string[]> {
    return new Promise((resolve) => {
      const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      const discoveredUrls: string[] = [];

      console.log('🔌 Creating UDP socket for multicast discovery...');

      // Set up multicast discovery
      client.bind(0, () => {
        const address = client.address();
        console.log(`🔌 UDP socket bound to ${address.address}:${address.port}`);
        
        try {
          console.log('⚙️  Setting socket options...');
          client.setBroadcast(true);
          client.setMulticastTTL(3);
          
          // Join multicast group
          try {
            console.log(`📻 Attempting to join multicast group ${this.SSDP_ADDRESS}...`);
            client.addMembership(this.SSDP_ADDRESS);
            console.log(`✅ Successfully joined multicast group ${this.SSDP_ADDRESS}`);
          } catch (error) {
            console.warn('⚠️  Could not join multicast group:', error instanceof Error ? error.message : String(error));
            console.log('🔄 Continuing without multicast membership - may still work for sending');
          }
          
          // Log the discovery message we're sending
          console.log('📤 Discovery message to send:');
          console.log('---START MESSAGE---');
          console.log(this.DISCOVERY_MESSAGE);
          console.log('---END MESSAGE---');
          
          // Send discovery request
          const message = Buffer.from(this.DISCOVERY_MESSAGE);
          console.log(`📤 Sending ${message.length} bytes to ${this.SSDP_ADDRESS}:${this.SSDP_PORT}`);
          
          client.send(message, this.SSDP_PORT, this.SSDP_ADDRESS, (error) => {
            if (error) {
              console.error('💥 Error sending discovery message:', error);
              client.close();
              resolve([]);
              return;
            }
            console.log(`✅ Discovery message sent successfully to ${this.SSDP_ADDRESS}:${this.SSDP_PORT}`);
            console.log(`⏳ Waiting ${this.DISCOVERY_TIMEOUT}ms for responses...`);
          });
        } catch (error) {
          console.error('💥 Error setting up multicast:', error);
          client.close();
          resolve([]);
          return;
        }
      });

      // Listen for responses
      client.on('message', (msg, rinfo) => {
        const response = msg.toString();
        console.log(`📥 Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`);
        console.log('📥 Response content:');
        console.log('---START RESPONSE---');
        console.log(response);
        console.log('---END RESPONSE---');
        
        // Parse WM-NOTIFY response for LOCATION header
        const lines = response.split('\r\n');
        for (const line of lines) {
          if (line.toUpperCase().startsWith('LOCATION:')) {
            const location = line.substring(9).trim();
            if (location.includes('/tstat')) {
              console.log(`🎯 Found thermostat location: ${location}`);
              discoveredUrls.push(location);
            } else {
              console.log(`ℹ️  Found non-thermostat location: ${location}`);
            }
          }
        }
      });

      client.on('error', (error) => {
        console.error('💥 Discovery socket error:', error);
        client.close();
        resolve(discoveredUrls);
      });

      // Set timeout for discovery
      setTimeout(() => {
        console.log(`⏰ Discovery timeout reached (${this.DISCOVERY_TIMEOUT}ms)`);
        console.log(`📊 Found ${discoveredUrls.length} URLs via multicast`);
        client.close();
        resolve(discoveredUrls);
      }, this.DISCOVERY_TIMEOUT);
    });
  }

  private async performIpRangeScan(): Promise<string[]> {
    console.log('🔍 Performing IP range scan for thermostats...');
    const discoveredUrls: string[] = [];
    const promises: Promise<string | null>[] = [];
    
    // Common private IP ranges to scan - including 192.168.2.x since host is on that network
    const commonRanges = [
      { base: '192.168.2.', start: 50, end: 200 }, // Added this first since host is on 192.168.2.x
      { base: '192.168.1.', start: 50, end: 200 },
      { base: '192.168.0.', start: 50, end: 200 },
      { base: '10.0.0.', start: 50, end: 200 },
      { base: '172.16.1.', start: 50, end: 200 }
    ];

    console.log('🎯 Scanning IP ranges:', commonRanges.map(r => `${r.base}${r.start}-${r.end}`).join(', '));

    for (const range of commonRanges) {
      for (let i = range.start; i <= range.end; i++) {
        const ip = `${range.base}${i}`;
        
        // Try multiple potential thermostat endpoints
        const urls = [
          `http://${ip}/tstat`,        // RTCOA format
          `http://${ip}/status`,       // Honeywell T50 format
          `http://${ip}/api/status`,   // Alternative Honeywell format
          `http://${ip}:8080/tstat`,   // Alternative port
          `http://${ip}:8080/status`   // Alternative port + endpoint
        ];
        
        for (const url of urls) {
          promises.push(this.checkThermostatAtUrl(url));
        }
        
        // Limit concurrent requests to avoid overwhelming the network
        if (promises.length >= 50) {
          const results = await Promise.allSettled(promises);
          for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
              discoveredUrls.push(result.value);
            }
          }
          promises.length = 0; // Clear array
        }
      }
    }

    // Process remaining promises
    if (promises.length > 0) {
      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          discoveredUrls.push(result.value);
        }
      }
    }

    console.log(`🔍 IP range scan completed, found ${discoveredUrls.length} potential thermostats`);
    return discoveredUrls;
  }

  private async checkThermostatAtUrl(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        timeout: 1000, // Very short timeout for scanning
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      
      // Check if response looks like a thermostat
      if (response.data) {
        const data = response.data;
        
        // Check for various temperature field names
        const hasTemp = typeof data.temp === 'number' || 
                       typeof data.temperature === 'number' ||
                       typeof data.currentTemp === 'number' ||
                       typeof data.ambient_temp === 'number';
        
        if (hasTemp) {
          console.log(`🎯 Found potential thermostat at ${url}`);
          return url;
        }
      }
    } catch {
      // Ignore errors during scanning
    }
    return null;
  }

  private async queryThermostatDetails(apiUrl: string): Promise<Thermostat | null> {
    try {
      // Extract IP address from URL
      const urlMatch = apiUrl.match(/http:\/\/([^\/]+)\//);
      if (!urlMatch) {
        throw new Error('Invalid API URL format');
      }
      const ipAddress = urlMatch[1];

      console.log(`🔗 Querying thermostat details at ${apiUrl}...`);

      // Query thermostat state
      const response = await axios.get<ThermostatApiResponse>(apiUrl, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;
      console.log(`📊 Received thermostat data:`, data);

      // Query model information
      let model = 'Unknown Model';
      try {
        console.log(`🏷️  Querying model info at ${apiUrl}/model...`);
        const modelResponse = await axios.get(`${apiUrl}/model`, { timeout: 3000 });
        model = modelResponse.data.model || 'RTCOA WiFi Thermostat';
        console.log(`🏷️  Model: ${model}`);
      } catch {
        // Model query failed, use default
        model = 'RTCOA WiFi Thermostat';
        console.log(`⚠️  Could not get model info, using default: ${model}`);
      }

      // Determine current target temperature and status
      let targetTemp = 70; // default
      let status: 'heating' | 'cooling' | 'idle' = 'idle';

      // tmode: 0=OFF, 1=HEAT, 2=COOL, 3=AUTO
      // tstate: 0=OFF, 1=HEAT, 2=COOL
      if (data.tstate === 1) {
        status = 'heating';
        targetTemp = data.t_heat || 70;
      } else if (data.tstate === 2) {
        status = 'cooling';
        targetTemp = data.t_cool || 75;
      } else {
        // Not actively heating or cooling
        if (data.tmode === 1 && data.t_heat) {
          targetTemp = data.t_heat;
        } else if (data.tmode === 2 && data.t_cool) {
          targetTemp = data.t_cool;
        }
      }

      const thermostat: Thermostat = {
        id: `rtcoa-${ipAddress.replace(/\./g, '-')}`,
        name: `Thermostat (${ipAddress})`,
        currentTemp: Math.round(data.temp * 10) / 10, // Round to 1 decimal
        targetTemp: Math.round(targetTemp * 10) / 10,
        status,
        ipAddress,
        model,
        apiUrl
      };

      console.log(`✅ Created thermostat object:`, thermostat);
      return thermostat;

    } catch (error) {
      console.error(`💥 Failed to query thermostat at ${apiUrl}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private async checkKnownThermostats(): Promise<string[]> {
    console.log('🎯 Checking known thermostat IP addresses...');
    const discoveredUrls: string[] = [];
    
    for (const ip of this.knownThermostats) {
      console.log(`🔍 Testing thermostat at ${ip}...`);
      
      // Try multiple common thermostat API endpoints
      const possibleEndpoints = [
        `http://${ip}/tstat`,           // RTCOA format
        `http://${ip}/status`,          // Alternative format
        `http://${ip}/api/status`,      // API prefix format
        `http://${ip}/api/thermostat`,  // Alternative API format
        `http://${ip}:8080/tstat`,      // Alternative port
        `http://${ip}:8080/status`,     // Alternative port + status
        `http://${ip}/`,                // Root endpoint
        `http://${ip}/info`             // Info endpoint
      ];
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`   🔗 Trying ${endpoint}...`);
          const response = await axios.get(endpoint, {
            timeout: 3000,
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*'
            }
          });
          
          console.log(`   📊 Response from ${endpoint}:`, response.status, response.data);
          
          // Check if this looks like thermostat data
          if (response.data) {
            // Look for temperature-related fields
            const data = response.data;
            const hasTemp = typeof data.temp === 'number' || 
                           typeof data.temperature === 'number' ||
                           typeof data.currentTemp === 'number' ||
                           typeof data.ambient_temp === 'number';
            
            const hasMode = data.mode !== undefined || 
                           data.tmode !== undefined ||
                           data.system_mode !== undefined;
            
            if (hasTemp || hasMode || typeof data === 'string' && data.includes('temp')) {
              console.log(`   ✅ Found thermostat-like response at ${endpoint}`);
              discoveredUrls.push(endpoint);
              break; // Found working endpoint for this IP, move to next
            }
          }
        } catch (error) {
          // Log the error but continue trying other endpoints
          const err = error as any;
          console.log(`   ❌ ${endpoint} failed: ${err.code || err.message}`);
        }
      }
    }
    
    console.log(`🎯 Known thermostat check complete: found ${discoveredUrls.length} working endpoints`);
    return discoveredUrls;
  }

  public getDiscoveredThermostats(): Thermostat[] {
    // Deduplicate by IP address as a safety net
    const uniqueThermostats = this.discoveredThermostats.reduce((acc: Thermostat[], current) => {
      const existing = acc.find(t => t.ipAddress === current.ipAddress);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return [...uniqueThermostats]; // Return copy to prevent mutation
  }

  public async refreshDiscovery(): Promise<Thermostat[]> {
    console.log('🔄 Refreshing thermostat discovery...');
    await this.startDiscovery();
    return this.getDiscoveredThermostats();
  }

  public getDiscoveryStatus(): { isDiscovering: boolean; count: number; lastDiscovery?: Date } {
    return {
      isDiscovering: false, // We could add a flag to track active discovery
      count: this.discoveredThermostats.length,
      lastDiscovery: new Date() // Could track actual last discovery time
    };
  }

  public setManualThermostats(ipAddresses: string[]): void {
    console.log('🔧 Setting manual thermostat IP addresses:', ipAddresses);
    this.knownThermostats = ipAddresses;
    this.useManualOverride = true;
  }

  public getKnownThermostats(): string[] {
    return [...this.knownThermostats];
  }

  public isUsingManualOverride(): boolean {
    return this.useManualOverride;
  }
}
