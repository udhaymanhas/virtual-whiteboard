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

io.on('connection', (socket) => {
  console.log('Client Connection Success');
  socket.on('draw', (data) => {
    io.emit('share', data);
  })
})

server.listen(PORT, () => {
  console.log('Server is up at: ',PORT );
})
