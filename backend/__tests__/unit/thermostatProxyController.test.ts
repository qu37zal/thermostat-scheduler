/**
 * Unit tests for ThermostatProxyController
 * Tests HTTP proxy endpoints that communicate with actual thermostats
 */

import { ThermostatProxyController } from '../../src/controllers/thermostatProxyController';
import axios from 'axios';

jest.mock('axios');

describe('ThermostatProxyController', () => {
  let controller: ThermostatProxyController;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    controller = new ThermostatProxyController();
    mockReq = {
      params: {},
      body: {},
      query: {},
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getThermostatData', () => {
    it('should fetch thermostat data successfully', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      const mockData = {
        temp: 72,
        t_heat: 68,
        t_cool: 76,
        tmode: 1,
        fmode: 0,
        hold: 0,
        tstate: 0,
        fstate: 0,
      };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

      await controller.getThermostatData(mockReq, mockRes);

      expect(axios.get).toHaveBeenCalledWith('http://192.168.1.100/tstat', {
        timeout: 15000,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it('should return 400 if ipAddress is missing', async () => {
      mockReq.params = {};

      await controller.getThermostatData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddress is required',
      });
    });

    it('should return 500 on connection error', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      (axios.get as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      await controller.getThermostatData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalled();
      const call = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(call.success).toBe(false);
    });
  });

  describe('getThermostatProgram', () => {
    it('should fetch program successfully', async () => {
      mockReq.params = { ipAddress: '192.168.1.100', mode: 'heat', day: '0' };
      const mockProgram = { 0: [480, 68, 1440, 70] };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockProgram });

      await controller.getThermostatProgram(mockReq, mockRes);

      expect(axios.get).toHaveBeenCalledWith(
        'http://192.168.1.100/tstat/program/heat/0',
        { timeout: 15000 }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProgram,
      });
    });

    it('should return 400 if required params missing', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };

      await controller.getThermostatProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddress, mode, and day are required',
      });
    });

    it('should return 400 if mode is invalid', async () => {
      mockReq.params = { ipAddress: '192.168.1.100', mode: 'invalid', day: '0' };

      await controller.getThermostatProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'mode must be either heat or cool',
      });
    });

    it('should return 400 if day is invalid', async () => {
      mockReq.params = { ipAddress: '192.168.1.100', mode: 'heat', day: '7' };

      await controller.getThermostatProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'day must be between 0 and 6',
      });
    });

    it('should return 500 on fetch error', async () => {
      mockReq.params = { ipAddress: '192.168.1.100', mode: 'heat', day: '0' };
      (axios.get as jest.Mock).mockRejectedValue(new Error('Timeout'));

      await controller.getThermostatProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('setThermostatProgram', () => {
    it('should set program successfully', async () => {
      mockReq.params = { ipAddress: '192.168.1.100', mode: 'heat', day: '0' };
      mockReq.body = { schedule: [480, 68, 1440, 70] };
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      await controller.setThermostatProgram(mockReq, mockRes);

      expect(axios.post).toHaveBeenCalledWith(
        'http://192.168.1.100/tstat/program/heat/mon',
        { 0: [480, 68, 1440, 70] },
        { timeout: 15000 }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Program updated successfully',
        data: {},
      });
    });

    it('should return 400 if schedule is missing', async () => {
      mockReq.params = { ipAddress: '192.168.1.100', mode: 'heat', day: '0' };
      mockReq.body = {};

      await controller.setThermostatProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if day is invalid', async () => {
      mockReq.params = { ipAddress: '192.168.1.100', mode: 'heat', day: '7' };
      mockReq.body = { schedule: [480, 68] };

      await controller.setThermostatProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'day must be between 0 and 6',
      });
    });

    it('should return 500 on post error', async () => {
      mockReq.params = { ipAddress: '192.168.1.100', mode: 'heat', day: '0' };
      mockReq.body = { schedule: [480, 68, 1440, 70] };
      (axios.post as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await controller.setThermostatProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('setThermostatSettings', () => {
    it('should set settings with tmode successfully', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { tmode: 1 };
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      await controller.setThermostatSettings(mockReq, mockRes);

      expect(axios.post).toHaveBeenCalledWith(
        'http://192.168.1.100/tstat',
        { tmode: 1 },
        { timeout: 15000 }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Settings updated successfully',
        data: {},
      });
    });

    it('should set settings with multiple fields', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { tmode: 1, t_heat: 68, t_cool: 76 };
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      await controller.setThermostatSettings(mockReq, mockRes);

      expect(axios.post).toHaveBeenCalledWith(
        'http://192.168.1.100/tstat',
        { tmode: 1, t_heat: 68, t_cool: 76 },
        { timeout: 15000 }
      );
    });

    it('should return 400 if ipAddress missing', async () => {
      mockReq.params = {};
      mockReq.body = { tmode: 1 };

      await controller.setThermostatSettings(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ipAddress is required',
      });
    });

    it('should return 400 if no settings provided', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = {};

      await controller.setThermostatSettings(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
      const call = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(call.error).toContain('At least one setting');
    });

    it('should return 500 on post error', async () => {
      mockReq.params = { ipAddress: '192.168.1.100' };
      mockReq.body = { tmode: 1 };
      (axios.post as jest.Mock).mockRejectedValue(new Error('Device unreachable'));

      await controller.setThermostatSettings(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
