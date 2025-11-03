import { Router } from 'express';
import { HelloController } from '../controllers/helloController';
import { ThermostatController } from '../controllers/thermostatController';
import { ThermostatProxyController } from '../controllers/thermostatProxyController';
import { StirFansController } from '../controllers/stirFansController';

const router = Router();
const thermostatRouter = Router();
const helloController = new HelloController();
const thermostatController = new ThermostatController();
const thermostatProxyController = new ThermostatProxyController();
const stirFansController = new StirFansController();

export const setRoutes = (app: any) => {
    app.use('/api/hello', router);
    app.use('/api/thermostats', thermostatRouter);
    
    // Hello routes
    router.get('/', helloController.getHello.bind(helloController));
    
    // Thermostat routes
    thermostatRouter.get('/', thermostatController.getThermostats.bind(thermostatController));
    thermostatRouter.post('/refresh', thermostatController.refreshThermostats.bind(thermostatController));
    thermostatRouter.get('/discovery/status', thermostatController.getDiscoveryStatus.bind(thermostatController));
    thermostatRouter.get('/known', thermostatController.getKnownThermostats.bind(thermostatController));
    thermostatRouter.post('/manual', thermostatController.setManualThermostats.bind(thermostatController));
    thermostatRouter.post('/discovery/debug', thermostatController.debugDiscovery.bind(thermostatController));
    
    // Database routes for saved thermostats
    thermostatRouter.get('/saved', thermostatController.getSavedThermostats.bind(thermostatController));
    thermostatRouter.post('/save', thermostatController.saveThermostat.bind(thermostatController));
    thermostatRouter.delete('/:ipAddress', thermostatController.deleteThermostat.bind(thermostatController));
    thermostatRouter.get('/:ipAddress/history', thermostatController.getThermostatHistory.bind(thermostatController));
    
    // Proxy routes for thermostat direct access
    thermostatRouter.get('/:ipAddress/data', thermostatProxyController.getThermostatData.bind(thermostatProxyController));
    thermostatRouter.get('/:ipAddress/program/:mode/:day', thermostatProxyController.getThermostatProgram.bind(thermostatProxyController));
    thermostatRouter.post('/:ipAddress/program/:mode/:day', thermostatProxyController.setThermostatProgram.bind(thermostatProxyController));
    thermostatRouter.post('/:ipAddress/settings', thermostatProxyController.setThermostatSettings.bind(thermostatProxyController));
    
    // Stir fans routes
    thermostatRouter.get('/:ipAddress/stir-fans', stirFansController.getStirFansSetting.bind(stirFansController));
    thermostatRouter.post('/:ipAddress/stir-fans', stirFansController.setStirFansSetting.bind(stirFansController));
};