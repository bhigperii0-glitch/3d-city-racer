const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const players = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const names = ["Speedster", "Blocky", "Miner", "Creeper", "Racer", "Steve", "Alex", "Pixel", "Diamond", "Ender"];
    const randomName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);

    players[socket.id] = {
        id: socket.id,
        name: randomName,
        x: 0, 
        z: 0,
        angle: 0,
        color: Math.floor(Math.random() * 0xffffff)
    };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('playerMovement', (movementData) => {
        if(players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].z = movementData.z;
            players[socket.id].angle = movementData.angle;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// EXPLICITLY bind to 0.0.0.0 so Render can detect the service
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
