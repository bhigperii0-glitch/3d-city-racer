const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const players = {};

io.on('connection', (socket) => {
    // Wait for the player to send their username
    socket.on('playerJoin', (username) => {
        players[socket.id] = {
            id: socket.id,
            name: username,
            x: 0, z: 0, angle: 0,
            color: Math.floor(Math.random() * 0xffffff) // Random car color
        };

        // Send current players to the new player, and tell everyone else
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });

    socket.on('playerMovement', (d) => {
        if(players[socket.id]) {
            players[socket.id].x = d.x;
            players[socket.id].z = d.z;
            players[socket.id].angle = d.angle;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        if(players[socket.id]) {
            delete players[socket.id];
            io.emit('playerDisconnected', socket.id);
        }
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
