const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const http = require('http');
const server = http.createServer(app);


const io = require('socket.io')(server,{
    cors: {
        origin: "http://localhost:4200", // Replace with your Angular app's URL
        methods: ["GET", "POST"]
    }
});

let socketsConnected = new Set();
let connectedUsers =[]; 
io.on('connection', onConnected)

function onConnected(socket) {
    // console.log(socket)
    console.log("Id:",socket.id)
    const { username, email,contact } = socket.handshake.query;
    console.log(username, email, contact)
    socketsConnected.add({id:socket.id,username:username, email:email,messages:[]});
    connectedUsers.push({id:socket.id,username:username, email:email, messages:[]});
    io.emit('clients-total', socketsConnected.size);

    const uniqueUsersByEmail = Array.from(
        new Map(connectedUsers.map(user => [user.email, user])).values()
      );
      io.emit('users', uniqueUsersByEmail);
   
    socket.on('disconnect', () => {
        console.log('Socket Disconnected', socket.id);
        socketsConnected.delete(socket.id);
        io.emit('clients-total', socketsConnected.size)
    })

    socket.on("message",(data)=>{
     
        console.log("connected Users:",connectedUsers)
        console.log("message received By:",socket.id)
        console.log(data)
        socket.broadcast.emit('chat-message',data)
    })


 // Handler for emitting message to a particular socket ID


 socket.on("private-message", (data) => {

    data.senderId=socket.id;
    data.isOwnMessage=false;
const targetId=data.targetId;
console.log("emitted private message")
    console.log(`Private message from ${socket.id} to ${targetId}: ${data.message}`);
    io.to(targetId).emit('private-message', data);
});

    socket.on("feedback",(data)=>{
        socket.broadcast.emit('feedback',data)
    })
}


app.use(express.static(path.join(__dirname, 'public')));

server.listen(port, () => 'Chat Server Running on port:', port);