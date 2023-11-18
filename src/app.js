import express from 'express';
<<<<<<< HEAD
// import Categoriesrouter from './routes/categories.router.js';
// import MenusRouter from './routes/menus.router.js';
import ReservationRouter from './routes/reservation.router.js';
import UsersRouter from './routes/users.router.js';
=======
import Categoriesrouter from './routes/categories.router.js';
>>>>>>> 6db91f577553823053ffd5bae39150518afcaca5
import cookieParser from 'cookie-parser';
import logMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import MenusRouter from './routes/menus.router.js';
import UsersRouter from './routes/users.router.js';
import OrdersRouter from './routes/orders.router.js';

const app = express();
const PORT = 3334;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
<<<<<<< HEAD
app.use(express.static('public'));
app.use('/api', [UsersRouter, ReservationRouter]);
=======
app.use('/api', [Categoriesrouter, MenusRouter, UsersRouter, OrdersRouter]);
>>>>>>> 6db91f577553823053ffd5bae39150518afcaca5
app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
