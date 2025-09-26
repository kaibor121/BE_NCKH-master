const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const WS_PORT = process.env.WS_PORT || 8087;

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
    console.log('WebSocket connected');

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});


module.exports = wss;