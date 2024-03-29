const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Player = require('./classes/Player');
const Room = require('./classes/Room');
const Game = require('./classes/Game');

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
                activeRooms.set(data.roomID, room);
            } else {
                room = activeRooms.get(data.roomID);
            }

            socket.join(data.roomID);
            user.joinRoom(data.roomID);
            room.addPlayer(user);

            socket.emit('set_room', room);
            socket.to(room.roomID).emit('update_room', room);
            socket.to(data.roomID).emit('update_players', room.players);
        } else {
            socket.emit('room_full');
        }
    });

    socket.on('start_game', (room) => {
        const game = new Game(room);
        game.setTeams(user);

        const users = io.sockets.adapter.rooms.get(room.roomID);
        console.log(users);

        socket.to(socket.id).emit('print', "printing");

        io.to(room.roomID).emit('receiveGameData', game);
        io.to(room.roomID).emit('setup_game');
    });

    socket.on('disconnect', () => {
        const room = activeRooms.get(user.roomID);
        if(room){
            room.removePlayer(user);
            socket.to(room.roomID).emit('update_room', room);
            socket.to(room.roomID).emit('update_players', room.players);
            if(room.players.length === 0){
                activeRooms.delete(user.roomID);
            }
        }
        user.leaveRoom();

        console.log(`User disconnected -- ${socket.id}`);
    });
});
