import express from 'express';
import ReservationRouter from './routes/reservation.router.js';
import UsersRouter from './routes/users.router.js';
import cookieParser from 'cookie-parser';
import logMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import { engine } from 'express-handlebars';

const app = express();
const PORT = 3334;

// app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());

// app.engine('hbs', hbs({ extname: 'hbs' }));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.use(express.static('views/images'))
app.set('views', './views');
// app.use(express.static('public'));



app.get('/', (req, res) => {
  res.render('index', { layout: 'main' });
})

app.get('/getReserv', function(req, res, next) {
  res.render('index', {layout:'getReserv'});
});



app.use('/api', [UsersRouter, ReservationRouter]);

app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
