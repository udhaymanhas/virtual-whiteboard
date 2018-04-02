var canvas = document.getElementById("canvas");
var socket = io.connect();

var draw = canvas.getContext("2d");

var cursor = {
  hold: false,
  move: false,
  cur_pos: {x:0, y:0},
  prev_pos: false
}

canvas.onmousedown = function(e){
  cursor.hold = true;
  canvas.onmousemove = function(e){
    cursor.cur_pos.x = e.clientX ;
    cursor.cur_pos.y = e.clientY ;
    cursor.move = true;

    function collectPoints(){
      if (cursor.hold && cursor.move && cursor.prev_pos) {
        socket.emit('draw', { points: [ cursor.cur_pos, cursor.prev_pos ] });
        cursor.move = false;
      }
      cursor.prev_pos = {x: cursor.cur_pos.x, y: cursor.cur_pos.y};
    }
    setTimeout(collectPoints, 25);
  }
}

canvas.onmouseup = function(e){
  cursor = {
    hold: false,
    move: false,
    cur_pos: {x:0, y:0},
    prev_pos: false
  }
  canvas.onmousemove = function(e){
    //do nothing
  }
};

socket.on('connect',function(){
  console.log('connected to server');
})

socket.on('share', function (data) {
  var points = data.points;

  draw.beginPath();
  draw.lineWidth = 1;
  draw.moveTo(points[0].x , points[0].y );
  draw.lineTo(points[1].x , points[1].y );
  draw.stroke();
});

console.log(draw);
