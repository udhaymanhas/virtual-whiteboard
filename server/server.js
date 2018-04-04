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
  clients.push(socket);
  canvasHistory[socket.id] = []; // initialize client history

  Object.keys(canvasHistory).forEach(function(clientId) {
    var history = canvasHistory[clientId];
    if(history.length>0){
      history.forEach(function(line, key){
        socket.emit('history',line);
      })
    }
  });

  socket.on('draw', (data) => {
    if(data.name.length == 0){
      data.name = 'user'+clients.indexOf(socket);//default name
    }
    if(data.points != undefined){
      canvasHistory[socket.id].push(data.points);
      socket.broadcast.emit('share', data);
    }
    if(data.points == undefined && data.active == false){
      socket.broadcast.emit('share', data);
    }
  });

  socket.on('disconnect', (socket) => {
    clients.splice(clients.indexOf(socket),1);
    if(clients.length == 0){
      canvasHistory = {};
    }
  });
})

server.listen(PORT, () => {
  console.log('Server is up at: ',PORT );
})
