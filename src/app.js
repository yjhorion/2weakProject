import express from 'express';
import ReservationRouter from './routes/reservation.router.js';
import UsersRouter from './routes/users.router.js';
import cookieParser from 'cookie-parser';
import logMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';
// import { winston } from 'winston';

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

const app = express();
const PORT = 3334;

//sentry 기본 골격
Sentry.init({
  dsn: 'https://1e0167f101addf065a55c98794d4f9dc@o4506284612255744.ingest.sentry.io/4506284617433088',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/api', [UsersRouter, ReservationRouter]);

app.use(Sentry.Handlers.errorHandler());
app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
