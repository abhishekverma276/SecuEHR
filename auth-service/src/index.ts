import express from 'express';
import { AppDataSource } from './data-source';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import requestLogger from './middleware/logger.middleware';
import logger from './utility/logger';
import { matricsMiddleware, matricsEndpoint, testCounter } from './monitor/metrics';


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(requestLogger);

app.use(matricsMiddleware);


app.get('/health', (req, res) => {
  logger.info("/health accessed");
  res.send('Auth Microservice is running');
});


app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/metrics', matricsEndpoint);

AppDataSource.initialize()
    .then(() => {
    logger.info("Data Source has been initialized!");
    app.listen(PORT, () => {
      logger.info(`Auth Microservice is running on port ${PORT}`);
    });

  })
  .catch((err) => {
    logger.error("Error during Data Source initialization:", err);
  });



