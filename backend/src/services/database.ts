import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db: any = null;

export async function initializeDatabase() {
  if (db) return db;

  const dbPath = process.env.DB_PATH || '/app/data/thermostat.db';
  const dbDir = path.dirname(dbPath);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS known_thermostats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL UNIQUE,
      name TEXT,
      model TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS thermostat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thermostat_id INTEGER NOT NULL,
      ip_address TEXT NOT NULL,
      temperature REAL,
      setpoint REAL,
      mode TEXT,
      fan_mode TEXT,
      runtime_minutes INTEGER,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thermostat_id) REFERENCES known_thermostats(id)
    );

    CREATE TABLE IF NOT EXISTS stir_fans_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thermostat_id INTEGER NOT NULL UNIQUE,
      ip_address TEXT NOT NULL UNIQUE,
      enabled INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thermostat_id) REFERENCES known_thermostats(id)
    );

    CREATE INDEX IF NOT EXISTS idx_history_ip_timestamp 
      ON thermostat_history(ip_address, timestamp);

    CREATE INDEX IF NOT EXISTS idx_history_thermostat_timestamp 
      ON thermostat_history(thermostat_id, timestamp);

    CREATE INDEX IF NOT EXISTS idx_stir_fans_enabled
      ON stir_fans_settings(enabled);
  `);

  console.log('[Database] Initialized successfully');
  return db;
}

export async function getDatabase() {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
}

export async function saveKnownThermostat(
  ipAddress: string,
  name?: string,
  model?: string
) {
  const database = await getDatabase();
  
  try {
    await database.run(
      `INSERT INTO known_thermostats (ip_address, name, model)
       VALUES (?, ?, ?)
       ON CONFLICT(ip_address) DO UPDATE SET 
         name = COALESCE(?, name),
         model = COALESCE(?, model),
         updated_at = CURRENT_TIMESTAMP`,
      [ipAddress, name || null, model || null, name || null, model || null]
    );
  } catch (error) {
    console.error('[Database] Error saving thermostat:', error);
    throw error;
  }
}

export async function getKnownThermostats() {
  const database = await getDatabase();
  
  try {
    const thermostats = await database.all(
      `SELECT * FROM known_thermostats ORDER BY created_at`
    );
    return thermostats || [];
  } catch (error) {
    console.error('[Database] Error fetching thermostats:', error);
    throw error;
  }
}

export async function deleteKnownThermostat(ipAddress: string) {
  const database = await getDatabase();
  
  try {
    await database.run(
      `DELETE FROM known_thermostats WHERE ip_address = ?`,
      [ipAddress]
    );
  } catch (error) {
    console.error('[Database] Error deleting thermostat:', error);
    throw error;
  }
}

export async function saveThermostatHistory(
  ipAddress: string,
  data: {
    temperature?: number;
    setpoint?: number;
    mode?: string;
    fanMode?: string;
    runtimeMinutes?: number;
  }
) {
  const database = await getDatabase();
  
  try {
    // First ensure the thermostat exists in known_thermostats
    await database.run(
      `INSERT OR IGNORE INTO known_thermostats (ip_address) VALUES (?)`,
      [ipAddress]
    );
    
    // Get the thermostat ID
    const thermostat = await database.get(
      `SELECT id FROM known_thermostats WHERE ip_address = ?`,
      [ipAddress]
    );

    if (thermostat) {
      await database.run(
        `INSERT INTO thermostat_history 
         (thermostat_id, ip_address, temperature, setpoint, mode, fan_mode, runtime_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          thermostat.id,
          ipAddress,
          data.temperature ?? null,
          data.setpoint ?? null,
          data.mode ?? null,
          data.fanMode ?? null,
          data.runtimeMinutes ?? null,
        ]
      );
    }
  } catch (error) {
    console.error('[Database] Error saving history:', error);
    throw error;
  }
}

export async function getThermostatHistory(
  ipAddress: string,
  hoursBack: number = 72
) {
  const database = await getDatabase();
  
  try {
    const history = await database.all(
      `SELECT * FROM thermostat_history 
       WHERE ip_address = ? 
       AND timestamp > datetime('now', '-' || ? || ' hours')
       ORDER BY timestamp DESC`,
      [ipAddress, hoursBack]
    );
    return history || [];
  } catch (error) {
    console.error('[Database] Error fetching history:', error);
    throw error;
  }
}

export async function getStirFansSetting(ipAddress: string) {
  const database = await getDatabase();
  
  try {
    const setting = await database.get(
      `SELECT * FROM stir_fans_settings WHERE ip_address = ?`,
      [ipAddress]
    );
    return setting || { ip_address: ipAddress, enabled: 0 };
  } catch (error) {
    console.error('[Database] Error fetching stir fans setting:', error);
    throw error;
  }
}

export async function setStirFansEnabled(ipAddress: string, enabled: boolean) {
  const database = await getDatabase();
  
  try {
    // First, try to get the thermostat ID
    const thermostat = await database.get(
      `SELECT id FROM known_thermostats WHERE ip_address = ?`,
      [ipAddress]
    );

    if (!thermostat) {
      throw new Error(`Thermostat not found: ${ipAddress}`);
    }

    await database.run(
      `INSERT INTO stir_fans_settings (thermostat_id, ip_address, enabled)
       VALUES (?, ?, ?)
       ON CONFLICT(ip_address) DO UPDATE SET 
         enabled = ?,
         updated_at = CURRENT_TIMESTAMP`,
      [thermostat.id, ipAddress, enabled ? 1 : 0, enabled ? 1 : 0]
    );
  } catch (error) {
    console.error('[Database] Error setting stir fans:', error);
    throw error;
  }
}

export async function getEnabledStirFansThermostats() {
  const database = await getDatabase();
  
  try {
    const thermostats = await database.all(
      `SELECT * FROM stir_fans_settings WHERE enabled = 1`
    );
    return thermostats || [];
  } catch (error) {
    console.error('[Database] Error fetching enabled stir fans thermostats:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
