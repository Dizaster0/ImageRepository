/**
 * Initializes the server at localhost:3000 using Express framework.
 */

const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port);
