import axios from 'axios';
import { saveThermostatHistory } from './database';

export class HistoryCollectionService {
  private pollInterval: NodeJS.Timeout | null = null;
  private thermostats: Array<{ ipAddress: string; name?: string }> = [];
  private readonly POLL_INTERVAL_MS = 60000; // Poll every minute

  public start(thermostats: Array<{ ipAddress: string; name?: string }>) {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    this.thermostats = thermostats;
    console.log('[HistoryCollection] Starting history collection for', thermostats.length, 'thermostats');

    // Poll immediately, then every minute
    this.pollThermostats();
    this.pollInterval = setInterval(() => this.pollThermostats(), this.POLL_INTERVAL_MS);
  }

  public stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log('[HistoryCollection] Stopped');
    }
  }

  private async pollThermostats() {
    const timestamp = new Date().toISOString();
    console.log(`[HistoryCollection] Polling ${this.thermostats.length} thermostats at ${timestamp}`);

    for (const thermostat of this.thermostats) {
      try {
        const response = await axios.get(`http://${thermostat.ipAddress}/tstat`, {
          timeout: 5000,
        });

        const data = response.data;

        // Extract relevant data
        await saveThermostatHistory(thermostat.ipAddress, {
          temperature: data.temp,
          setpoint: data.tmode === 1 ? data.t_heat : data.tmode === 2 ? data.t_cool : undefined,
          mode: this.getModeString(data.tmode),
          fanMode: this.getFanModeString(data.fmode),
          runtimeMinutes: data.runtime || 0,
        });

        console.log(
          `[HistoryCollection] Saved data for ${thermostat.ipAddress}: ${data.temp}°F, mode=${this.getModeString(data.tmode)}, fan=${this.getFanModeString(data.fmode)}`
        );
      } catch (error) {
        console.warn(
          `[HistoryCollection] Error polling ${thermostat.ipAddress}:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  private getModeString(tmode?: number): string {
    switch (tmode) {
      case 0:
        return 'off';
      case 1:
        return 'heat';
      case 2:
        return 'cool';
      case 3:
        return 'auto';
      default:
        return 'unknown';
    }
  }

  private getFanModeString(fmode?: number): string {
    switch (fmode) {
      case 0:
        return 'off';
      case 1:
        return 'on';
      case 2:
        return 'auto';
      default:
        return 'unknown';
    }
  }
}

export const historyCollectionService = new HistoryCollectionService();
