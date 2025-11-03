# Security Policy

## Reporting a Vulnerability

**Please do not open a public issue for security vulnerabilities.**

If you discover a security vulnerability in Smart Thermostat Scheduler, please email the maintainer at **qu37zal@gmail.com** instead of using the public issue tracker.

When reporting a security issue, please include:

- **Description**: A clear description of the vulnerability
- **Affected Version(s)**: Which versions are affected?
- **Proof of Concept**: Steps to reproduce or a code example (if safe to disclose)
- **Impact**: What could an attacker do with this vulnerability?
- **Suggested Fix**: If you have a suggested fix, please include it

## Security Considerations

### Local Deployment

This project is primarily designed for local network deployment within your home or small office. Please consider:

1. **Network Security**
   - Deploy behind a firewall or VPN
   - Use HTTPS/TLS for all communications
   - Consider network segmentation

2. **Authentication**
   - Implement authentication mechanisms appropriate for your deployment
   - Use strong credentials if exposing to untrusted networks
   - Consider implementing API keys or OAuth tokens

3. **Data Privacy**
   - Thermostat data may contain sensitive information about occupancy patterns
   - Ensure proper access controls to prevent unauthorized access
   - Consider data encryption at rest if storing sensitive information

4. **Update Regularly**
   - Keep Node.js and npm dependencies updated
   - Monitor GitHub for security advisories
   - Apply patches promptly

### RTCOA WiFi API

This project communicates with RTCOA-compatible thermostats via WiFi. Please consider:

1. **WiFi Security**
   - Use WPA2 or WPA3 encryption for your WiFi network
   - Use a strong WiFi password
   - Keep firmware updated on your thermostat

2. **API Communication**
   - Review the thermostat manufacturer's security documentation
   - Ensure only trusted devices can communicate with the thermostat
   - Monitor for unauthorized access attempts

## Dependencies

We regularly review and update dependencies to address known security vulnerabilities. 

To check for vulnerabilities:

```bash
npm audit
npm audit fix
```

To see which dependencies have known issues:

```bash
npm audit --dry-run
```

## Security Best Practices for Users

1. **Keep Everything Updated**
   - Update Node.js regularly
   - Update npm packages regularly
   - Update Docker images regularly

2. **Use HTTPS**
   - Enable HTTPS in production deployments
   - Use valid SSL/TLS certificates

3. **Access Control**
   - Limit network access to trusted devices
   - Use firewalls to restrict access to your deployment
   - Consider VPN access for remote connections

4. **Monitor Logs**
   - Regularly review application logs for suspicious activity
   - Set up alerts for error conditions
   - Monitor for unauthorized access attempts

5. **Secure Configuration**
   - Never commit secrets to version control
   - Use environment variables for sensitive configuration
   - Review all configuration files for security issues

## Known Limitations

- This project is designed for trusted networks (home/office)
- It does not include built-in authentication mechanisms (you should add these)
- WiFi security depends on your network configuration
- The RTCOA WiFi API may have its own security considerations

## Security Updates

We take security seriously and will:

1. Acknowledge your report within 48 hours
2. Work on a fix in a timely manner
3. Release a patch as soon as possible
4. Credit you in the release notes (if desired)
5. Notify users of the security issue

## Responsible Disclosure

We follow responsible disclosure practices:

1. We will not publicly disclose the vulnerability until a fix is available
2. We will coordinate timing with you when possible
3. We appreciate being given time to develop and test fixes
4. We will acknowledge your contribution if you desire

## Questions?

For security-related questions or concerns that don't constitute a vulnerability report, please open a discussion in GitHub Discussions.

Thank you for helping keep Smart Thermostat Scheduler secure!
