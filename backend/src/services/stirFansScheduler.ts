import axios from 'axios';
import { getEnabledStirFansThermostats } from './database';

// Store original fan modes to restore after 10 minutes
const originalFanModes: Record<string, number> = {};

/**
 * Turn fan on for a thermostat
 */
async function turnFanOn(ipAddress: string): Promise<void> {
  try {
    // First get current state to save original fmode
    const stateRes = await axios.get(`http://${ipAddress}/tstat`, {
      timeout: 5000,
    });

    const originalFmode = stateRes.data.fmode || 0;
    originalFanModes[ipAddress] = originalFmode;

    // Turn fan ON (fmode=2)
    await axios.post(`http://${ipAddress}/tstat`, { fmode: 2 }, {
      timeout: 5000,
    });

    console.log(`[StirFans] Started fan for ${ipAddress}`);
  } catch (error) {
    console.error(`[StirFans] Error starting fan for ${ipAddress}:`, error);
  }
}

/**
 * Turn fan back to original mode
 */
async function restoreFanMode(ipAddress: string): Promise<void> {
  try {
    const originalFmode = originalFanModes[ipAddress] ?? 0;
    
    await axios.post(`http://${ipAddress}/tstat`, { fmode: originalFmode }, {
      timeout: 5000,
    });

    console.log(`[StirFans] Restored fan for ${ipAddress} to fmode=${originalFmode}`);
    delete originalFanModes[ipAddress];
  } catch (error) {
    console.error(`[StirFans] Error restoring fan for ${ipAddress}:`, error);
  }
}

/**
 * Main stir fans scheduler - runs at the top of each hour
 */
export async function runStirFansSchedule(): Promise<void> {
  console.log('[StirFans] Starting hourly stir fans cycle');
  
  try {
    const enabledThermostats = await getEnabledStirFansThermostats();

    if (enabledThermostats.length === 0) {
      console.log('[StirFans] No thermostats with stir fans enabled');
      return;
    }

    // Turn fans on for all enabled thermostats
    const fanOnPromises = enabledThermostats.map((t: any) => turnFanOn(t.ip_address));
    await Promise.allSettled(fanOnPromises);

    // Wait 10 minutes (600 seconds)
    console.log('[StirFans] Fans running for 10 minutes...');
    await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));

    // Restore original fan modes
    const fanRestorePromises = enabledThermostats.map((t: any) => restoreFanMode(t.ip_address));
    await Promise.allSettled(fanRestorePromises);

    console.log('[StirFans] Stir fans cycle complete');
  } catch (error) {
    console.error('[StirFans] Error in stir fans schedule:', error);
  }
}

/**
 * Schedule stir fans to run at the top of each hour
 */
export async function initStirFansScheduler(): Promise<void> {
  try {
    // Calculate milliseconds until the top of the next hour
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    nextHour.setMilliseconds(0);

    const msUntilNextHour = nextHour.getTime() - now.getTime();

    console.log(`[StirFans] Scheduler initialized. Next run in ${Math.round(msUntilNextHour / 1000)} seconds`);

    // Schedule the first run
    setTimeout(() => {
      runStirFansSchedule();
      
      // Then schedule it to run every hour
      setInterval(() => {
        runStirFansSchedule();
      }, 60 * 60 * 1000); // 1 hour
    }, msUntilNextHour);
  } catch (error) {
    console.error('[StirFans] Error initializing stir fans scheduler:', error);
  }
}
