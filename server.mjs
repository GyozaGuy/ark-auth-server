import dotenv from 'dotenv';
import express from 'express';
import http from 'http';

import routes from './routes.mjs';

dotenv.config();

const server = express();
const port = Number(process.env.PORT) || 3000;

server.set('port', port);
server.use(express.json());
server.use(routes);

const authServer = http.createServer(server);

authServer.listen(port);

authServer.on('error', err => {
  console.error(err.message);
});

authServer.on('listening', () => {
  console.info(`Listening on port ${port}`);
});
