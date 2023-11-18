import express from 'express';
import ReservationRouter from './routes/reservation.router.js';
import UsersRouter from './routes/users.router.js';
import cookieParser from 'cookie-parser';
import logMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';

const app = express();
const PORT = 3334;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/api', [UsersRouter, ReservationRouter]);

app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
