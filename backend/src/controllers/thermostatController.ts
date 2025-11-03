import { Request, Response } from 'express';
import { ThermostatDiscoveryService } from '../services/thermostatDiscovery';
import {
  getKnownThermostats,
  saveKnownThermostat,
  deleteKnownThermostat,
  getThermostatHistory,
} from '../services/database';

export class ThermostatController {
  private discoveryService: ThermostatDiscoveryService;

  constructor() {
    this.discoveryService = new ThermostatDiscoveryService();
  }

  public async getThermostats(req: Request, res: Response): Promise<void> {
    try {
      const thermostats = this.discoveryService.getDiscoveredThermostats();
      res.json({
        success: true,
        data: thermostats,
        count: thermostats.length
      });
    } catch (error) {
      console.error('Error getting thermostats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get thermostats'
      });
    }
  }

  public async refreshThermostats(req: Request, res: Response): Promise<void> {
    try {
      const thermostats = await this.discoveryService.refreshDiscovery();
      res.json({
        success: true,
        data: thermostats,
        count: thermostats.length,
        message: 'Discovery refreshed'
      });
    } catch (error) {
      console.error('Error refreshing thermostats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh thermostat discovery'
      });
    }
  }

  public async getDiscoveryStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = this.discoveryService.getDiscoveryStatus();
      res.json({
        success: true,
        ...status
      });
    } catch (error) {
      console.error('Error getting discovery status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get discovery status'
      });
    }
  }

  public async debugDiscovery(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔧 DEBUG: Manual discovery triggered via API');
      const thermostats = await this.discoveryService.refreshDiscovery();
      res.json({
        success: true,
        message: 'Debug discovery completed - check server logs for details',
        data: thermostats,
        count: thermostats.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in debug discovery:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run debug discovery'
      });
    }
  }

  public async setManualThermostats(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddresses } = req.body;
      
      if (!Array.isArray(ipAddresses)) {
        res.status(400).json({
          success: false,
          error: 'ipAddresses must be an array'
        });
        return;
      }

      // Validate IP addresses
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const invalidIPs = ipAddresses.filter(ip => !ipRegex.test(ip));
      
      if (invalidIPs.length > 0) {
        res.status(400).json({
          success: false,
          error: `Invalid IP addresses: ${invalidIPs.join(', ')}`
        });
        return;
      }

      this.discoveryService.setManualThermostats(ipAddresses);
      
      // Refresh discovery with new IPs
      const thermostats = await this.discoveryService.refreshDiscovery();
      
      res.json({
        success: true,
        data: thermostats,
        count: thermostats.length,
        message: `Manual thermostat IPs set: ${ipAddresses.join(', ')}`
      });
    } catch (error) {
      console.error('Error setting manual thermostats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set manual thermostats'
      });
    }
  }

  public async getKnownThermostats(req: Request, res: Response): Promise<void> {
    try {
      const knownIPs = this.discoveryService.getKnownThermostats();
      const isManual = this.discoveryService.isUsingManualOverride();
      
      res.json({
        success: true,
        knownIPs,
        isManualOverride: isManual,
        count: knownIPs.length
      });
    } catch (error) {
      console.error('Error getting known thermostats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get known thermostats'
      });
    }
  }

  public async getSavedThermostats(req: Request, res: Response): Promise<void> {
    try {
      const thermostats = await getKnownThermostats();
      res.json({
        success: true,
        data: thermostats,
        count: thermostats.length
      });
    } catch (error) {
      console.error('Error getting saved thermostats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get saved thermostats'
      });
    }
  }

  public async saveThermostat(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress, name, model } = req.body;
      
      if (!ipAddress) {
        res.status(400).json({
          success: false,
          error: 'ipAddress is required'
        });
        return;
      }

      await saveKnownThermostat(ipAddress, name, model);
      res.json({
        success: true,
        message: `Thermostat ${ipAddress} saved successfully`
      });
    } catch (error) {
      console.error('Error saving thermostat:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save thermostat'
      });
    }
  }

  public async deleteThermostat(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress } = req.params;
      
      if (!ipAddress) {
        res.status(400).json({
          success: false,
          error: 'ipAddress is required'
        });
        return;
      }

      await deleteKnownThermostat(ipAddress);
      res.json({
        success: true,
        message: `Thermostat ${ipAddress} deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting thermostat:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete thermostat'
      });
    }
  }

  public async getThermostatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress } = req.params;
      const { hours = '72' } = req.query;
      
      if (!ipAddress) {
        res.status(400).json({
          success: false,
          error: 'ipAddress is required'
        });
        return;
      }

      const history = await getThermostatHistory(ipAddress, parseInt(hours as string));
      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      console.error('Error getting thermostat history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get thermostat history'
      });
    }
  }
}
