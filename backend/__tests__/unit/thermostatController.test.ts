/**
 * Unit tests for ThermostatController
 * Tests API endpoints for thermostat discovery, management, and retrieval
 */

import { ThermostatController } from '../../src/controllers/thermostatController';

// Mock the database service
jest.mock('../../src/services/database', () => ({
  getKnownThermostats: jest.fn(),
  saveKnownThermostat: jest.fn(),
  deleteKnownThermostat: jest.fn(),
  getSavedThermostats: jest.fn(),
  saveThermostatHistory: jest.fn(),
  getThermostatHistory: jest.fn(),
}));

import * as databaseService from '../../src/services/database';

// Mock the ThermostatDiscoveryService
jest.mock('../../src/services/thermostatDiscovery', () => {
  return {
    ThermostatDiscoveryService: jest.fn().mockImplementation(() => ({
      getDiscoveredThermostats: jest.fn(),
      refreshDiscovery: jest.fn(),
      getDiscoveryStatus: jest.fn(),
      setManualThermostats: jest.fn(),
      getKnownThermostats: jest.fn(),
      isUsingManualOverride: jest.fn(),
    })),
  };
});

describe('ThermostatController', () => {
  let controller: ThermostatController;
  let mockReq: any;
  let mockRes: any;
  let mockDiscoveryService: any;

  beforeEach(() => {
    controller = new ThermostatController();
    mockDiscoveryService = (controller as any).discoveryService;

    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getThermostats', () => {
    it('should return discovered thermostats', async () => {
      const mockThermostats = [
        { id: '1', name: 'Living Room', ipAddress: '192.168.1.100', status: 'online' },
        { id: '2', name: 'Bedroom', ipAddress: '192.168.1.101', status: 'online' },
      ];

      mockDiscoveryService.getDiscoveredThermostats.mockReturnValue(mockThermostats);

      await controller.getThermostats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockThermostats,
        count: 2,
      });
    });

    it('should handle errors gracefully', async () => {
      mockDiscoveryService.getDiscoveredThermostats.mockImplementation(() => {
        throw new Error('Discovery service error');
      });

      await controller.getThermostats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get thermostats',
      });
    });
  });

  describe('refreshThermostats', () => {
    it('should refresh discovery and return updated thermostats', async () => {
      const mockThermostats = [
        { id: '1', name: 'Living Room', ipAddress: '192.168.1.100' },
      ];

      mockDiscoveryService.refreshDiscovery.mockResolvedValue(mockThermostats);

      await controller.refreshThermostats(mockReq, mockRes);

      expect(mockDiscoveryService.refreshDiscovery).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockThermostats,
        count: 1,
        message: 'Discovery refreshed',
      });
    });

    it('should handle refresh errors', async () => {
      mockDiscoveryService.refreshDiscovery.mockRejectedValue(new Error('Refresh failed'));

      await controller.refreshThermostats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to refresh thermostat discovery',
      });
    });
  });

  describe('getDiscoveryStatus', () => {
    it('should return discovery status', async () => {
      const mockStatus = {
        isDiscovering: false,
        lastDiscoveryTime: '2025-11-04T15:00:00Z',
        discoveredCount: 2,
      };

      mockDiscoveryService.getDiscoveryStatus.mockReturnValue(mockStatus);

      await controller.getDiscoveryStatus(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        ...mockStatus,
      });
    });

    it('should handle status retrieval errors', async () => {
      mockDiscoveryService.getDiscoveryStatus.mockImplementation(() => {
        throw new Error('Status error');
      });

      await controller.getDiscoveryStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get discovery status',
      });
    });
  });

  describe('debugDiscovery', () => {
    it('should trigger debug discovery', async () => {
      const mockThermostats = [{ id: '1', ipAddress: '192.168.1.100' }];

      mockDiscoveryService.refreshDiscovery.mockResolvedValue(mockThermostats);

      await controller.debugDiscovery(mockReq, mockRes);

      expect(mockDiscoveryService.refreshDiscovery).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Debug discovery completed - check server logs for details',
          data: mockThermostats,
          count: 1,
        })
      );
    });

    it('should handle debug discovery errors', async () => {
      mockDiscoveryService.refreshDiscovery.mockRejectedValue(new Error('Debug failed'));

      await controller.debugDiscovery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to run debug discovery',
      });
    });
  });

  describe('setManualThermostats', () => {
    it('should set manual thermostat IPs and refresh', async () => {
      const ipAddresses = ['192.168.1.100', '192.168.1.101'];
      mockReq.body = { ipAddresses };

      const mockThermostats = [
        { id: '1', ipAddress: '192.168.1.100' },
        { id: '2', ipAddress: '192.168.1.101' },
      ];

      mockDiscoveryService.refreshDiscovery.mockResolvedValue(mockThermostats);

      await controller.setManualThermostats(mockReq, mockRes);

      expect(mockDiscoveryService.setManualThermostats).toHaveBeenCalledWith(ipAddresses);
      expect(mockDiscoveryService.refreshDiscovery).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockThermostats,
          count: 2,
        })
      );
    });

    it('should reject non-array ipAddresses', async () => {
      mockReq.body = { ipAddresses: '192.168.1.100' };

      await controller.setManualThermostats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddresses must be an array',
      });
    });

    it('should reject invalid IP addresses', async () => {
      mockReq.body = { ipAddresses: ['192.168.1.100', 'invalid-ip', '256.256.256.256'] };

      await controller.setManualThermostats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid IP addresses'),
        })
      );
    });

    it('should handle service errors', async () => {
      mockReq.body = { ipAddresses: ['192.168.1.100'] };
      mockDiscoveryService.refreshDiscovery.mockRejectedValue(new Error('Service error'));

      await controller.setManualThermostats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to set manual thermostats',
      });
    });
  });

  describe('getKnownThermostats', () => {
    it('should return known thermostats and manual override status', async () => {
      const mockKnownIPs = ['192.168.1.100', '192.168.1.101'];
      mockDiscoveryService.getKnownThermostats.mockReturnValue(mockKnownIPs);
      mockDiscoveryService.isUsingManualOverride.mockReturnValue(false);

      await controller.getKnownThermostats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        knownIPs: mockKnownIPs,
        isManualOverride: false,
        count: 2,
      });
    });

    it('should indicate manual override when active', async () => {
      mockDiscoveryService.getKnownThermostats.mockReturnValue(['192.168.1.100']);
      mockDiscoveryService.isUsingManualOverride.mockReturnValue(true);

      await controller.getKnownThermostats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isManualOverride: true,
        })
      );
    });

    it('should handle errors', async () => {
      mockDiscoveryService.getKnownThermostats.mockImplementation(() => {
        throw new Error('Service error');
      });

      await controller.getKnownThermostats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getSavedThermostats', () => {
    it('should return saved thermostats from database', async () => {
      const mockThermostats = [
        { id: 1, ip_address: '192.168.1.100', name: 'Living Room', model: 'CT50' },
        { id: 2, ip_address: '192.168.1.101', name: 'Bedroom', model: 'CT50' },
      ];

      (databaseService.getKnownThermostats as jest.Mock).mockResolvedValue(mockThermostats);

      await controller.getSavedThermostats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockThermostats,
        count: 2,
      });
    });

    it('should handle database errors', async () => {
      (databaseService.getKnownThermostats as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.getSavedThermostats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get saved thermostats',
      });
    });
  });

  describe('saveThermostat', () => {
    it('should save thermostat with all parameters', async () => {
      mockReq.body = {
        ipAddress: '192.168.1.100',
        name: 'Living Room',
        model: 'CT50',
      };

      (databaseService.saveKnownThermostat as jest.Mock).mockResolvedValue(undefined);

      await controller.saveThermostat(mockReq, mockRes);

      expect(databaseService.saveKnownThermostat).toHaveBeenCalledWith(
        '192.168.1.100',
        'Living Room',
        'CT50'
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Thermostat 192.168.1.100 saved successfully',
      });
    });

    it('should save thermostat with minimal parameters', async () => {
      mockReq.body = { ipAddress: '192.168.1.100' };

      (databaseService.saveKnownThermostat as jest.Mock).mockResolvedValue(undefined);

      await controller.saveThermostat(mockReq, mockRes);

      expect(databaseService.saveKnownThermostat).toHaveBeenCalledWith(
        '192.168.1.100',
        undefined,
        undefined
      );
    });

    it('should reject missing ipAddress', async () => {
      mockReq.body = { name: 'Living Room' };

      await controller.saveThermostat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddress is required',
      });
    });

    it('should handle save errors', async () => {
      mockReq.body = { ipAddress: '192.168.1.100' };
      (databaseService.saveKnownThermostat as jest.Mock).mockRejectedValue(
        new Error('Save failed')
      );

      await controller.saveThermostat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to save thermostat',
      });
    });
  });

  describe('deleteThermostat', () => {
    it('should delete thermostat by IP address', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };

      (databaseService.deleteKnownThermostat as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteThermostat(mockReq, mockRes);

      expect(databaseService.deleteKnownThermostat).toHaveBeenCalledWith('192.168.1.100');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Thermostat 192.168.1.100 deleted successfully',
      });
    });

    it('should reject missing ipAddress', async () => {
      mockReq.params = {};

      await controller.deleteThermostat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddress is required',
      });
    });

    it('should handle delete errors', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      (databaseService.deleteKnownThermostat as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      await controller.deleteThermostat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to delete thermostat',
      });
    });
  });

  describe('getThermostatHistory', () => {
    it('should retrieve thermostat history with default hours', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.query = {};

      const mockHistory = [
        { timestamp: '2025-11-04T10:00:00Z', temperature: 72, setpoint: 70 },
        { timestamp: '2025-11-04T11:00:00Z', temperature: 71, setpoint: 70 },
      ];

      (databaseService.getThermostatHistory as jest.Mock).mockResolvedValue(mockHistory);

      await controller.getThermostatHistory(mockReq, mockRes);

      expect(databaseService.getThermostatHistory).toHaveBeenCalledWith('192.168.1.100', 72);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory,
        count: 2,
      });
    });

    it('should retrieve thermostat history with custom hours', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.query = { hours: '24' };

      const mockHistory = [{ timestamp: '2025-11-04T10:00:00Z', temperature: 72 }];

      (databaseService.getThermostatHistory as jest.Mock).mockResolvedValue(mockHistory);

      await controller.getThermostatHistory(mockReq, mockRes);

      expect(databaseService.getThermostatHistory).toHaveBeenCalledWith('192.168.1.100', 24);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory,
        count: 1,
      });
    });

    it('should reject missing ipAddress', async () => {
      mockReq.params = {};
      mockReq.query = {};

      await controller.getThermostatHistory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddress is required',
      });
    });

    it('should handle history retrieval errors', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.query = {};

      (databaseService.getThermostatHistory as jest.Mock).mockRejectedValue(
        new Error('History fetch failed')
      );

      await controller.getThermostatHistory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get thermostat history',
      });
    });
  });
});
