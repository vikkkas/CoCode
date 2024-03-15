const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);

// Connecting the build version with the server
app.use(express.static('build'));
// refresh bug
app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'build','index.html'));
});
const userSocketMap = {};

function getAllConnectedClients(sessionId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(sessionId)).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId], 
            };
        }
    );
}

io.on('connection',(socket)=>{
    console.log('socket connected',socket.id);
    socket.on(ACTIONS.JOIN,({sessionId, username})=>{
        userSocketMap[socket.id] = username;
        socket.join(sessionId);
        const clients = getAllConnectedClients(sessionId);
        console.log(clients);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ sessionId, code }) => {
        socket.in(sessionId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((sessionId) => {
            socket.in(sessionId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});
    

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Listening on port",{PORT}));