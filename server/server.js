/*******server.js
* clients[]             -> stores active clients socket id
* canvasHistory         -> hold client history as key(socketId):value(history[])
** io.on('connect',...  -> on client connection updates clients[] and initializes empty history
** Object.keys(canvasHistory) -> updates late joining client with other clients drawing
** socket.on('draw',..        -> when any clients starts or stops drawing
** socket.on('disconnect',..  -> on client disconnection, we update clients[], if clients=0, reset history
** socket.broadcast.emit('share',..  -> broadcasts drawing to other clients
*/

require('./config/server.config.js')

const PORT = process.env.PORT;
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const publicPath = path.join(__dirname, `../public`)
const app = express();

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

  socket.on('resetCanvas', () => {
    canvasHistory = {};
    socket.broadcast.emit('clearCanvas');
  });

  socket.on('disconnect', (socket) => {
    clients.splice(clients.indexOf(socket),1);
    if(clients.length == 0){
      canvasHistory = {};
    }
  });
})

app.use(express.static(publicPath));

app.get('*', function (req, res) {
    res.sendFile(path.resolve(publicPath+'/index.html'));
})

server.listen(PORT, () => {
  console.log('Server is up at: ',PORT );
})
