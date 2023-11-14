import express from 'express';
import Categoriesrouter from './routes/categories.router.js';
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
app.use('/api', [Categoriesrouter, MenusRouter, UsersRouter, OrdersRouter]);
app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
