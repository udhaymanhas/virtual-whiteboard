/*******canvas.js
* cursor             -> stores the cursor data to identify actions/movements on cursor
* initial            -> hold the onload screen data, used to scale drawings
* scrollOffset       -> hold the onload screen data or default 0, used to fix usernames correctly
** addElement()           -> adds the user name to html
** updateCanvas()         -> updates the canvas with data points
** collectPoints()        -> collects two points to draw a line
** reset()                -> resets state to original
** canvas.onmousedown     -> passes points from mouse event to collectPoints()
** canvas.onmouseleave    -> fires reset() on mouse out of canvas
** canvas.onmouseup       -> fires reset() when cursor stops drawing
** socket.on('share'...   -> shares your drawing with server
** socket.on('history'... -> Updates drawing to current if a user joins late
*/

$(document).ready(function(){
    $(this).scrollTop(0);
});

var initial = { scrollX:window.scrollX,scrollY:window.scrollY}
var scrollOffset = { x:0,y:0 }
var name = window.name;
var color = window.color || 'black';
var socket = io.connect();
var canvas = document.getElementById("canvas");
var draw = canvas.getContext("2d");
canvas.width = window.innerWidth-(0.1*window.innerWidth);
canvas.height = window.innerHeight-(0.2*window.innerHeight);
var width = canvas.width;
var height = canvas.height;

var users = [];

var cursor = {
  hold: false,
  move: false,
  cur_pos: {x:0, y:0},
  prev_pos: false
}

if(initial.scrollX > 0 || initial.scrollY > 0){
  scrollOffset.y =  initial.scrollY
  scrollOffset.x =  initial.scrollX
}

initialize();

function initialize() {
	window.addEventListener('resize', resizeCanvas, false);
	resizeCanvas();
}

var setColorSm = function(color){
  window.color = color;
}

function resizeCanvas() {
  var cnv = document.getElementById("canvas");
  cnv.width = window.innerWidth-(0.1*window.innerWidth);
  cnv.height = window.innerHeight-(0.2*window.innerHeight);
  width = cnv.width;
  height = cnv.height;
  socket.emit('getHistory');
}

function addElement(socketId, name, points){
  div = $("<div />");

  div.attr("id", socketId);
  div.attr("class", 'element');
  div.css("position", 'absolute');
  div.css("left", points[0].x* width);
  div.css("top", points[0].y* height);
  div.css("z-index", 99);
  div.html(name);

  $("#display").append(div)
}

function updateCanvas(points){
  draw.beginPath();
  draw.lineWidth = 2.5;
  draw.lineJoin = 'round';
  draw.lineCap = 'round';
  draw.moveTo((points[0].x*width), (points[0].y*height));
  draw.lineTo((points[1].x*width), (points[1].y*height));
  draw.strokeStyle = points[2];
  draw.stroke();
}

function collectPoints(cursor, color){
  if (cursor.hold && cursor.move && cursor.prev_pos) {
    if(cursor.prev_pos.x != 0 && cursor.prev_pos.y != 0){
      updateCanvas([ cursor.cur_pos, cursor.prev_pos, color ]);
      socket.emit('draw', {
        name: name,
        active: true,
        points: [ cursor.cur_pos, cursor.prev_pos, color ]
      });
      cursor.move = false;
    }
  }
  cursor.prev_pos = {x: cursor.cur_pos.x, y: cursor.cur_pos.y};
}

function reset(){
  cursor = {
    hold: false,
    move: false,
    cur_pos: {x:0, y:0},
    prev_pos: false
  };
  socket.emit('draw', {
    name: name,
    active: false
  });
  canvas.onmousemove = function(e){};
}

function emptyCanvas(){
  draw.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('resetCanvas');
}

socket.on('connect',function(e){
  console.log('connected to server...');
})

canvas.onmousedown = function(e){
  cursor.hold = true;
  canvas.onmousemove = function(e){
    cursor.cur_pos.x = (e.clientX-$('#canvas').offset().left)/width;
    cursor.cur_pos.y = (e.clientY-$('#canvas').offset().top)/height;
    cursor.move = true;
    setTimeout(collectPoints(cursor, color), 0);
  }
}

canvas.onmouseup = function(e){
  reset();
};

canvas.onmouseleave = function(e){
  reset();
};

socket.on('share', function (data) {
  var points = data.points;
  if(data.active == true){
    if(users.indexOf(data.name) == -1){
      users.push(data.name); // put new user
      addElement(socket.id, data.name, points) // draw new users name
    }
    else{
      var top = (points[0].y*height)+$('#canvas').offset().top ;
      var left = (points[0].x*width)+$('#canvas').offset().left;
      $('#'+socket.id).css({top: top, left: left})
    }
    updateCanvas(data.points);
  }
  else
  if(data.active == false){
    // remove name Element
    users.splice(users.indexOf(data.name),1);
    $("#"+socket.id).remove();
  }
});

socket.on('history', function (line) {
  if(line.length == 3){
    updateCanvas(line);
  }
});

socket.on('clearCanvas', function(){
  draw.clearRect(0, 0, canvas.width, canvas.height);
})
