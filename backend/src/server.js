import app from './app.js';
import http from 'http';
import { initSocket } from './utils/socket.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// initialize socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
