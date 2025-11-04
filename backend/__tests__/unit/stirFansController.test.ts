/**
 * Unit tests for StirFansController
 * Tests API endpoints for stir fans settings management
 */

import { StirFansController } from '../../src/controllers/stirFansController';
import * as databaseService from '../../src/services/database';

jest.mock('../../src/services/database');

describe('StirFansController', () => {
  let controller: StirFansController;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    controller = new StirFansController();

    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('getStirFansSetting', () => {
    it('should return stir fans setting for a thermostat', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };

      const mockSetting = {
        ip_address: '192.168.1.100',
        enabled: 1,
        created_at: '2025-11-04T10:00:00Z',
      };

      (databaseService.getStirFansSetting as jest.Mock).mockResolvedValue(mockSetting);

      await controller.getStirFansSetting(mockReq, mockRes);

      expect(databaseService.getStirFansSetting).toHaveBeenCalledWith('192.168.1.100');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockSetting,
      });
    });

    it('should reject missing ipAddress parameter', async () => {
      mockReq.params = {};

      await controller.getStirFansSetting(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddress is required',
      });
    });

    it('should handle database errors', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };

      (databaseService.getStirFansSetting as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.getStirFansSetting(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch stir fans setting',
      });
    });

    it('should handle null/undefined settings', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };

      (databaseService.getStirFansSetting as jest.Mock).mockResolvedValue(null);

      await controller.getStirFansSetting(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });
  });

  describe('setStirFansSetting', () => {
    it('should enable stir fans for a thermostat', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { enabled: true };

      (databaseService.setStirFansEnabled as jest.Mock).mockResolvedValue(undefined);

      await controller.setStirFansSetting(mockReq, mockRes);

      expect(databaseService.setStirFansEnabled).toHaveBeenCalledWith('192.168.1.100', true);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Stir fans enabled for 192.168.1.100',
        data: {
          ip_address: '192.168.1.100',
          enabled: 1,
        },
      });
    });

    it('should disable stir fans for a thermostat', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { enabled: false };

      (databaseService.setStirFansEnabled as jest.Mock).mockResolvedValue(undefined);

      await controller.setStirFansSetting(mockReq, mockRes);

      expect(databaseService.setStirFansEnabled).toHaveBeenCalledWith('192.168.1.100', false);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Stir fans disabled for 192.168.1.100',
        data: {
          ip_address: '192.168.1.100',
          enabled: 0,
        },
      });
    });

    it('should reject missing ipAddress', async () => {
      mockReq.params = {};
      mockReq.body = { enabled: true };

      await controller.setStirFansSetting(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddress is required',
      });
    });

    it('should reject non-boolean enabled value', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { enabled: 'yes' };

      await controller.setStirFansSetting(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'enabled must be a boolean',
      });
    });

    it('should reject missing enabled field', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = {};

      await controller.setStirFansSetting(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'enabled must be a boolean',
      });
    });

    it('should handle database errors', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { enabled: true };

      (databaseService.setStirFansEnabled as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.setStirFansSetting(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to set stir fans setting',
      });
    });

    it('should reject numeric values for enabled', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { enabled: 1 };

      await controller.setStirFansSetting(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject null for enabled', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { enabled: null };

      await controller.setStirFansSetting(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
