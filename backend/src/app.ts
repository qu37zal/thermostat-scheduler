import express from 'express';
import { setRoutes } from './routes/index';
import { initializeDatabase } from './services/database';
import { initStirFansScheduler } from './services/stirFansScheduler';

const app = express();
const PORT = process.env.PORT || 5555;

app.use(express.json());

// Initialize database before setting up routes
async function startServer() {
    try {
        await initializeDatabase();
        await initStirFansScheduler();
        setRoutes(app);
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();