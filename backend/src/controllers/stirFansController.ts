import { Request, Response } from 'express';
import { getStirFansSetting, setStirFansEnabled } from '../services/database';

export class StirFansController {
  public async getStirFansSetting(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress } = req.params;

      if (!ipAddress) {
        res.status(400).json({
          success: false,
          error: 'ipAddress is required',
        });
        return;
      }

      const setting = await getStirFansSetting(ipAddress);

      res.json({
        success: true,
        data: setting,
      });
    } catch (error) {
      console.error('Error fetching stir fans setting:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stir fans setting',
      });
    }
  }

  public async setStirFansSetting(req: Request, res: Response): Promise<void> {
    try {
      const { ipAddress } = req.params;
      const { enabled } = req.body;

      if (!ipAddress) {
        res.status(400).json({
          success: false,
          error: 'ipAddress is required',
        });
        return;
      }

      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'enabled must be a boolean',
        });
        return;
      }

      await setStirFansEnabled(ipAddress, enabled);

      res.json({
        success: true,
        message: `Stir fans ${enabled ? 'enabled' : 'disabled'} for ${ipAddress}`,
        data: {
          ip_address: ipAddress,
          enabled: enabled ? 1 : 0,
        },
      });
    } catch (error) {
      console.error('Error setting stir fans:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set stir fans setting',
      });
    }
  }
}
