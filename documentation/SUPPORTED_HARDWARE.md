# Supported Hardware

This document provides information about thermostat hardware that is compatible with Smart Thermostat Scheduler.

## Compatible Thermostats

Smart Thermostat Scheduler is designed to work with **RTCOA (Radio Thermostat Company of America) WiFi-enabled thermostats** that implement the RTCOA WiFi API.

### Tested & Verified

The following thermostat models have been tested and verified to work with this application:

- **CT50** - Smart WiFi Thermostat (Primary tested model)
- **CT80** - Smart WiFi Thermostat

### Likely Compatible

The following models should be compatible based on RTCOA API documentation, though they have not been explicitly tested:

- **CT30** - WiFi Thermostat (older model)
- **CT32** - WiFi Thermostat
- **CT33** - WiFi Thermostat
- **CT3949** - WiFi Thermostat

### API Compatibility

Any thermostat that implements the **RTCOA WiFi API v1.3** or compatible versions should work with this application. The application communicates using the standard RTCOA API endpoints:

- `/tstat` - Current thermostat state
- `/tstat/program/[day]` - Schedule programming
- `/tstat/settings` - Thermostat settings (mode, fan, hold, temperature)

See `documentation/RTCOAWiFIAPIV1_3.txt` for complete API specification.

## Network Requirements

### Thermostat Network Setup

1. **WiFi Connectivity**: Your thermostat must have WiFi capability and be connected to your local network
2. **IP Address**: The thermostat should have a static IP address or DHCP reservation for reliable connection
3. **Network Access**: The application must be able to reach the thermostat on your local network
4. **Security**: Consider your network security configuration:
   - Deploy on a trusted local network only
   - Use network segmentation if possible
   - Implement firewall rules to restrict access

### Application Network Setup

- Deploy on the same local network as your thermostats
- Ensure proper firewall configuration
- For remote access, consider using a VPN

## Hardware Requirements

### Application Server

The application can run on various platforms:

- **Docker**: Recommended for easy deployment
  - Linux Docker host
  - Docker Desktop on Windows/Mac
  - NAS devices with Docker support (Synology, QNAP, etc.)
  - Raspberry Pi with Docker

- **Bare Metal**: Requires Node.js 16+
  - Linux server/computer
  - macOS
  - Windows

### Minimum Specifications

- **CPU**: Single core capable of running Node.js
- **RAM**: 256 MB (512 MB recommended)
- **Storage**: 500 MB (including Docker image if applicable)
- **Network**: Gigabit Ethernet or WiFi connected to same network as thermostats

### Recommended Specifications

- **CPU**: Dual core or better
- **RAM**: 1 GB or more
- **Storage**: 2 GB or more
- **Network**: Gigabit Ethernet connected

## Temperature Sensors

### Built-in Thermostat Sensors

All RTCOA thermostats include built-in temperature sensors. The CT50 specifically includes:

- Primary temperature sensor (thermostat location)
- Setpoint tracking
- Network temperature reporting capabilities

### Remote Sensors (Advanced)

Some RTCOA models support remote temperature sensors through specific configurations. Check your thermostat's documentation for details.

## Known Limitations

1. **Thermostat Discovery**: Auto-discovery works best on networks without complex routing
2. **API Response Time**: WiFi thermostats may have 1-5 second response delays
3. **Polling Interval**: Default 60-second polling interval for history collection
4. **Schedule Complexity**: Programs are limited by thermostat hardware capabilities

## Troubleshooting

### Cannot Connect to Thermostat

1. Verify thermostat has WiFi connectivity
2. Check thermostat IP address is correct
3. Verify both devices are on the same network
4. Check firewall rules aren't blocking the connection

### Erratic Temperature Readings

1. Ensure thermostat is properly mounted
2. Avoid placing thermostat in direct sunlight
3. Check for drafts or heat sources near thermostat
4. Verify thermostat firmware is up to date

### Schedule Not Syncing

1. Verify thermostat is connected to WiFi
2. Check thermostat's local API is accessible
3. Try power-cycling the thermostat
4. Check application logs for API errors

## Future Hardware Support

Support for additional thermostat brands may be added in the future. The current focus is on RTCOA WiFi API compatibility.

## Contributing Support for New Hardware

If you have a compatible RTCOA thermostat that isn't listed above, please:

1. Test it with the application
2. Document any differences in behavior
3. Open a GitHub issue with your findings
4. Include your thermostat model and any error messages

Your contributions help expand hardware support for the project!
