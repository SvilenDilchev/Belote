const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Player = require('./classes/Player');
const Room = require('./classes/Room');

const PORT = 3001;
const CLIENT_ORIGIN = 'http://localhost:3000';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ['GET', 'POST'],
    },
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const activeRooms = new Map();

io.on('connection', (socket) => {
    console.log(`User connected -- ${socket.id}`);
    const user = new Player(socket.id);

    socket.on('join_room', (data) => {
        user.setName(data.playerName);
        const users = io.sockets.adapter.rooms.get(data.roomID);

        if (users === undefined || (users && users.size <= 3)) {
            let room;
            if (!activeRooms.has(data.roomID)) {
                room = new Room(data.roomID);
                room.owner = user;
                console.log("room -- ", room)
                activeRooms.set(data.roomID, room);
                console.log("activeRooms -- ", activeRooms)
            } else {
                room = activeRooms.get(data.roomID);
            }

            socket.join(data.roomID);
            user.joinRoom(data.roomID);
            room.addPlayer(user);

            socket.emit('set_room', room);
            socket.to(data.roomID).emit('update_players', room.players);
        } else {
            socket.emit('room_full');
        }
    });

    socket.on('start_game', () => {
        const room = activeRooms.get(user.roomID);
        console.log('received start_game')
        console.log("activeRooms -- ", activeRooms)
        console.log("room -- ", room)
        console.log(io.sockets.adapter.rooms.get(room.roomID))
        socket.to(user.roomID).emit('setup_game');
        console.log('emitted setup_game')
    });

    socket.on('disconnect', () => {
        user.leaveRoom();
        console.log(`User disconnected -- ${socket.id}`);
    });
});
