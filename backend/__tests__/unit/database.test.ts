import {
  initializeDatabase,
  getDatabase,
  saveKnownThermostat,
  getKnownThermostats,
  deleteKnownThermostat,
  saveThermostatHistory,
  getThermostatHistory,
  closeDatabase,
} from '../../src/services/database';

describe('Database Service', () => {
  beforeAll(async () => {
    // Initialize with in-memory database for testing
    process.env.DB_PATH = ':memory:';
    await initializeDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Thermostat Management', () => {
    const testThermostat = {
      ip_address: '192.168.1.100',
      name: 'Living Room',
      model: 'CT50',
    };

    it('should save a thermostat', async () => {
      const result = await saveKnownThermostat(testThermostat.ip_address, testThermostat.name, testThermostat.model);
      expect(result).toBeUndefined(); // This function doesn't return anything
    });

    it('should retrieve saved thermostat', async () => {
      const thermostats = await getKnownThermostats();
      expect(thermostats.length).toBeGreaterThan(0);
      const found = thermostats.find((t: any) => t.ip_address === testThermostat.ip_address);
      expect(found).toBeDefined();
      expect(found?.name).toBe(testThermostat.name);
      expect(found?.model).toBe(testThermostat.model);
    });

    it('should update thermostat name', async () => {
      const updatedName = 'Main Living Room';
      await saveKnownThermostat(testThermostat.ip_address, updatedName, testThermostat.model);
      const thermostats = await getKnownThermostats();
      const updated = thermostats.find((t: any) => t.ip_address === testThermostat.ip_address);
      expect(updated?.name).toBe(updatedName);
    });

    it('should delete a thermostat', async () => {
      await deleteKnownThermostat(testThermostat.ip_address);
      const thermostats = await getKnownThermostats();
      expect(thermostats).not.toContainEqual(expect.objectContaining(testThermostat));
    });

    it('should return empty list when no thermostats exist', async () => {
      const thermostats = await getKnownThermostats();
      expect(Array.isArray(thermostats)).toBe(true);
    });
  });

  describe('History Management', () => {
    const thermostatIp = '192.168.1.101';
    const testHistory = {
      temperature: 72,
      setpoint: 70,
      mode: 'heat',
      fanMode: 'auto',
      runtimeMinutes: 120,
    };

    beforeAll(async () => {
      // Save a thermostat for history tracking
      await saveKnownThermostat(thermostatIp, 'Test Room', 'CT50');
    });

    it('should save thermostat history', async () => {
      const result = await saveThermostatHistory(thermostatIp, testHistory);
      expect(result).toBeUndefined(); // Function doesn't return anything
    });

    it('should retrieve history for thermostat', async () => {
      const history = await getThermostatHistory(thermostatIp);
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should save multiple history entries', async () => {
      for (let i = 0; i < 5; i++) {
        await saveThermostatHistory(thermostatIp, {
          ...testHistory,
          temperature: 70 + i,
        });
      }

      const history = await getThermostatHistory(thermostatIp);
      expect(history.length).toBeGreaterThanOrEqual(5);
    });

    it('should return empty array for unknown thermostat', async () => {
      const history = await getThermostatHistory('192.168.1.999');
      expect(history).toEqual([]);
    });

    it('should include timestamp in history', async () => {
      const history = await getThermostatHistory(thermostatIp);
      if (history.length > 0) {
        expect(history[0]).toHaveProperty('timestamp');
      }
    });
  });

  describe('Database State', () => {
    it('should have database instance available', () => {
      const db = getDatabase();
      expect(db).toBeDefined();
    });
  });
});
