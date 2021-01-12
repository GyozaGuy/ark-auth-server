import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import morgan from 'morgan';

import routes from './routes.mjs';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set('port', port);
app.use(express.json());
app.use(morgan('combined'));
app.use(routes);

const server = http.createServer(app);

server.listen(port);

server.on('error', err => {
  console.error(err.message);
});

server.on('listening', () => {
  console.info(`Listening on port ${port}`);
});
