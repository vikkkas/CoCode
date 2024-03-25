const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors

const server = http.createServer(app);
const io = new Server(server);

app.use(cors(({
    origin: 'http://localhost:3000'})));
// Connect to your MongoDB database using Mongoose
mongoose.connect('mongodb://localhost:27017/co-code', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=> console.log("MongoDB connected"));
// Define a schema and a model for your code documents
const codeSchema = new mongoose.Schema({
    sessionId: String,
    code: String
  }); 
  
const Code = mongoose.model('Code', codeSchema); //Mongo Object

app.use(express.json()); // Make sure to use this middleware to parse JSON bodies
app.post('/save-code', async (req, res) => {
    // Get the session id and the code from the request body
    const { sessionId, code } = req.body;

    // Find a document with the same session id and update it
    try {
        const updatedCode = await Code.findOneAndUpdate(
            { sessionId: sessionId }, // find a document with this filter
            { code: code }, // update the document with this data
            { new: true, upsert: true } // options: return updated one, create if doesn't exist
        );

        res.send(updatedCode);
    } catch (err) {
        res.status(500).send({ error: 'An error has occurred' });
    }
});

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