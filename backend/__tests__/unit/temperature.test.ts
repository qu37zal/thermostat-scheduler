import { celsiusToFahrenheit, fahrenheitToCelsius, validateTemperature } from '../../src/utils/temperature';

describe('Temperature Utility Functions', () => {
  describe('celsiusToFahrenheit', () => {
    it('should convert 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it('should convert 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it('should convert 20°C to 68°F', () => {
      expect(celsiusToFahrenheit(20)).toBeCloseTo(68, 1);
    });
  });

  describe('fahrenheitToCelsius', () => {
    it('should convert 32°F to 0°C', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it('should convert 212°F to 100°C', () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it('should convert 68°F to 20°C', () => {
      expect(fahrenheitToCelsius(68)).toBeCloseTo(20, 1);
    });
  });

  describe('validateTemperature', () => {
    it('should accept valid temperature (72°F)', () => {
      expect(validateTemperature(72)).toBe(true);
    });

    it('should reject temperature below minimum (49°F)', () => {
      expect(validateTemperature(49)).toBe(false);
    });

    it('should reject temperature above maximum (91°F)', () => {
      expect(validateTemperature(91)).toBe(false);
    });

    it('should accept boundary values', () => {
      expect(validateTemperature(50)).toBe(true);
      expect(validateTemperature(90)).toBe(true);
    });

    it('should work with custom min/max', () => {
      expect(validateTemperature(65, 60, 75)).toBe(true);
      expect(validateTemperature(55, 60, 75)).toBe(false);
    });
  });
});
