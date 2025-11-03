// Simple utility for temperature conversion
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

export const validateTemperature = (temp: number, min: number = 50, max: number = 90): boolean => {
  return temp >= min && temp <= max;
};
