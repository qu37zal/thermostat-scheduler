import { Request, Response } from 'express';
import axios from 'axios';

export class ThermostatProxyController {
  public async getThermostatProgram(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress, mode, day } = req.params;

      if (!ipAddress || !mode || day === undefined) {
        res.status(400).json({
          success: false,
          error: 'ipAddress, mode, and day are required',
        });
        return;
      }

      if (!['heat', 'cool'].includes(mode)) {
        res.status(400).json({
          success: false,
          error: 'mode must be either heat or cool',
        });
        return;
      }

      const dayNum = parseInt(day as string);
      if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
        res.status(400).json({
          success: false,
          error: 'day must be between 0 and 6',
        });
        return;
      }

      // Fetch from the actual thermostat
      const thermostatUrl = `http://${ipAddress}/tstat/program/${mode}/${dayNum}`;
      console.log(`[ThermostatProxy] Fetching: ${thermostatUrl}`);

      const response = await axios.get(thermostatUrl, {
        timeout: 15000,  // Increased timeout - thermostats can be slow
      });

      res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error('Error fetching thermostat program:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch thermostat program data',
      });
    }
  }

  public async getThermostatData(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress } = req.params;

      if (!ipAddress) {
        res.status(400).json({
          success: false,
          error: 'ipAddress is required',
        });
        return;
      }

      // Fetch full thermostat state
      const thermostatUrl = `http://${ipAddress}/tstat`;
      console.log(`[ThermostatProxy] Fetching: ${thermostatUrl}`);

      const response = await axios.get(thermostatUrl, {
        timeout: 15000,  // Increased timeout - thermostats can be slow
      });

      res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error('Error fetching thermostat data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch thermostat data',
      });
    }
  }

  public async setThermostatProgram(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress, mode, day } = req.params;
      const { schedule } = req.body;

      if (!ipAddress || !mode || day === undefined || !schedule) {
        res.status(400).json({
          success: false,
          error: 'ipAddress, mode, day, and schedule are required',
        });
        return;
      }

      const dayNum = parseInt(day as string);
      if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
        res.status(400).json({
          success: false,
          error: 'day must be between 0 and 6',
        });
        return;
      }

      // Convert day number to day name for the thermostat API
      // The thermostat API expects day names for POST requests: mon, tue, wed, thu, fri, sat, sun
      const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      const dayName = dayNames[dayNum];

      // The thermostat API expects the body as: { "dayNum": [time, temp, time, temp, ...] }
      // where the key is the day number (0-6), but the URL uses the day name
      const thermostatBody = {
        [dayNum.toString()]: schedule,
      };

      // Send to the thermostat using the day name in the URL
      const thermostatUrl = `http://${ipAddress}/tstat/program/${mode}/${dayName}`;
      console.log(`[ThermostatProxy] Posting to: ${thermostatUrl}`, thermostatBody);

      const response = await axios.post(thermostatUrl, thermostatBody, {
        timeout: 15000,  // Increased timeout - thermostats can be slow
      });

      res.json({
        success: true,
        message: 'Program updated successfully',
        data: response.data,
      });
    } catch (error) {
      console.error('Error setting thermostat program:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update thermostat program',
      });
    }
  }

  public async setThermostatSettings(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress } = req.params;
      const { tmode, fmode, hold, t_heat, t_cool } = req.body;

      if (!ipAddress) {
        res.status(400).json({
          success: false,
          error: 'ipAddress is required',
        });
        return;
      }

      // Build the request body with only provided fields
      const thermostatBody: any = {};
      
      if (tmode !== undefined) thermostatBody.tmode = tmode;
      if (fmode !== undefined) thermostatBody.fmode = fmode;
      if (hold !== undefined) thermostatBody.hold = hold;
      if (t_heat !== undefined) thermostatBody.t_heat = t_heat;
      if (t_cool !== undefined) thermostatBody.t_cool = t_cool;

      if (Object.keys(thermostatBody).length === 0) {
        res.status(400).json({
          success: false,
          error: 'At least one setting (tmode, fmode, hold, t_heat, t_cool) is required',
        });
        return;
      }

      // Send to the thermostat
      const thermostatUrl = `http://${ipAddress}/tstat`;
      console.log(`[ThermostatProxy] Posting settings to: ${thermostatUrl}`, thermostatBody);

      const response = await axios.post(thermostatUrl, thermostatBody, {
        timeout: 15000,
      });

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: response.data,
      });
    } catch (error) {
      console.error('Error setting thermostat settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update thermostat settings',
      });
    }
  }
}
