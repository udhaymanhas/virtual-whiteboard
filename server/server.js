require('./config/server.config.js')

const PORT = process.env.PORT;
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const publicPath = path.join(__dirname, `../public`)
const app = express();

app.use(express.static(publicPath));

app.get('*', function (req, res) {
    res.sendFile(path.resolve(publicPath+'/index.html'));
})

var server = http.createServer(app);
var io = socketio.listen(server);
var clients = [];
var canvasHistory = {};

io.on('connect', (socket) => {
  console.log('-------History Length->',Object.keys(canvasHistory).length);
  console.log('Client Connection Success->',socket.id);
  clients.push(socket);
  canvasHistory[socket.id] = []; // initialize client history
  console.log('-------History Length->',Object.keys(canvasHistory).length);
  Object.keys(canvasHistory).forEach(function(clientId) {
    var history = canvasHistory[clientId];
    console.log(`History of client ${clientId} -> ${history.length}`);
    if(history.length>0){
      console.log('sending History');
      history.forEach(function(line, key){
        console.log(line);
        socket.emit('history',line);
      })
    }
  });

  socket.on('draw', (data) => {
    // io.emit('share', data);
    if(data.name.length == 0){
      data.name = 'user'+clients.indexOf(socket);
    }
    // console.log(`##Updating history for client ${clients.indexOf(socket)}`);
    // console.log(`data.points type`+typeof(data.points));
    // console.log(`data.points `,data.points);
    if(data.points != undefined){
      canvasHistory[socket.id].push(data.points);
      // canvasHistory[socket.id].color = data.color;
      socket.broadcast.emit('share', data);
    }
    if(data.points == undefined && data.active == false){
      socket.broadcast.emit('share', data);
    }
  });

  socket.on('disconnect', (socket) => {
    console.log('####client disconnected');
    clients.splice(clients.indexOf(socket),1);
    if(clients.length == 0){
      console.log('All Clients disconnected.');
      console.log('Emptying History.');
      canvasHistory = {};
    }
  });
})





server.listen(PORT, () => {
  console.log('Server is up at: ',PORT );
})
