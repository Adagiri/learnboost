const http = require('http');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middlewares/error');
const auth = require('./routes/auth');
const payments = require('./routes/payments');

const swaggerDocument = require('./swagger.json');

const { connectDB } = require('./config/db');

dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

if (process.env.TEST_ENV) {
  app.use(cors());
}

app.use(cookieParser());

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const httpServer = http.Server(app);

app.get('/', (req, res) => {
  return res.send('Hello there!');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/payments', payments);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const server = httpServer.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});
