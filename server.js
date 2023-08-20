const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middlewares/error');
const auth = require('./routes/auth');
const payments = require('./routes/payments');
const categories = require('./routes/categories');
const series = require('./routes/series');
const lessons = require('./routes/lessons');
const subLessons = require('./routes/subLessons');
const users = require('./routes/users');
const marketers = require('./routes/marketers');
const admins = require('./routes/admins');
const { createWebhookHash } = require('./utils/misc');
const { handleWebhook } = require('./services/PaystackService');

const swaggerDocument = require('./swagger.json');

const { connectDB } = require('./config/db');

dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

let origin = ['https://marketer.learnboost.ng'];
if (process.env.TEST_ENV === 'true') {
  origin.push('http://localhost:3000');
}

app.use(
  cors({ origin: origin, credentials: true, exposedHeaders: ['X-Total-Count'] })
);
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production' && process.env.TEST_ENV === 'false'
        ? true
        : false,
  })
);
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const httpServer = http.Server(app);

app.get('/', (req, res) => {
  return res.send('Hello there!');
});

// Paystack transaction webhook
app.post('/api/paystack/transaction-completion-webhook', function (req, res) {
  // Generate hash
  const hash = createWebhookHash(process.env.PAYSTACK_SECRET_KEY, req.body);

  // Compare hash
  if (hash == req.headers['x-paystack-signature']) {
    handleWebhook(req.body, res);
  } else {
    res.status(403).send('Unauthorized');
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/payments', payments);
app.use('/api/v1/categories', categories);
app.use('/api/v1/series', series);
app.use('/api/v1/lessons', lessons);
app.use('/api/v1/subLessons', subLessons);
app.use('/api/v1/users', users);
app.use('/api/v1/marketers', marketers);
app.use('/api/v1/admins', admins);

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
