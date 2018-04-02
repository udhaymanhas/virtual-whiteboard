var canvas = document.getElementById("canvas");
var draw = canvas.getContext("2d");
draw.moveTo(0, 0);
draw.lineTo(200, 100);
draw.stroke();

canvas.onmousedown = function(e){
  console.log('MouseDown ',e);
  canvas.onmousemove = function(e){
    console.log('Socket-> ',e);
  }
}

canvas.onmouseup = function(e){
  console.log('MouseUp ',e);
  canvas.onmousemove = function(e){
    console.log('Do nothing');
  }
  // $('#canvas').unbind('onmousemove');
};

var socket = io.connect();

socket.on('connect',function(){
  console.log('connected to server');
})

console.log(draw);
