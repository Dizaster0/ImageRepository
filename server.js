const http = require('http');
const app = require('./app');
const configs = require('./config');
const port = configs.port;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Image Repository is now listening on http://localhost:${port}`);
});
